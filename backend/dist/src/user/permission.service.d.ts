import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        code: string;
        parentId: string | null;
        description: string | null;
    }[]>;
    registerPermission(data: {
        name: string;
        code: string;
        type: 'MENU' | 'BUTTON' | 'API';
    }): Promise<{
        status: number;
        id: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        code: string;
        parentId: string | null;
        description: string | null;
    }>;
    syncPermissions(): Promise<{
        success: boolean;
        count: number;
    }>;
}
