import { ConfigService } from '@nestjs/config';
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
export declare class SettingsService {
    private readonly configService;
    private readonly prisma;
    private readonly redis;
    constructor(configService: ConfigService, prisma: PrismaService, redis: RedisService);
    getAiConfig(): Promise<{
        baseUrl: string;
        chatModel: string;
        embeddingModel: string;
        timeoutMs: number;
        retries: number;
        vectorSize: number;
        apiKeyConfigured: boolean;
    }>;
    updateAiConfig(payload: AiConfigPayload): Promise<{
        baseUrl: string;
        chatModel: string;
        embeddingModel: string;
        timeoutMs: number;
        retries: number;
        vectorSize: number;
        apiKeyConfigured: boolean;
    }>;
    testAiConfig(payload: AiConfigPayload): Promise<{
        success: boolean;
        baseUrl: string;
        modelCount: any;
        message: string;
    }>;
    getOverview(user: RequestUser): Promise<{
        app: {
            name: string;
            env: string;
            version: string;
        };
        overview: {
            knowledgeCount: number;
            activeRuleCount: number;
            chatSessionCount: number;
            userCount: number;
        };
        storage: {
            endpoint: string;
            port: number;
            bucket: string;
            useSSL: boolean;
            maxUploadSizeMb: number;
            presignedTtlSeconds: number;
            allowedMimeTypes: string[];
        };
        knowledge: {
            maxUploadSizeMb: number;
            allowedMimeTypes: string[];
            chunkSize: number;
            chunkOverlap: number;
        };
        ai: {
            baseUrl: string;
            chatModel: string;
            embeddingModel: string;
            timeoutMs: number;
            retries: number;
            vectorSize: number;
            apiKeyConfigured: boolean;
        };
        vectorStore: {
            qdrantUrl: string;
            vectorSize: number;
        };
    }>;
    private parseList;
    private maskBaseUrl;
    private getSystemConfigMap;
    private getRawAiConfig;
    private buildAiConfig;
}
export {};
