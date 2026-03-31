import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
    getMe(req: any): any;
    findOne(id: string): Promise<({
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
