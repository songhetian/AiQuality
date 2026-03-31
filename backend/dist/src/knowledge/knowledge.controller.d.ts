import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledgeService;
    private readonly allowedKnowledgeMimeTypes;
    constructor(knowledgeService: KnowledgeService);
    findAll(query: any, req: any): Promise<{
        total: number;
        list: ({
            status: number;
            id: string;
            deptId: string | null;
            createTime: Date;
            updateTime: Date;
            createBy: string;
            vectorId: string | null;
            errorMessage: string | null;
            title: string;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileHash: string;
        } & {
            accessUrl: any;
        })[];
    }>;
    search(query: any, req: any): Promise<{
        list: {
            knowledge: {
                id: string;
                title: string;
                fileName: string;
                fileUrl: string;
                status: number;
                createTime: Date;
                accessUrl: string;
            } | undefined;
            id: string | number;
            score: number;
        }[];
    }>;
    findTasks(query: any, req: any): Promise<{
        total: number;
        list: {
            canRetry: boolean;
            status: number;
            id: string;
            deptId: string | null;
            createTime: Date;
            updateTime: Date;
            createBy: string;
            vectorId: string | null;
            errorMessage: string | null;
            title: string;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileHash: string;
            accessUrl: any;
        }[];
    }>;
    upload(file: any, req: any): Promise<{
        status: number;
        id: string;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        createBy: string;
        vectorId: string | null;
        errorMessage: string | null;
        title: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileHash: string;
    }>;
    retry(id: string, req: any): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
}
