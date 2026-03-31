import { InsightService } from './insight.service';
export declare class AiController {
    private readonly insightService;
    constructor(insightService: InsightService);
    getHighFreqQuestions(query: any): Promise<{
        total: number;
        list: ({
            tag: {
                id: string;
                createTime: Date;
                name: string;
                color: string | null;
            } | null;
        } & {
            id: string;
            userId: string | null;
            createTime: Date;
            content: string;
            statDate: Date;
            count: number;
            productId: string | null;
            tagId: string | null;
        })[];
        page: number;
        pageSize: number;
    }>;
    getHighFreqQuestionTags(): Promise<{
        id: string;
        name: string;
        color: string | null;
    }[]>;
    getLossAnalysis(query: any, req: any): Promise<{
        total: number;
        list: any[];
        page: number;
        pageSize: number;
        summary: {
            consultCount: number;
            retainedCount: number;
            lostCount: number;
            lossRate: number;
        };
    }>;
    getLossStats(query: any, req: any): Promise<{
        trend: {
            date: string;
            lost: number;
            retained: number;
        }[];
        reasonDistribution: {
            name: string;
            value: number;
        }[];
        shopRanking: {
            name: string;
            value: number;
        }[];
        followUpDistribution: {
            name: string;
            value: number;
        }[];
    }>;
    analyzeLoss(sessionId: string): Promise<{
        followUpStatus: number;
        id: string;
        userId: string | null;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        sessionId: string;
        shopId: string | null;
        interfaceId: string | null;
        updateTime: Date;
        reason: string | null;
        productId: string | null;
        isLost: boolean;
        lastSenderType: string | null;
        customerMessageCount: number;
        agentMessageCount: number;
        sessionDurationMinutes: number;
        inactiveMinutes: number;
        waitMinutes: number;
        confidence: number | null;
        analyzeVersion: string;
        followUpRemark: string | null;
        followUpBy: string | null;
        followUpTime: Date | null;
    } | null>;
    updateLossFollowUp(id: string, body: any, req: any): Promise<{
        followUpStatus: number;
        id: string;
        userId: string | null;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        sessionId: string;
        shopId: string | null;
        interfaceId: string | null;
        updateTime: Date;
        reason: string | null;
        productId: string | null;
        isLost: boolean;
        lastSenderType: string | null;
        customerMessageCount: number;
        agentMessageCount: number;
        sessionDurationMinutes: number;
        inactiveMinutes: number;
        waitMinutes: number;
        confidence: number | null;
        analyzeVersion: string;
        followUpRemark: string | null;
        followUpBy: string | null;
        followUpTime: Date | null;
    }>;
    batchUpdateLossFollowUp(body: any, req: any): Promise<{
        count: number;
        followUpStatus: number;
        followUpRemark: string | null;
        followUpBy: any;
        followUpTime: Date;
    }>;
    getLossRule(query: any, req: any): Promise<{
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        createTime: Date;
        name: string;
        shopId: string | null;
        updateTime: Date;
        remark: string | null;
        waitMinutes: number;
        minCustomerMessages: number;
        replyTimeoutMinutes: number | null;
        orderWindowMinutes: number | null;
    } | {
        name: string;
        waitMinutes: number;
        platformId: any;
        status: number;
    }>;
    saveLossRule(body: any, req: any): Promise<{
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        createTime: Date;
        name: string;
        shopId: string | null;
        updateTime: Date;
        remark: string | null;
        waitMinutes: number;
        minCustomerMessages: number;
        replyTimeoutMinutes: number | null;
        orderWindowMinutes: number | null;
    }>;
}
