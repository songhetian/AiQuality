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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const AI_CONFIG_DEFAULTS = {
    baseUrl: 'https://api.openai.com/v1',
    chatModel: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    timeoutMs: 15000,
    retries: 2,
    vectorSize: 1536,
};
const AI_CONFIG_KEYS = {
    baseUrl: 'AI_BASE_URL',
    apiKey: 'AI_API_KEY',
    chatModel: 'AI_CHAT_MODEL',
    embeddingModel: 'AI_EMBEDDING_MODEL',
    timeoutMs: 'AI_HTTP_TIMEOUT_MS',
    retries: 'AI_HTTP_RETRIES',
    vectorSize: 'AI_VECTOR_SIZE',
};
let SettingsService = class SettingsService {
    configService;
    prisma;
    redis;
    constructor(configService, prisma, redis) {
        this.configService = configService;
        this.prisma = prisma;
        this.redis = redis;
    }
    async getAiConfig() {
        const configMap = await this.getSystemConfigMap(Object.values(AI_CONFIG_KEYS));
        return this.buildAiConfig(configMap);
    }
    async updateAiConfig(payload) {
        const entries = [
            [AI_CONFIG_KEYS.baseUrl, String(payload.baseUrl || '').trim()],
            [AI_CONFIG_KEYS.apiKey, String(payload.apiKey || '').trim()],
            [AI_CONFIG_KEYS.chatModel, String(payload.chatModel || '').trim()],
            [AI_CONFIG_KEYS.embeddingModel, String(payload.embeddingModel || '').trim()],
            [AI_CONFIG_KEYS.timeoutMs, payload.timeoutMs !== undefined ? String(payload.timeoutMs) : ''],
            [AI_CONFIG_KEYS.retries, payload.retries !== undefined ? String(payload.retries) : ''],
            [AI_CONFIG_KEYS.vectorSize, payload.vectorSize !== undefined ? String(payload.vectorSize) : ''],
        ].filter(([, value]) => value !== '');
        await this.prisma.$transaction(entries.map(([key, value]) => this.prisma.systemConfig.upsert({
            where: { key },
            update: { value, remark: 'AI 页面化配置' },
            create: { key, value, remark: 'AI 页面化配置' },
        })));
        await this.redis.del('settings:ai-runtime-config');
        return this.getAiConfig();
    }
    async testAiConfig(payload) {
        const runtimeConfig = await this.getRawAiConfig();
        const baseUrl = String(payload.baseUrl || runtimeConfig.baseUrl || '').trim();
        const apiKey = String(payload.apiKey || runtimeConfig.apiKey || '').trim();
        const timeoutMs = payload.timeoutMs !== undefined
            ? Number(payload.timeoutMs)
            : runtimeConfig.timeoutMs;
        if (!baseUrl) {
            throw new Error('AI Base URL 不能为空');
        }
        if (!apiKey && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
            throw new Error('当前测试需要可用的 API Key');
        }
        const response = await axios_1.default.get(`${baseUrl.replace(/\/$/, '')}/models`, {
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
    async getOverview(user) {
        const isSuperAdmin = user.roles?.includes('SUPER_ADMIN');
        const deptId = user.deptId || undefined;
        const [knowledgeCount, activeRuleCount, chatSessionCount, userCount] = await Promise.all([
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
        const storageMimeTypes = this.parseList(this.configService.get('MINIO_ALLOWED_MIME_TYPES'));
        const knowledgeMimeTypes = this.parseList(this.configService.get('KNOWLEDGE_ALLOWED_MIME_TYPES'));
        const aiConfig = await this.getAiConfig();
        return {
            app: {
                name: '雷犀智能 AI 质检系统',
                env: this.configService.get('NODE_ENV') || 'development',
                version: this.configService.get('APP_VERSION') || 'v1.0.0',
            },
            overview: {
                knowledgeCount,
                activeRuleCount,
                chatSessionCount,
                userCount,
            },
            storage: {
                endpoint: this.configService.get('MINIO_ENDPOINT') || '127.0.0.1',
                port: parseInt(this.configService.get('MINIO_PORT') || '9000', 10),
                bucket: this.configService.get('MINIO_BUCKET') || 'ai-quality',
                useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
                maxUploadSizeMb: parseInt(this.configService.get('MINIO_UPLOAD_MAX_SIZE_MB') || '50', 10),
                presignedTtlSeconds: parseInt(this.configService.get('MINIO_PRESIGNED_TTL') || '3600', 10),
                allowedMimeTypes: storageMimeTypes,
            },
            knowledge: {
                maxUploadSizeMb: parseInt(this.configService.get('KNOWLEDGE_UPLOAD_MAX_SIZE_MB') ||
                    '20', 10),
                allowedMimeTypes: knowledgeMimeTypes,
                chunkSize: 1200,
                chunkOverlap: 200,
            },
            ai: aiConfig,
            vectorStore: {
                qdrantUrl: this.maskBaseUrl(this.configService.get('QDRANT_URL') ||
                    'http://127.0.0.1:6333'),
                vectorSize: aiConfig.vectorSize,
            },
        };
    }
    parseList(rawValue) {
        return String(rawValue || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    maskBaseUrl(value) {
        return value.replace(/:\/\/([^/@]+@)?/, '://');
    }
    async getSystemConfigMap(keys) {
        const configs = await this.prisma.systemConfig.findMany({
            where: {
                key: {
                    in: keys,
                },
            },
        });
        return new Map(configs.map((item) => [item.key, item.value]));
    }
    async getRawAiConfig() {
        const configMap = await this.getSystemConfigMap(Object.values(AI_CONFIG_KEYS));
        return {
            baseUrl: configMap.get(AI_CONFIG_KEYS.baseUrl) ||
                this.configService.get('AI_BASE_URL') ||
                AI_CONFIG_DEFAULTS.baseUrl,
            apiKey: configMap.get(AI_CONFIG_KEYS.apiKey) ||
                this.configService.get('AI_API_KEY') ||
                '',
            chatModel: configMap.get(AI_CONFIG_KEYS.chatModel) ||
                this.configService.get('AI_CHAT_MODEL') ||
                AI_CONFIG_DEFAULTS.chatModel,
            embeddingModel: configMap.get(AI_CONFIG_KEYS.embeddingModel) ||
                this.configService.get('AI_EMBEDDING_MODEL') ||
                AI_CONFIG_DEFAULTS.embeddingModel,
            timeoutMs: parseInt(configMap.get(AI_CONFIG_KEYS.timeoutMs) ||
                this.configService.get('AI_HTTP_TIMEOUT_MS') ||
                String(AI_CONFIG_DEFAULTS.timeoutMs), 10),
            retries: parseInt(configMap.get(AI_CONFIG_KEYS.retries) ||
                this.configService.get('AI_HTTP_RETRIES') ||
                String(AI_CONFIG_DEFAULTS.retries), 10),
            vectorSize: parseInt(configMap.get(AI_CONFIG_KEYS.vectorSize) ||
                this.configService.get('AI_VECTOR_SIZE') ||
                String(AI_CONFIG_DEFAULTS.vectorSize), 10),
        };
    }
    buildAiConfig(configMap) {
        const rawConfig = {
            baseUrl: configMap.get(AI_CONFIG_KEYS.baseUrl) ||
                this.configService.get('AI_BASE_URL') ||
                AI_CONFIG_DEFAULTS.baseUrl,
            apiKey: configMap.get(AI_CONFIG_KEYS.apiKey) ||
                this.configService.get('AI_API_KEY') ||
                '',
            chatModel: configMap.get(AI_CONFIG_KEYS.chatModel) ||
                this.configService.get('AI_CHAT_MODEL') ||
                AI_CONFIG_DEFAULTS.chatModel,
            embeddingModel: configMap.get(AI_CONFIG_KEYS.embeddingModel) ||
                this.configService.get('AI_EMBEDDING_MODEL') ||
                AI_CONFIG_DEFAULTS.embeddingModel,
            timeoutMs: parseInt(configMap.get(AI_CONFIG_KEYS.timeoutMs) ||
                this.configService.get('AI_HTTP_TIMEOUT_MS') ||
                String(AI_CONFIG_DEFAULTS.timeoutMs), 10),
            retries: parseInt(configMap.get(AI_CONFIG_KEYS.retries) ||
                this.configService.get('AI_HTTP_RETRIES') ||
                String(AI_CONFIG_DEFAULTS.retries), 10),
            vectorSize: parseInt(configMap.get(AI_CONFIG_KEYS.vectorSize) ||
                this.configService.get('AI_VECTOR_SIZE') ||
                String(AI_CONFIG_DEFAULTS.vectorSize), 10),
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map