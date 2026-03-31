import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
export declare class QualityService {
    private readonly prisma;
    private readonly redis;
    private readonly configService;
    private readonly qualityQueue;
    constructor(prisma: PrismaService, redis: RedisService, configService: ConfigService, qualityQueue: Queue);
    startBatchQuality(deptId: string, sessionIds: string[], ruleId: string): Promise<{
        taskId: string;
        total: number;
        status: string;
    }>;
    findAllInspections(query: any, user: any): Promise<{
        total: number;
        list: {
            manualReviewNeeded: boolean;
            qualitySummary: string;
            session: {
                status: number;
                id: string;
                userId: string | null;
                platformId: string;
                deptId: string;
                createTime: Date;
                sessionId: string;
                shopId: string;
                interfaceId: string;
                startTime: Date;
                endTime: Date | null;
                updateTime: Date;
            };
            rule: {
                status: number;
                id: string;
                deptId: string | null;
                createTime: Date;
                name: string;
                updateTime: Date;
                sensitiveWords: string | null;
                violationScenes: string | null;
                scoreStandard: string | null;
                tagMatchRules: string | null;
            };
            status: number;
            id: string;
            createTime: Date;
            sessionId: string;
            updateTime: Date;
            aiScore: number | null;
            aiResult: string | null;
            manualScore: number | null;
            manualResult: string | null;
            inspectorId: string | null;
            ruleId: string;
            rectifyOpinion: string | null;
        }[];
    }>;
    findDetail(id: string, user?: any): Promise<{
        aiMeta: {
            retryCount?: number;
            lastFailedAt?: string;
            lastRetriedAt?: string;
            lastSucceededAt?: string;
        } | null;
        manualReviewNeeded: boolean;
        qualitySummary: string;
        session: {
            records: {
                id: string;
                createTime: Date;
                sessionId: string;
                content: string;
                senderType: string;
                sendTime: Date;
                senderId: string | null;
                contentType: string;
                vectorId: string | null;
            }[];
        } & {
            status: number;
            id: string;
            userId: string | null;
            platformId: string;
            deptId: string;
            createTime: Date;
            sessionId: string;
            shopId: string;
            interfaceId: string;
            startTime: Date;
            endTime: Date | null;
            updateTime: Date;
        };
        rule: {
            status: number;
            id: string;
            deptId: string | null;
            createTime: Date;
            name: string;
            updateTime: Date;
            sensitiveWords: string | null;
            violationScenes: string | null;
            scoreStandard: string | null;
            tagMatchRules: string | null;
        };
        status: number;
        id: string;
        createTime: Date;
        sessionId: string;
        updateTime: Date;
        aiScore: number | null;
        aiResult: string | null;
        manualScore: number | null;
        manualResult: string | null;
        inspectorId: string | null;
        ruleId: string;
        rectifyOpinion: string | null;
    } | null>;
    findActiveRules(user: any): Promise<{
        id: string;
        deptId: string | null;
        name: string;
    }[]>;
    updateInspection(id: string, data: any): Promise<{
        status: number;
        id: string;
        createTime: Date;
        sessionId: string;
        updateTime: Date;
        aiScore: number | null;
        aiResult: string | null;
        manualScore: number | null;
        manualResult: string | null;
        inspectorId: string | null;
        ruleId: string;
        rectifyOpinion: string | null;
    }>;
    batchUpdateInspections(body: any, user: any): Promise<{
        count: number;
        status: number;
        manualScore: number | null;
        manualResult: string | null;
        inspectorId: any;
    }>;
    retryInspection(id: string, user?: any): Promise<{
        taskId: string;
        status: string;
    }>;
    lockReview(sessionId: string, userId: string, username: string): Promise<{
        success: boolean;
        owner?: string;
    }>;
    unlockReview(sessionId: string, userId: string): Promise<void>;
    private resolveManualReviewNeeded;
    private resolveQualitySummary;
}
