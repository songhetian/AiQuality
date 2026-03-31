import { OrganizationService } from './organization.service';
import { Prisma } from '@prisma/client';
export declare class PlatformController {
    private readonly orgService;
    constructor(orgService: OrganizationService);
    create(data: Prisma.PlatformCreateInput): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
    }>;
    findAll(): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        code: string;
        managerId: string | null;
        remark: string | null;
    }[]>;
}
export declare class DeptController {
    private readonly orgService;
    constructor(orgService: OrganizationService);
    create(data: Prisma.DepartmentCreateInput): Promise<{
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
    findAll(platformId?: string): Promise<({
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
}
export declare class ShopController {
    private readonly orgService;
    constructor(orgService: OrganizationService);
    create(data: Prisma.ShopCreateInput): Promise<{
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
    findAll(deptId?: string): Promise<({
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
}
