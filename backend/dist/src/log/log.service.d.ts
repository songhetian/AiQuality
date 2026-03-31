import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class LogService {
    private prisma;
    constructor(prisma: PrismaService);
    sanitizeParams(payload: unknown): unknown;
    buildOperationMeta(method: string, path: string, body?: Record<string, any>): {
        operation: string;
        actionKind: string;
        targetType: string;
        targetId: string | null;
        targetCount: number | null;
    };
    createOperationLog(data: Prisma.OperationLogCreateInput): Promise<{
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
    }>;
    createSystemLog(data: Prisma.SystemLogCreateInput): Promise<{
        id: string;
        createTime: Date;
        level: string;
        module: string;
        message: string;
        stack: string | null;
    }>;
    findAllOperationLogs(query: any): Promise<{
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
    findAllSystemLogs(query: any): Promise<{
        id: string;
        createTime: Date;
        level: string;
        module: string;
        message: string;
        stack: string | null;
    }[]>;
    findSystemLogsPage(query: any): Promise<{
        total: number;
        list: {
            id: string;
            createTime: Date;
            level: string;
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
    findViolationLogs(query: any, user: any): Promise<{
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
    findViolationStats(query: any, user: any): Promise<{
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
    handleViolation(id: string, body: {
        status: number;
        handleRemark?: string;
    }, user: any): Promise<{
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
    handleViolationsBulk(body: {
        ids: string[];
        status: number;
        handleRemark?: string;
    }, user: any): Promise<{
        success: boolean;
        count: number;
    }>;
    private resolveRangeStart;
    private formatDay;
    private resolveViolationStatusLabel;
}
