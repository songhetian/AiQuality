import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
type CostScope = {
    deptId?: string;
};
export declare class CostService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    recordAiCall(data: {
        platformId: string;
        deptId: string;
        shopId: string;
        aiPlatformId: string;
        duration?: number;
    }): Promise<{
        id: string;
        platformId: string;
        deptId: string;
        createTime: Date;
        shopId: string;
        aiPlatformId: string;
        callCount: number;
        duration: number;
        totalCost: number;
        statDate: Date;
    } | null>;
    getSummaryStats(deptId?: string): Promise<{
        totalCost: number;
        callCount: number;
        avgUnitPrice: number;
        highestDept: string;
        highestDeptCost: number;
    }>;
    getTrendStats(days: number, scope?: CostScope): Promise<(import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.CostStatisticsGroupByOutputType, "statDate"[]> & {
        _sum: {
            totalCost: number | null;
            callCount: number | null;
        };
    })[]>;
    getDeptDistribution(days: number, scope?: CostScope): Promise<{
        deptId: string;
        name: string;
        totalCost: number;
        callCount: number;
    }[]>;
    getPlatformDistribution(days: number, scope?: CostScope): Promise<{
        aiPlatformId: string;
        name: string;
        totalCost: number;
        callCount: number;
    }[]>;
    setBillingRule(data: any): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        aiPlatformId: string;
        billingType: string;
        unitPrice: number;
    }>;
    getStatistics(query: any): Promise<{
        id: string;
        platformId: string;
        deptId: string;
        createTime: Date;
        shopId: string;
        aiPlatformId: string;
        callCount: number;
        duration: number;
        totalCost: number;
        statDate: Date;
    }[]>;
}
export {};
