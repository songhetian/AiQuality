"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let CostService = class CostService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async recordAiCall(data) {
        const cacheKey = `cost:rule:${data.aiPlatformId}:${data.platformId}`;
        let rule = await this.redis.getJson(cacheKey);
        if (!rule) {
            rule = await this.prisma.costBillingRule.findFirst({
                where: {
                    aiPlatformId: data.aiPlatformId,
                    platformId: data.platformId,
                    status: 1,
                },
            });
            if (rule)
                await this.redis.setJson(cacheKey, rule, 3600);
        }
        if (!rule)
            return null;
        let cost = 0;
        if (rule.billingType === 'COUNT') {
            cost = rule.unitPrice;
        }
        else if (rule.billingType === 'DURATION' && data.duration) {
            cost = (data.duration / 60) * rule.unitPrice;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateStr = today.toISOString().split('T')[0];
        const uniqueStatId = `stat_${data.shopId}_${data.aiPlatformId}_${dateStr}`;
        return this.prisma.costStatistics.upsert({
            where: {
                id: uniqueStatId,
            },
            create: {
                id: uniqueStatId,
                platformId: data.platformId,
                deptId: data.deptId,
                shopId: data.shopId,
                aiPlatformId: data.aiPlatformId,
                callCount: 1,
                totalCost: cost,
                statDate: today,
            },
            update: {
                callCount: { increment: 1 },
                totalCost: { increment: cost },
            },
        });
    }
    async getSummaryStats(deptId) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const aggregations = await this.prisma.costStatistics.aggregate({
            where: {
                deptId: deptId || undefined,
                statDate: { gte: startOfMonth },
            },
            _sum: { totalCost: true, callCount: true },
            _avg: { totalCost: true },
        });
        const highestDept = await this.prisma.costStatistics.groupBy({
            by: ['deptId'],
            where: { statDate: { gte: startOfMonth } },
            _sum: { totalCost: true },
            orderBy: { _sum: { totalCost: 'desc' } },
            take: 1,
        });
        return {
            totalCost: aggregations._sum.totalCost || 0,
            callCount: aggregations._sum.callCount || 0,
            avgUnitPrice: 0.045,
            highestDept: highestDept[0]?.deptId || '无',
            highestDeptCost: highestDept[0]?._sum.totalCost || 0,
        };
    }
    async getTrendStats(days, scope) {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);
        return this.prisma.costStatistics.groupBy({
            by: ['statDate'],
            where: {
                statDate: { gte: startDate },
                deptId: scope?.deptId || undefined,
            },
            _sum: { totalCost: true, callCount: true },
            orderBy: { statDate: 'asc' },
        });
    }
    async getDeptDistribution(days, scope) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const grouped = await this.prisma.costStatistics.groupBy({
            by: ['deptId'],
            where: {
                statDate: { gte: startDate },
                deptId: scope?.deptId || undefined,
            },
            _sum: { totalCost: true, callCount: true },
            orderBy: { _sum: { totalCost: 'desc' } },
        });
        const deptIds = grouped
            .map((item) => item.deptId)
            .filter((item) => Boolean(item));
        const departments = await this.prisma.department.findMany({
            where: { id: { in: deptIds } },
            select: { id: true, name: true },
        });
        const deptNameMap = new Map(departments.map((item) => [item.id, item.name]));
        return grouped.map((item) => ({
            deptId: item.deptId,
            name: item.deptId ? deptNameMap.get(item.deptId) || item.deptId : '未归属部门',
            totalCost: item._sum.totalCost || 0,
            callCount: item._sum.callCount || 0,
        }));
    }
    async getPlatformDistribution(days, scope) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const grouped = await this.prisma.costStatistics.groupBy({
            by: ['aiPlatformId'],
            where: {
                statDate: { gte: startDate },
                deptId: scope?.deptId || undefined,
            },
            _sum: { totalCost: true, callCount: true },
            orderBy: { _sum: { totalCost: 'desc' } },
        });
        const platformIds = grouped
            .map((item) => item.aiPlatformId)
            .filter((item) => Boolean(item));
        const platforms = await this.prisma.aIPlatform.findMany({
            where: { id: { in: platformIds } },
            select: { id: true, name: true },
        });
        const platformNameMap = new Map(platforms.map((item) => [item.id, item.name]));
        return grouped.map((item) => ({
            aiPlatformId: item.aiPlatformId,
            name: platformNameMap.get(item.aiPlatformId) || item.aiPlatformId,
            totalCost: item._sum.totalCost || 0,
            callCount: item._sum.callCount || 0,
        }));
    }
    async setBillingRule(data) {
        const rule = await this.prisma.costBillingRule.create({ data });
        await this.redis.del(`cost:rule:${data.aiPlatformId}:${data.platformId}`);
        return rule;
    }
    async getStatistics(query) {
        return this.prisma.costStatistics.findMany({
            where: {
                deptId: query.deptId || undefined,
                platformId: query.platformId || undefined,
            },
        });
    }
};
exports.CostService = CostService;
exports.CostService = CostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CostService);
//# sourceMappingURL=cost.service.js.map