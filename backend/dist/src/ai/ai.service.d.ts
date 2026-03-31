import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CostService } from '../cost/cost.service';
import { AiIntegrationService } from './ai-integration.service';
export declare class AiService {
    private readonly prisma;
    private readonly costService;
    private readonly aiIntegrationService;
    private readonly logger;
    constructor(prisma: PrismaService, costService: CostService, aiIntegrationService: AiIntegrationService);
    analyzeChat(params: {
        content: string;
        ruleId: string;
        platformId: string;
        deptId: string;
        shopId: string;
    }): Promise<{
        score: number;
        violations: string[];
        detectedTags: never[];
        tokens: number;
        reason: string;
        degraded: boolean;
    }>;
    createPlatform(data: Prisma.AIPlatformCreateInput): Promise<{
        url: string;
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        remark: string | null;
        secretKey: string;
        billingRule: string | null;
        isDefault: boolean;
    }>;
    findAllPlatforms(): Promise<{
        url: string;
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        remark: string | null;
        secretKey: string;
        billingRule: string | null;
        isDefault: boolean;
    }[]>;
}
