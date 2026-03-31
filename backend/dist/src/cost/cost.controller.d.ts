import { CostService } from './cost.service';
export declare class CostController {
    private readonly costService;
    constructor(costService: CostService);
    getSummary(req: any): Promise<{
        totalCost: number;
        callCount: number;
        avgUnitPrice: number;
        highestDept: string;
        highestDeptCost: number;
    }>;
    getTrend(days: string, req: any): Promise<(import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.CostStatisticsGroupByOutputType, "statDate"[]> & {
        _sum: {
            totalCost: number | null;
            callCount: number | null;
        };
    })[]>;
    getDeptDistribution(days: string, req: any): Promise<{
        deptId: string;
        name: string;
        totalCost: number;
        callCount: number;
    }[]>;
    getPlatformDistribution(days: string, req: any): Promise<{
        aiPlatformId: string;
        name: string;
        totalCost: number;
        callCount: number;
    }[]>;
    findAll(query: any): Promise<{
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
}
