import { AdapterService } from './adapter.service';
export declare class AdapterController {
    private readonly adapterService;
    constructor(adapterService: AdapterService);
    list(req: any): Promise<({
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
        } | null;
        fakeData: {
            fakeData: string;
            status: number;
            id: string;
            createTime: Date;
            interfaceId: string;
            updateTime: Date;
            remark: string | null;
            scene: string | null;
        }[];
        mappings: {
            status: number;
            id: string;
            createTime: Date;
            interfaceId: string;
            updateTime: Date;
            remark: string | null;
            thirdPartyFields: string;
            systemFields: string;
            formatMapping: string | null;
        }[];
    } & {
        url: string;
        authParams: string | null;
        headers: string | null;
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        method: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        enableFakeData: boolean;
    })[]>;
    getConfigOptions(): Promise<{
        platforms: {
            id: string;
            name: string;
            code: string;
        }[];
        departments: {
            id: string;
            platformId: string;
            name: string;
            code: string;
        }[];
    }>;
    create(body: unknown): Promise<({
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
        } | null;
        fakeData: {
            fakeData: string;
            status: number;
            id: string;
            createTime: Date;
            interfaceId: string;
            updateTime: Date;
            remark: string | null;
            scene: string | null;
        }[];
        mappings: {
            status: number;
            id: string;
            createTime: Date;
            interfaceId: string;
            updateTime: Date;
            remark: string | null;
            thirdPartyFields: string;
            systemFields: string;
            formatMapping: string | null;
        }[];
    } & {
        url: string;
        authParams: string | null;
        headers: string | null;
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        method: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        enableFakeData: boolean;
    }) | null>;
    update(interfaceId: string, body: unknown): Promise<({
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
        } | null;
        fakeData: {
            fakeData: string;
            status: number;
            id: string;
            createTime: Date;
            interfaceId: string;
            updateTime: Date;
            remark: string | null;
            scene: string | null;
        }[];
        mappings: {
            status: number;
            id: string;
            createTime: Date;
            interfaceId: string;
            updateTime: Date;
            remark: string | null;
            thirdPartyFields: string;
            systemFields: string;
            formatMapping: string | null;
        }[];
    } & {
        url: string;
        authParams: string | null;
        headers: string | null;
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        method: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        enableFakeData: boolean;
    }) | null>;
    updateStatus(interfaceId: string, body: unknown): Promise<{
        url: string;
        authParams: string | null;
        headers: string | null;
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        method: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        enableFakeData: boolean;
    }>;
    handleWebhook(platformCode: string, body: any): Promise<{
        status: string;
        recordId: string;
    }>;
    collect(interfaceId: string, body?: unknown): Promise<{
        list: any;
        persisted: {
            sessionCount: number;
            recordCount: number;
            alertCount: number;
        };
    }>;
    preview(interfaceId: string, body: any): Promise<{
        interfaceId: string;
        platformId: string;
        deptId: string | null;
        normalized: {
            sessionId?: string;
            senderType?: string;
            senderId?: string;
            content?: string;
            contentType?: string;
            sendTime?: Date | string | number;
            isSessionEnd?: boolean | string | number;
            shopId?: string;
            shopCode?: string;
            shopName?: string;
            userId?: string;
        };
        preview: {
            sessionId: string;
            senderType: string;
            sendTime: string | null;
            isSessionEnd: boolean;
            matchedShop: {
                id: string;
                name: string;
                code: string;
            } | null;
        };
    }>;
    setFakeData(interfaceId: string, body: unknown): Promise<{
        fakeData: string;
        status: number;
        id: string;
        createTime: Date;
        interfaceId: string;
        updateTime: Date;
        remark: string | null;
        scene: string | null;
    }>;
    toggleFakeMode(interfaceId: string, body: unknown): Promise<{
        url: string;
        authParams: string | null;
        headers: string | null;
        status: number;
        id: string;
        platformId: string;
        deptId: string | null;
        method: string;
        createTime: Date;
        name: string;
        updateTime: Date;
        type: string;
        enableFakeData: boolean;
    }>;
    getMonitor(interfaceId: string): Promise<{
        status: string;
        id: string;
        responseTime: number;
        createTime: Date;
        interfaceId: string;
        successRate: number;
    }[]>;
}
