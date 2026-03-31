import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';
export declare class OrganizationService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAllPlatforms(): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
    }[]>;
    createPlatform(data: Prisma.PlatformCreateInput): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
    }>;
    findAllDepartments(platformId?: string): Promise<({
        platform: {
            status: number;
            id: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            code: string;
            managerId: string | null;
            remark: string | null;
        };
    } & {
        status: number;
        id: string;
        platformId: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
        parentId: string | null;
    })[]>;
    createDepartment(data: Prisma.DepartmentCreateInput): Promise<{
        status: number;
        id: string;
        platformId: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
        parentId: string | null;
    }>;
    findDeptDetail(id: string): Promise<({
        platform: {
            status: number;
            id: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            code: string;
            managerId: string | null;
            remark: string | null;
        };
        shops: {
            status: number;
            id: string;
            platformId: string;
            deptId: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            code: string;
            managerId: string | null;
            remark: string | null;
            serviceTeam: string | null;
        }[];
        children: {
            status: number;
            id: string;
            platformId: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            code: string;
            managerId: string | null;
            remark: string | null;
            parentId: string | null;
        }[];
    } & {
        status: number;
        id: string;
        platformId: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
        parentId: string | null;
    }) | null>;
    findAllShops(deptId?: string): Promise<({
        department: {
            status: number;
            id: string;
            platformId: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            code: string;
            managerId: string | null;
            remark: string | null;
            parentId: string | null;
        };
    } & {
        status: number;
        id: string;
        platformId: string;
        deptId: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
        serviceTeam: string | null;
    })[]>;
    createShop(data: Prisma.ShopCreateInput): Promise<{
        status: number;
        id: string;
        platformId: string;
        deptId: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
        serviceTeam: string | null;
    }>;
    removePlatform(id: string): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
    }>;
    removeDepartment(id: string): Promise<{
        status: number;
        id: string;
        platformId: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
        parentId: string | null;
    }>;
}
