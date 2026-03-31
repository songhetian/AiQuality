import { QualityService } from './quality.service';
export declare class QualityController {
    private readonly qualityService;
    constructor(qualityService: QualityService);
    findAll(query: any, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    findActiveRules(req: any): Promise<{
        id: string;
        deptId: string | null;
        name: string;
    }[]>;
    startBatch(body: any, req: any): Promise<{
        taskId: string;
        total: number;
        status: string;
    }>;
    lockReview(sessionId: string, req: any): Promise<{
        message: string;
    }>;
    unlockReview(sessionId: string, req: any): Promise<{
        message: string;
    }>;
    retry(id: string, req: any): Promise<{
        taskId: string;
        status: string;
    }>;
    update(id: string, data: any, req: any): Promise<{
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
    batchUpdate(data: any, req: any): Promise<{
        count: number;
        status: number;
        manualScore: number | null;
        manualResult: string | null;
        inspectorId: any;
    }>;
}
