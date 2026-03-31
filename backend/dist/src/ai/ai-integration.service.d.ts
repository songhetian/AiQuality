import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
export interface AiAnalysisResult {
    score: number;
    reason: string;
    violations: string[];
    degraded?: boolean;
}
export declare class AiIntegrationService {
    private readonly configService;
    private readonly redisService;
    private readonly prisma;
    private readonly logger;
    private readonly httpClient;
    private readonly violationKeywords;
    constructor(configService: ConfigService, redisService: RedisService, prisma: PrismaService);
    getEmbedding(text: string): Promise<number[]>;
    transcribeMedia(_buffer: Buffer, mimeType: string): Promise<string>;
    analyzeSession(content: string, ruleId?: string): Promise<AiAnalysisResult>;
    private requestWithRetry;
    private hash;
    private getAiRuntimeConfig;
    private buildDeterministicEmbedding;
    private buildFallbackAnalysis;
}
