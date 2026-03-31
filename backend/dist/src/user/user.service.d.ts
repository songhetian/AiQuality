import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private encryptPassword;
    create(data: Prisma.UserCreateInput): Promise<{
        password: string;
        status: number;
        id: string;
        username: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        shopId: string | null;
        updateTime: Date;
        phone: string | null;
        email: string | null;
    }>;
    findByUsername(username: string): Promise<({
        roles: {
            status: number;
            id: string;
            platformId: string | null;
            deptId: string | null;
            createTime: Date;
            name: string;
            updateTime: Date;
            description: string | null;
            isSystem: boolean;
        }[];
    } & {
        password: string;
        status: number;
        id: string;
        username: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        shopId: string | null;
        updateTime: Date;
        phone: string | null;
        email: string | null;
    }) | null>;
    findAll(query: any): Promise<{
        password: string;
        status: number;
        id: string;
        username: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        shopId: string | null;
        updateTime: Date;
        phone: string | null;
        email: string | null;
    }[]>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<{
        password: string;
        status: number;
        id: string;
        username: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        shopId: string | null;
        updateTime: Date;
        phone: string | null;
        email: string | null;
    }>;
    remove(id: string): Promise<{
        password: string;
        status: number;
        id: string;
        username: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        shopId: string | null;
        updateTime: Date;
        phone: string | null;
        email: string | null;
    }>;
}
