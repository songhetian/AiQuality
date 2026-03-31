import { TagService } from './tag.service';
export declare class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    create(data: any): Promise<{
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
    findAuditList(): Promise<{
        status: number;
        id: string;
        deptId: string | null;
        createTime: Date;
        tagName: string;
        tagType: string;
        reason: string;
    }[]>;
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
    update(tagCode: string, data: any): Promise<{
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
