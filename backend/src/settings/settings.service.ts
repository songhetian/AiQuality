import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

type RequestUser = {
  roles?: string[];
  deptId?: string | null;
};

type AiConfigPayload = {
  baseUrl?: string;
  apiKey?: string;
  chatModel?: string;
  embeddingModel?: string;
  timeoutMs?: number;
  retries?: number;
  vectorSize?: number;
};

const AI_CONFIG_DEFAULTS = {
  baseUrl: 'https://api.openai.com/v1',
  chatModel: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  timeoutMs: 15000,
  retries: 2,
  vectorSize: 1536,
} as const;

const AI_CONFIG_KEYS = {
  baseUrl: 'AI_BASE_URL',
  apiKey: 'AI_API_KEY',
  chatModel: 'AI_CHAT_MODEL',
  embeddingModel: 'AI_EMBEDDING_MODEL',
  timeoutMs: 'AI_HTTP_TIMEOUT_MS',
  retries: 'AI_HTTP_RETRIES',
  vectorSize: 'AI_VECTOR_SIZE',
} as const;

@Injectable()
export class SettingsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getAiConfig() {
    const configMap = await this.getSystemConfigMap(Object.values(AI_CONFIG_KEYS));
    return this.buildAiConfig(configMap);
  }

  async updateAiConfig(payload: AiConfigPayload) {
    const entries = [
      [AI_CONFIG_KEYS.baseUrl, String(payload.baseUrl || '').trim()],
      [AI_CONFIG_KEYS.apiKey, String(payload.apiKey || '').trim()],
      [AI_CONFIG_KEYS.chatModel, String(payload.chatModel || '').trim()],
      [AI_CONFIG_KEYS.embeddingModel, String(payload.embeddingModel || '').trim()],
      [AI_CONFIG_KEYS.timeoutMs, payload.timeoutMs !== undefined ? String(payload.timeoutMs) : ''],
      [AI_CONFIG_KEYS.retries, payload.retries !== undefined ? String(payload.retries) : ''],
      [AI_CONFIG_KEYS.vectorSize, payload.vectorSize !== undefined ? String(payload.vectorSize) : ''],
    ].filter(([, value]) => value !== '');

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.systemConfig.upsert({
          where: { key },
          update: { value, remark: 'AI 页面化配置' },
          create: { key, value, remark: 'AI 页面化配置' },
        }),
      ),
    );

    await this.redis.del('settings:ai-runtime-config');

    return this.getAiConfig();
  }

  async testAiConfig(payload: AiConfigPayload) {
    const runtimeConfig = await this.getRawAiConfig();
    const baseUrl = String(payload.baseUrl || runtimeConfig.baseUrl || '').trim();
    const apiKey = String(payload.apiKey || runtimeConfig.apiKey || '').trim();
    const timeoutMs =
      payload.timeoutMs !== undefined
        ? Number(payload.timeoutMs)
        : runtimeConfig.timeoutMs;

    if (!baseUrl) {
      throw new Error('AI Base URL 不能为空');
    }

    if (!apiKey && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      throw new Error('当前测试需要可用的 API Key');
    }

    const response = await axios.get(`${baseUrl.replace(/\/$/, '')}/models`, {
      timeout: timeoutMs,
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
      },
    });

    const models = Array.isArray(response.data?.data) ? response.data.data : [];
    return {
      success: true,
      baseUrl: this.maskBaseUrl(baseUrl),
      modelCount: models.length,
      message: models.length > 0 ? '连接成功，已获取模型列表' : '连接成功，服务已响应',
    };
  }

  async getOverview(user: RequestUser) {
    const isSuperAdmin = user.roles?.includes('SUPER_ADMIN');
    const deptId = user.deptId || undefined;

    const [knowledgeCount, activeRuleCount, chatSessionCount, userCount] =
      await Promise.all([
        this.prisma.knowledgeBase.count({
          where: isSuperAdmin ? undefined : { deptId },
        }),
        this.prisma.qualityRule.count({
          where: {
            status: 1,
            ...(isSuperAdmin ? {} : { OR: [{ deptId }, { deptId: null }] }),
          },
        }),
        this.prisma.chatSession.count({
          where: isSuperAdmin ? undefined : { deptId },
        }),
        this.prisma.user.count({
          where: isSuperAdmin ? undefined : { deptId },
        }),
      ]);

    const storageMimeTypes = this.parseList(
      this.configService.get<string>('MINIO_ALLOWED_MIME_TYPES'),
    );
    const knowledgeMimeTypes = this.parseList(
      this.configService.get<string>('KNOWLEDGE_ALLOWED_MIME_TYPES'),
    );

    const aiConfig = await this.getAiConfig();

    return {
      app: {
        name: '雷犀智能 AI 质检系统',
        env: this.configService.get<string>('NODE_ENV') || 'development',
        version: this.configService.get<string>('APP_VERSION') || 'v1.0.0',
      },
      overview: {
        knowledgeCount,
        activeRuleCount,
        chatSessionCount,
        userCount,
      },
      storage: {
        endpoint:
          this.configService.get<string>('MINIO_ENDPOINT') || '127.0.0.1',
        port: parseInt(
          this.configService.get<string>('MINIO_PORT') || '9000',
          10,
        ),
        bucket: this.configService.get<string>('MINIO_BUCKET') || 'ai-quality',
        useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
        maxUploadSizeMb: parseInt(
          this.configService.get<string>('MINIO_UPLOAD_MAX_SIZE_MB') || '50',
          10,
        ),
        presignedTtlSeconds: parseInt(
          this.configService.get<string>('MINIO_PRESIGNED_TTL') || '3600',
          10,
        ),
        allowedMimeTypes: storageMimeTypes,
      },
      knowledge: {
        maxUploadSizeMb: parseInt(
          this.configService.get<string>('KNOWLEDGE_UPLOAD_MAX_SIZE_MB') ||
            '20',
          10,
        ),
        allowedMimeTypes: knowledgeMimeTypes,
        chunkSize: 1200,
        chunkOverlap: 200,
      },
      ai: aiConfig,
      vectorStore: {
        qdrantUrl: this.maskBaseUrl(
          this.configService.get<string>('QDRANT_URL') ||
            'http://127.0.0.1:6333',
        ),
        vectorSize: aiConfig.vectorSize,
      },
    };
  }

  private parseList(rawValue?: string) {
    return String(rawValue || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private maskBaseUrl(value: string) {
    return value.replace(/:\/\/([^/@]+@)?/, '://');
  }

  private async getSystemConfigMap(keys: string[]) {
    const configs = await this.prisma.systemConfig.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });

    return new Map(configs.map((item) => [item.key, item.value]));
  }

  private async getRawAiConfig() {
    const configMap = await this.getSystemConfigMap(Object.values(AI_CONFIG_KEYS));
    return {
      baseUrl:
        configMap.get(AI_CONFIG_KEYS.baseUrl) ||
        this.configService.get<string>('AI_BASE_URL') ||
        AI_CONFIG_DEFAULTS.baseUrl,
      apiKey:
        configMap.get(AI_CONFIG_KEYS.apiKey) ||
        this.configService.get<string>('AI_API_KEY') ||
        '',
      chatModel:
        configMap.get(AI_CONFIG_KEYS.chatModel) ||
        this.configService.get<string>('AI_CHAT_MODEL') ||
        AI_CONFIG_DEFAULTS.chatModel,
      embeddingModel:
        configMap.get(AI_CONFIG_KEYS.embeddingModel) ||
        this.configService.get<string>('AI_EMBEDDING_MODEL') ||
        AI_CONFIG_DEFAULTS.embeddingModel,
      timeoutMs: parseInt(
        configMap.get(AI_CONFIG_KEYS.timeoutMs) ||
          this.configService.get<string>('AI_HTTP_TIMEOUT_MS') ||
          String(AI_CONFIG_DEFAULTS.timeoutMs),
        10,
      ),
      retries: parseInt(
        configMap.get(AI_CONFIG_KEYS.retries) ||
          this.configService.get<string>('AI_HTTP_RETRIES') ||
          String(AI_CONFIG_DEFAULTS.retries),
        10,
      ),
      vectorSize: parseInt(
        configMap.get(AI_CONFIG_KEYS.vectorSize) ||
          this.configService.get<string>('AI_VECTOR_SIZE') ||
          String(AI_CONFIG_DEFAULTS.vectorSize),
        10,
      ),
    };
  }

  private buildAiConfig(configMap: Map<string, string>) {
    const rawConfig = {
      baseUrl:
        configMap.get(AI_CONFIG_KEYS.baseUrl) ||
        this.configService.get<string>('AI_BASE_URL') ||
        AI_CONFIG_DEFAULTS.baseUrl,
      apiKey:
        configMap.get(AI_CONFIG_KEYS.apiKey) ||
        this.configService.get<string>('AI_API_KEY') ||
        '',
      chatModel:
        configMap.get(AI_CONFIG_KEYS.chatModel) ||
        this.configService.get<string>('AI_CHAT_MODEL') ||
        AI_CONFIG_DEFAULTS.chatModel,
      embeddingModel:
        configMap.get(AI_CONFIG_KEYS.embeddingModel) ||
        this.configService.get<string>('AI_EMBEDDING_MODEL') ||
        AI_CONFIG_DEFAULTS.embeddingModel,
      timeoutMs: parseInt(
        configMap.get(AI_CONFIG_KEYS.timeoutMs) ||
          this.configService.get<string>('AI_HTTP_TIMEOUT_MS') ||
          String(AI_CONFIG_DEFAULTS.timeoutMs),
        10,
      ),
      retries: parseInt(
        configMap.get(AI_CONFIG_KEYS.retries) ||
          this.configService.get<string>('AI_HTTP_RETRIES') ||
          String(AI_CONFIG_DEFAULTS.retries),
        10,
      ),
      vectorSize: parseInt(
        configMap.get(AI_CONFIG_KEYS.vectorSize) ||
          this.configService.get<string>('AI_VECTOR_SIZE') ||
          String(AI_CONFIG_DEFAULTS.vectorSize),
        10,
      ),
    };

    return {
      baseUrl: this.maskBaseUrl(rawConfig.baseUrl),
      chatModel: rawConfig.chatModel,
      embeddingModel: rawConfig.embeddingModel,
      timeoutMs: rawConfig.timeoutMs,
      retries: rawConfig.retries,
      vectorSize: rawConfig.vectorSize,
      apiKeyConfigured: Boolean(rawConfig.apiKey),
    };
  }
}
