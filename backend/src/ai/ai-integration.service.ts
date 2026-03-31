import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { createHash } from 'crypto';
import { z } from 'zod';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

export interface AiAnalysisResult {
  score: number;
  reason: string;
  violations: string[];
  degraded?: boolean;
}

const embeddingResponseSchema = z.object({
  data: z.array(
    z.object({
      embedding: z.array(z.number()),
    }),
  ),
});

const analysisResponseSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  reason: z.string().min(1),
  violations: z.array(z.string()).default([]),
});

const chatCompletionResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable().optional(),
        }),
      }),
    )
    .default([]),
});

@Injectable()
export class AiIntegrationService {
  private readonly logger = new Logger(AiIntegrationService.name);
  private readonly httpClient: AxiosInstance;
  private readonly violationKeywords = [
    '退款',
    '退货',
    '投诉',
    '辱骂',
    '差评',
    '威胁',
    '赔偿',
    '私下转账',
    '返现',
    '加微信',
    '线下交易',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.httpClient = axios.create({
      timeout: parseInt(
        this.configService.get<string>('AI_HTTP_TIMEOUT_MS') || '15000',
        10,
      ),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
    const settings = await this.getAiRuntimeConfig();
    const apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl;
    const model = settings.embeddingModel;
    const normalizedText = text.replace(/\n/g, ' ').trim();
    this.httpClient.defaults.timeout = settings.timeoutMs;

    if (
      !apiKey &&
      !baseUrl.includes('localhost') &&
      !baseUrl.includes('127.0.0.1')
    ) {
      this.logger.warn(
        'AI_API_KEY not found and not a local provider, using deterministic local vector.',
      );
      return this.buildDeterministicEmbedding(normalizedText, settings.vectorSize);
    }

    const cacheKey = `ai:embedding:${model}:${this.hash(normalizedText)}`;
    return this.redisService.wrap(
      cacheKey,
      async () => {
        const response = await this.requestWithRetry(() =>
          this.httpClient.post(
            `${baseUrl}/embeddings`,
            {
              input: normalizedText,
              model,
            },
            {
              headers: {
                Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
              },
            },
          ),
          settings.retries,
        );

        const parsed = embeddingResponseSchema.parse(response.data);
        return parsed.data[0].embedding;
      },
      24 * 60 * 60,
    );
  }

  transcribeMedia(_buffer: Buffer, mimeType: string): Promise<string> {
    return this.getAiRuntimeConfig().then((settings) => {
      if (!settings.apiKey) {
        this.logger.warn('AI_API_KEY not found, skipping ASR.');
        return '[未配置 API Key，跳过语音转写]';
      }

      this.logger.warn(
        `ASR provider not configured for ${mimeType}, returning explicit fallback text.`,
      );
      return `[暂未接入 ${mimeType} 的自动转写服务]`;
    });
  }

  async analyzeSession(
    content: string,
    ruleId?: string,
  ): Promise<AiAnalysisResult> {
    const settings = await this.getAiRuntimeConfig();
    const apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl;
    const model = settings.chatModel;
    this.httpClient.defaults.timeout = settings.timeoutMs;

    if (!apiKey) {
      this.logger.warn(
        'AI_API_KEY not found, using deterministic local fallback analysis.',
      );
      return this.buildFallbackAnalysis(content, ruleId, 'LOCAL_NO_API_KEY');
    }

    const prompt = [
      '你是一个专业的客服质检专家，请分析下面的客服对话。',
      ruleId ? `质检规则 ID: ${ruleId}` : '质检规则 ID: default',
      '输出 JSON，字段包含：score(number)、reason(string)、violations(string[])。',
      '评分满分 100 分；如果没有明显违规，violations 返回空数组。',
      '',
      '对话内容：',
      content,
    ].join('\n');

    const cacheKey = `ai:inspection:${model}:${this.hash(`${ruleId || 'default'}:${content}`)}`;

    try {
      return await this.redisService.wrap(
        cacheKey,
        async () => {
          const response = await this.requestWithRetry(() =>
            this.httpClient.post(
              `${baseUrl}/chat/completions`,
              {
                model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
              },
              {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                },
              },
            ),
            settings.retries,
          );

          const completion = chatCompletionResponseSchema.parse(response.data);
          const resContent = completion.choices[0]?.message?.content;
          const raw: unknown =
            typeof resContent === 'string'
              ? JSON.parse(resContent)
              : { score: 100, reason: '分析完成', violations: [] };

          const parsed = analysisResponseSchema.parse(raw);
          return {
            score: parsed.score,
            reason: parsed.reason,
            violations: parsed.violations,
            degraded: false,
          };
        },
        60 * 60,
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        'AI inspection request failed',
        axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message,
      );
      return this.buildFallbackAnalysis(content, ruleId, 'REMOTE_FALLBACK');
    }
  }

  private async requestWithRetry<T>(
    request: () => Promise<T>,
    maxRetries: number,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        return await request();
      } catch (error) {
        lastError = error;
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const retryable =
          !status || status === 408 || status === 429 || status >= 500;

        if (!retryable || attempt === maxRetries) {
          throw error;
        }

        const delayMs = 500 * (attempt + 1);
        this.logger.warn(
          `AI request retry ${attempt + 1}/${maxRetries} after ${delayMs}ms: ${axiosError.message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  private hash(input: string) {
    return createHash('sha256').update(input).digest('hex');
  }

  private async getAiRuntimeConfig() {
    const cacheKey = 'settings:ai-runtime-config';
    return this.redisService.wrap(
      cacheKey,
      async () => {
        const keys = [
          'AI_BASE_URL',
          'AI_API_KEY',
          'AI_CHAT_MODEL',
          'AI_EMBEDDING_MODEL',
          'AI_HTTP_TIMEOUT_MS',
          'AI_HTTP_RETRIES',
          'AI_VECTOR_SIZE',
        ];
        const rows = await this.prisma.systemConfig.findMany({
          where: {
            key: {
              in: keys,
            },
          },
        });
        const configMap = new Map(rows.map((item) => [item.key, item.value]));

        return {
          baseUrl:
            configMap.get('AI_BASE_URL') ||
            this.configService.get<string>('AI_BASE_URL') ||
            'https://api.openai.com/v1',
          apiKey:
            configMap.get('AI_API_KEY') ||
            this.configService.get<string>('AI_API_KEY') ||
            '',
          chatModel:
            configMap.get('AI_CHAT_MODEL') ||
            this.configService.get<string>('AI_CHAT_MODEL') ||
            'gpt-4o-mini',
          embeddingModel:
            configMap.get('AI_EMBEDDING_MODEL') ||
            this.configService.get<string>('AI_EMBEDDING_MODEL') ||
            'text-embedding-3-small',
          timeoutMs: parseInt(
            configMap.get('AI_HTTP_TIMEOUT_MS') ||
              this.configService.get<string>('AI_HTTP_TIMEOUT_MS') ||
              '15000',
            10,
          ),
          retries: parseInt(
            configMap.get('AI_HTTP_RETRIES') ||
              this.configService.get<string>('AI_HTTP_RETRIES') ||
              '2',
            10,
          ),
          vectorSize: parseInt(
            configMap.get('AI_VECTOR_SIZE') ||
              this.configService.get<string>('AI_VECTOR_SIZE') ||
              '1536',
            10,
          ),
        };
      },
      60,
    );
  }

  private buildDeterministicEmbedding(text: string, size: number) {
    const safeSize = Number.isFinite(size) && size > 0 ? size : 1536;
    const vector = new Array<number>(safeSize);
    const normalized = text.trim() || '[empty]';

    for (let index = 0; index < safeSize; index += 1) {
      const hash = this.hash(`${normalized}:${index}`);
      const segment = hash.slice(0, 8);
      const value = parseInt(segment, 16) / 0xffffffff;
      vector[index] = Number((value * 2 - 1).toFixed(6));
    }

    return vector;
  }

  private buildFallbackAnalysis(
    content: string,
    ruleId: string | undefined,
    reasonCode: 'LOCAL_NO_API_KEY' | 'REMOTE_FALLBACK',
  ): AiAnalysisResult {
    const normalized = content.toLowerCase();
    const matchedViolations = this.violationKeywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    const messageCount = content
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean).length;

    let score = 88;
    score -= Math.min(35, matchedViolations.length * 12);
    if (messageCount < 3) {
      score -= 8;
    }
    if (normalized.includes('customer:') && !normalized.includes('agent:')) {
      score -= 10;
    }

    const finalScore = Math.max(0, Math.min(100, score));
    const reasonParts = [
      reasonCode === 'LOCAL_NO_API_KEY'
        ? '未配置外部 AI，已使用本地规则化降级分析'
        : '外部 AI 调用失败，已回退到本地规则化分析',
      ruleId ? `规则 ${ruleId}` : '默认规则',
      matchedViolations.length > 0
        ? `命中 ${matchedViolations.length} 个风险关键词`
        : '未命中显著风险关键词',
      `共识别 ${messageCount} 条对话片段`,
    ];

    return {
      score: finalScore,
      reason: reasonParts.join('；'),
      violations: matchedViolations,
      degraded: true,
    };
  }
}
