import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(body: unknown): Promise<{
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
    findAll(query: Record<string, unknown>): Promise<{
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
    getMe(req: any): any;
    findOne(id: string): Promise<({
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
    update(id: string, body: unknown): Promise<{
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
}
