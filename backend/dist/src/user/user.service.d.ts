import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserListQuery } from './user.schemas';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly userIncludes;
    private encryptPassword;
    create(data: CreateUserDto): Promise<{
        platform: {
            id: string;
            name: string;
        } | null;
        department: {
            id: string;
            name: string;
        } | null;
        shop: {
            id: string;
            name: string;
        } | null;
        roles: {
            id: string;
            name: string;
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
    }>;
    findByUsername(username: string): Promise<({
        platform: {
            id: string;
            name: string;
        } | null;
        department: {
            id: string;
            name: string;
        } | null;
        shop: {
            id: string;
            name: string;
        } | null;
        roles: {
            id: string;
            name: string;
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
    findById(id: string): Promise<({
        platform: {
            id: string;
            name: string;
        } | null;
        department: {
            id: string;
            name: string;
        } | null;
        shop: {
            id: string;
            name: string;
        } | null;
        roles: {
            id: string;
            name: string;
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
    findAll(query: UserListQuery): Promise<{
        list: ({
            platform: {
                id: string;
                name: string;
            } | null;
            department: {
                id: string;
                name: string;
            } | null;
            shop: {
                id: string;
                name: string;
            } | null;
            roles: {
                id: string;
                name: string;
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
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    update(id: string, data: UpdateUserDto): Promise<{
        platform: {
            id: string;
            name: string;
        } | null;
        department: {
            id: string;
            name: string;
        } | null;
        shop: {
            id: string;
            name: string;
        } | null;
        roles: {
            id: string;
            name: string;
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
    private buildCreateData;
    private buildUpdateData;
    private toRelationInput;
}
