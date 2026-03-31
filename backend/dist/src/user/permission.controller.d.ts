import { PermissionService } from './permission.service';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
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
    sync(): Promise<{
        success: boolean;
        count: number;
    }>;
}
