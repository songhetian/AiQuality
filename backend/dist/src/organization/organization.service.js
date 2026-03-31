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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let OrganizationService = class OrganizationService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAllPlatforms() {
        return this.redis.wrap('org:platforms', async () => {
            return this.prisma.platform.findMany({
                where: { status: 1 },
            });
        });
    }
    async createPlatform(data) {
        const platform = await this.prisma.platform.create({ data });
        await this.redis.del('org:platforms');
        return platform;
    }
    async findAllDepartments(platformId) {
        return this.prisma.department.findMany({
            where: { platformId: platformId || undefined },
            include: { platform: true },
        });
    }
    async createDepartment(data) {
        const dept = await this.prisma.department.create({ data });
        await this.redis.delByPattern('org:depts:*');
        return dept;
    }
    async findDeptDetail(id) {
        const cacheKey = `org:depts:${id}`;
        return this.redis.wrap(cacheKey, async () => {
            return this.prisma.department.findUnique({
                where: { id },
                include: { platform: true, children: true, shops: true },
            });
        });
    }
    async findAllShops(deptId) {
        return this.prisma.shop.findMany({
            where: { deptId: deptId || undefined },
            include: { department: true },
        });
    }
    async createShop(data) {
        const shop = await this.prisma.shop.create({ data });
        await this.redis.delByPattern('org:depts:*');
        return shop;
    }
    async removePlatform(id) {
        const depts = await this.prisma.department.count({
            where: { platformId: id },
        });
        if (depts > 0)
            throw new Error('Cannot delete platform with associated departments');
        await this.redis.del('org:platforms');
        return this.prisma.platform.delete({ where: { id } });
    }
    async removeDepartment(id) {
        const shops = await this.prisma.shop.count({ where: { deptId: id } });
        const users = await this.prisma.user.count({ where: { deptId: id } });
        if (shops > 0 || users > 0) {
            throw new Error('Cannot delete department with associated shops or users');
        }
        await this.redis.delByPattern('org:depts:*');
        return this.prisma.department.delete({ where: { id } });
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map