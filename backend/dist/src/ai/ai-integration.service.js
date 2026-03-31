"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const redis_service_1 = require("../redis/redis.service");
const prisma_service_1 = require("../prisma/prisma.service");
const embeddingResponseSchema = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.object({
        embedding: zod_1.z.array(zod_1.z.number()),
    })),
});
const analysisResponseSchema = zod_1.z.object({
    score: zod_1.z.coerce.number().min(0).max(100),
    reason: zod_1.z.string().min(1),
    violations: zod_1.z.array(zod_1.z.string()).default([]),
});
const chatCompletionResponseSchema = zod_1.z.object({
    choices: zod_1.z
        .array(zod_1.z.object({
        message: zod_1.z.object({
            content: zod_1.z.string().nullable().optional(),
        }),
    }))
        .default([]),
});
let AiIntegrationService = AiIntegrationService_1 = class AiIntegrationService {
    configService;
    redisService;
    prisma;
    logger = new common_1.Logger(AiIntegrationService_1.name);
    httpClient;
    violationKeywords = [
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
    constructor(configService, redisService, prisma) {
        this.configService = configService;
        this.redisService = redisService;
        this.prisma = prisma;
        this.httpClient = axios_1.default.create({
            timeout: parseInt(this.configService.get('AI_HTTP_TIMEOUT_MS') || '15000', 10),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async getEmbedding(text) {
        const settings = await this.getAiRuntimeConfig();
        const apiKey = settings.apiKey;
        const baseUrl = settings.baseUrl;
        const model = settings.embeddingModel;
        const normalizedText = text.replace(/\n/g, ' ').trim();
        this.httpClient.defaults.timeout = settings.timeoutMs;
        if (!apiKey &&
            !baseUrl.includes('localhost') &&
            !baseUrl.includes('127.0.0.1')) {
            this.logger.warn('AI_API_KEY not found and not a local provider, using deterministic local vector.');
            return this.buildDeterministicEmbedding(normalizedText, settings.vectorSize);
        }
        const cacheKey = `ai:embedding:${model}:${this.hash(normalizedText)}`;
        return this.redisService.wrap(cacheKey, async () => {
            const response = await this.requestWithRetry(() => this.httpClient.post(`${baseUrl}/embeddings`, {
                input: normalizedText,
                model,
            }, {
                headers: {
                    Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
                },
            }), settings.retries);
            const parsed = embeddingResponseSchema.parse(response.data);
            return parsed.data[0].embedding;
        }, 24 * 60 * 60);
    }
    transcribeMedia(_buffer, mimeType) {
        return this.getAiRuntimeConfig().then((settings) => {
            if (!settings.apiKey) {
                this.logger.warn('AI_API_KEY not found, skipping ASR.');
                return '[未配置 API Key，跳过语音转写]';
            }
            this.logger.warn(`ASR provider not configured for ${mimeType}, returning explicit fallback text.`);
            return `[暂未接入 ${mimeType} 的自动转写服务]`;
        });
    }
    async analyzeSession(content, ruleId) {
        const settings = await this.getAiRuntimeConfig();
        const apiKey = settings.apiKey;
        const baseUrl = settings.baseUrl;
        const model = settings.chatModel;
        this.httpClient.defaults.timeout = settings.timeoutMs;
        if (!apiKey) {
            this.logger.warn('AI_API_KEY not found, using deterministic local fallback analysis.');
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
            return await this.redisService.wrap(cacheKey, async () => {
                const response = await this.requestWithRetry(() => this.httpClient.post(`${baseUrl}/chat/completions`, {
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                }, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }), settings.retries);
                const completion = chatCompletionResponseSchema.parse(response.data);
                const resContent = completion.choices[0]?.message?.content;
                const raw = typeof resContent === 'string'
                    ? JSON.parse(resContent)
                    : { score: 100, reason: '分析完成', violations: [] };
                const parsed = analysisResponseSchema.parse(raw);
                return {
                    score: parsed.score,
                    reason: parsed.reason,
                    violations: parsed.violations,
                    degraded: false,
                };
            }, 60 * 60);
        }
        catch (error) {
            const axiosError = error;
            this.logger.error('AI inspection request failed', axiosError.response?.data
                ? JSON.stringify(axiosError.response.data)
                : axiosError.message);
            return this.buildFallbackAnalysis(content, ruleId, 'REMOTE_FALLBACK');
        }
    }
    async requestWithRetry(request, maxRetries) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
            try {
                return await request();
            }
            catch (error) {
                lastError = error;
                const axiosError = error;
                const status = axiosError.response?.status;
                const retryable = !status || status === 408 || status === 429 || status >= 500;
                if (!retryable || attempt === maxRetries) {
                    throw error;
                }
                const delayMs = 500 * (attempt + 1);
                this.logger.warn(`AI request retry ${attempt + 1}/${maxRetries} after ${delayMs}ms: ${axiosError.message}`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        throw lastError;
    }
    hash(input) {
        return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
    }
    async getAiRuntimeConfig() {
        const cacheKey = 'settings:ai-runtime-config';
        return this.redisService.wrap(cacheKey, async () => {
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
                baseUrl: configMap.get('AI_BASE_URL') ||
                    this.configService.get('AI_BASE_URL') ||
                    'https://api.openai.com/v1',
                apiKey: configMap.get('AI_API_KEY') ||
                    this.configService.get('AI_API_KEY') ||
                    '',
                chatModel: configMap.get('AI_CHAT_MODEL') ||
                    this.configService.get('AI_CHAT_MODEL') ||
                    'gpt-4o-mini',
                embeddingModel: configMap.get('AI_EMBEDDING_MODEL') ||
                    this.configService.get('AI_EMBEDDING_MODEL') ||
                    'text-embedding-3-small',
                timeoutMs: parseInt(configMap.get('AI_HTTP_TIMEOUT_MS') ||
                    this.configService.get('AI_HTTP_TIMEOUT_MS') ||
                    '15000', 10),
                retries: parseInt(configMap.get('AI_HTTP_RETRIES') ||
                    this.configService.get('AI_HTTP_RETRIES') ||
                    '2', 10),
                vectorSize: parseInt(configMap.get('AI_VECTOR_SIZE') ||
                    this.configService.get('AI_VECTOR_SIZE') ||
                    '1536', 10),
            };
        }, 60);
    }
    buildDeterministicEmbedding(text, size) {
        const safeSize = Number.isFinite(size) && size > 0 ? size : 1536;
        const vector = new Array(safeSize);
        const normalized = text.trim() || '[empty]';
        for (let index = 0; index < safeSize; index += 1) {
            const hash = this.hash(`${normalized}:${index}`);
            const segment = hash.slice(0, 8);
            const value = parseInt(segment, 16) / 0xffffffff;
            vector[index] = Number((value * 2 - 1).toFixed(6));
        }
        return vector;
    }
    buildFallbackAnalysis(content, ruleId, reasonCode) {
        const normalized = content.toLowerCase();
        const matchedViolations = this.violationKeywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
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
};
exports.AiIntegrationService = AiIntegrationService;
exports.AiIntegrationService = AiIntegrationService = AiIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_service_1.RedisService,
        prisma_service_1.PrismaService])
], AiIntegrationService);
//# sourceMappingURL=ai-integration.service.js.map