import { LogService } from './log.service';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    findOperationLogs(query: any): Promise<{
        path: string;
        params: string | null;
        status: number;
        id: string;
        userId: string | null;
        username: string | null;
        platformId: string | null;
        deptId: string | null;
        operation: string;
        actionKind: string | null;
        targetType: string | null;
        targetId: string | null;
        targetCount: number | null;
        method: string;
        ip: string | null;
        responseTime: number;
        createTime: Date;
    }[]>;
    findOperationLogsPage(query: any): Promise<{
        total: number;
        list: {
            path: string;
            params: string | null;
            status: number;
            id: string;
            userId: string | null;
            username: string | null;
            platformId: string | null;
            deptId: string | null;
            operation: string;
            actionKind: string | null;
            targetType: string | null;
            targetId: string | null;
            targetCount: number | null;
            method: string;
            ip: string | null;
            responseTime: number;
            createTime: Date;
        }[];
        page: number;
        pageSize: number;
    }>;
    findSystemLogs(query: any): Promise<{
        level: string;
        id: string;
        createTime: Date;
        module: string;
        message: string;
        stack: string | null;
    }[]>;
    findSystemLogsPage(query: any): Promise<{
        total: number;
        list: {
            level: string;
            id: string;
            createTime: Date;
            module: string;
            message: string;
            stack: string | null;
        }[];
        page: number;
        pageSize: number;
    }>;
    findSystemLogsStats(query: any): Promise<{
        trend: {
            date: string;
            value: number;
        }[];
        levelDistribution: {
            name: string;
            value: number;
        }[];
        moduleDistribution: {
            name: string;
            value: number;
        }[];
        stackCount: number;
    }>;
    findViolationLogs(query: any, req: any): Promise<{
        total: number;
        list: ({
            username: string | null;
            userId: string | null;
            statusLabel: string;
            keyword: string;
            status: number;
            id: string;
            platformId: string | null;
            deptId: string;
            createTime: Date;
            sessionId: string;
            recordId: string | null;
            shopId: string | null;
            matchedText: string | null;
            alertType: string;
            content: string;
            handleRemark: string | null;
            handleBy: string | null;
            handleTime: Date | null;
        } | null)[];
        page: number;
        pageSize: number;
    }>;
    findViolationStats(query: any, req: any): Promise<{
        trend: {
            date: string;
            value: number;
        }[];
        topKeywords: {
            name: string;
            value: number;
        }[];
        hourlyDistribution: {
            hour: string;
            value: number;
        }[];
        agentRanking: {
            name: string;
            value: number;
            userId: string | null;
        }[];
        statusDistribution: {
            name: string;
            value: number;
        }[];
    }>;
    handleViolation(id: string, body: any, req: any): Promise<{
        keyword: string;
        status: number;
        id: string;
        userId: string | null;
        platformId: string | null;
        deptId: string;
        createTime: Date;
        sessionId: string;
        recordId: string | null;
        shopId: string | null;
        matchedText: string | null;
        alertType: string;
        content: string;
        handleRemark: string | null;
        handleBy: string | null;
        handleTime: Date | null;
    }>;
    handleViolationsBulk(body: any, req: any): Promise<{
        success: boolean;
        count: number;
    }>;
}
