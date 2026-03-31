import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AiIntegrationService } from '../ai/ai-integration.service';
import { SocketGateway } from '../socket/socket.gateway';
import { TagMatchingService } from '../tag/tag-matching.service';
import { RedisService } from '../redis/redis.service';
export declare class QualityProcessor {
    private readonly prisma;
    private readonly aiService;
    private readonly tagService;
    private readonly redisService;
    private readonly socketGateway;
    private readonly logger;
    private resolveQualitySummary;
    constructor(prisma: PrismaService, aiService: AiIntegrationService, tagService: TagMatchingService, redisService: RedisService, socketGateway: SocketGateway);
    handleAnalysis(job: Job<{
        sessionId: string;
        ruleId: string;
        taskId: string;
        total: number;
        batchLockKey?: string;
        progressKey?: string;
        retryLockKey?: string;
    }>): Promise<void>;
}
