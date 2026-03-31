import { KeywordService } from './keyword.service';
export declare class KeywordController {
    private readonly keywordService;
    constructor(keywordService: KeywordService);
    findAll(query: {
        deptId?: string;
        type?: string;
        status?: string;
        word?: string;
    }): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        type: string;
        remark: string | null;
        word: string;
        matchMode: string;
        severity: number;
    }[]>;
    create(body: {
        word: string;
        type: string;
        deptId?: string;
    }): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        type: string;
        remark: string | null;
        word: string;
        matchMode: string;
        severity: number;
    }>;
    update(id: string, body: {
        word?: string;
        type?: string;
        deptId?: string | null;
    }): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        type: string;
        remark: string | null;
        word: string;
        matchMode: string;
        severity: number;
    }>;
    updateStatus(id: string, body: {
        status: number;
    }): Promise<{
        status: number;
        id: string;
        platformId: string | null;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        type: string;
        remark: string | null;
        word: string;
        matchMode: string;
        severity: number;
    }>;
}
