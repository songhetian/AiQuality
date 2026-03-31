import { PrismaService } from '../prisma/prisma.service';
type TagCreatePayload = {
    tagName: string;
    tagType: string;
    applyDimension: string;
    dimensionDetail: string;
    description?: string | null;
    aiMatchRule?: string | null;
    createBy: string;
    deptId?: string | null;
};
type TagUpdatePayload = {
    tagName?: string;
    tagType?: string | null;
    applyDimension?: string | null;
    dimensionDetail?: string | null;
    description?: string | null;
    aiMatchRule?: string | null;
    deptId?: string | null;
};
export declare class TagService {
    private prisma;
    constructor(prisma: PrismaService);
    private normalizeTagName;
    private ensureTagUniqueness;
    create(data: TagCreatePayload): Promise<{
        status: number;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        description: string | null;
        tagCode: string;
        tagName: string;
        tagType: string;
        applyDimension: string;
        dimensionDetail: string;
        aiMatchRule: string | null;
        createBy: string;
        isAiCreate: number;
    }>;
    findAll(query: any): Promise<{
        total: number;
        list: {
            status: number;
            deptId: string | null;
            createTime: Date;
            updateTime: Date;
            description: string | null;
            tagCode: string;
            tagName: string;
            tagType: string;
            applyDimension: string;
            dimensionDetail: string;
            aiMatchRule: string | null;
            createBy: string;
            isAiCreate: number;
        }[];
    }>;
    findOne(tagCode: string): Promise<{
        status: number;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        description: string | null;
        tagCode: string;
        tagName: string;
        tagType: string;
        applyDimension: string;
        dimensionDetail: string;
        aiMatchRule: string | null;
        createBy: string;
        isAiCreate: number;
    } | null>;
    findAuditList(): Promise<{
        status: number;
        id: string;
        deptId: string | null;
        createTime: Date;
        tagName: string;
        tagType: string;
        reason: string;
    }[]>;
    update(tagCode: string, data: TagUpdatePayload): Promise<{
        status: number;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        description: string | null;
        tagCode: string;
        tagName: string;
        tagType: string;
        applyDimension: string;
        dimensionDetail: string;
        aiMatchRule: string | null;
        createBy: string;
        isAiCreate: number;
    }>;
    remove(tagCode: string): Promise<{
        mode: string;
        tag: {
            status: number;
            deptId: string | null;
            createTime: Date;
            updateTime: Date;
            description: string | null;
            tagCode: string;
            tagName: string;
            tagType: string;
            applyDimension: string;
            dimensionDetail: string;
            aiMatchRule: string | null;
            createBy: string;
            isAiCreate: number;
        };
        relationCount: number;
        tagCode?: undefined;
    } | {
        mode: string;
        tagCode: string;
        relationCount: number;
        tag?: undefined;
    }>;
    updateStatus(tagCode: string, status: number): Promise<{
        status: number;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        description: string | null;
        tagCode: string;
        tagName: string;
        tagType: string;
        applyDimension: string;
        dimensionDetail: string;
        aiMatchRule: string | null;
        createBy: string;
        isAiCreate: number;
    }>;
    handleAudit(id: string, status: number): Promise<{
        status: number;
        id: string;
        deptId: string | null;
        createTime: Date;
        tagName: string;
        tagType: string;
        reason: string;
    }>;
}
export {};
