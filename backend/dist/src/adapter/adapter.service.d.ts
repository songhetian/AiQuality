import { PrismaService } from '../prisma/prisma.service';
import { QualityService } from '../quality/quality.service';
import { KeywordService } from '../keyword/keyword.service';
type NormalizedMessage = {
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
type AdapterUpsertPayload = {
    name: string;
    type: string;
    url: string;
    method: string;
    platformId: string;
    deptId?: string | null;
    headers?: string | null;
    authParams?: string | null;
    enableFakeData?: boolean;
    status?: number;
    mappings?: Array<{
        thirdPartyFields: string;
        systemFields: string;
        formatMapping?: string | null;
        remark?: string | null;
    }>;
};
export declare class AdapterService {
    private prisma;
    private qualityService;
    private keywordService;
    private readonly logger;
    constructor(prisma: PrismaService, qualityService: QualityService, keywordService: KeywordService);
    findInterfaces(user: {
        roles?: string[];
        deptId?: string | null;
    }): Promise<({
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
    createInterface(payload: AdapterUpsertPayload): Promise<({
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
    updateInterface(interfaceId: string, payload: AdapterUpsertPayload): Promise<({
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
    updateInterfaceStatus(interfaceId: string, status: number): Promise<{
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
    private resolveAutoQualityRuleId;
    processRealtimeMessage(platformCode: string, rawBody: any): Promise<{
        status: string;
        recordId: string;
    }>;
    collectChatData(interfaceId: string, options?: {
        persist?: boolean;
    }): Promise<{
        list: any;
        persisted: {
            sessionCount: number;
            recordCount: number;
            alertCount: number;
        };
    }>;
    private transformData;
    private replaceMappings;
    setFakeData(interfaceId: string, data: any, scene: string): Promise<{
        fakeData: string;
        status: number;
        id: string;
        createTime: Date;
        interfaceId: string;
        updateTime: Date;
        remark: string | null;
        scene: string | null;
    }>;
    toggleFakeMode(interfaceId: string, enable: boolean): Promise<{
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
    previewMapping(interfaceId: string, payload: any): Promise<{
        interfaceId: string;
        platformId: string;
        deptId: string | null;
        normalized: NormalizedMessage;
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
    private persistCollectedMessages;
    private persistNormalizedMessage;
    private resolveMappedValue;
    private applyFormatMapping;
    private resolveShop;
    private normalizeSenderType;
    private normalizeDate;
    private normalizeBoolean;
    private ensureString;
    private recordMonitor;
    private writeAdapterAuditLog;
    private pickSamplePayload;
    private safeJsonStringify;
}
export {};
