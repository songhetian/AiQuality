import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class RoleService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.RoleCreateInput): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        description: string | null;
        isSystem: boolean;
    }>;
    findAll(): Promise<({
        permissions: {
            status: number;
            id: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            type: string;
            code: string;
            parentId: string | null;
            description: string | null;
        }[];
    } & {
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        description: string | null;
        isSystem: boolean;
    })[]>;
    findOne(id: string): Promise<({
        permissions: {
            status: number;
            id: string;
            createTime: Date;
            name: string;
            updateTime: Date;
            type: string;
            code: string;
            parentId: string | null;
            description: string | null;
        }[];
    } & {
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        description: string | null;
        isSystem: boolean;
    }) | null>;
    update(id: string, data: Prisma.RoleUpdateInput): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        description: string | null;
        isSystem: boolean;
    }>;
    remove(id: string): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        description: string | null;
        isSystem: boolean;
    }>;
    assignPermissions(id: string, permissionIds: string[]): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        name: string;
        updateTime: Date;
        description: string | null;
        isSystem: boolean;
    }>;
}
