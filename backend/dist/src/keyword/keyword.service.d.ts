import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
export declare class KeywordService {
    private prisma;
    private socketGateway;
    constructor(prisma: PrismaService, socketGateway: SocketGateway);
    detectKeywords(content: string, deptId: string, sessionId: string, userId: string): Promise<{
        keyword: string;
        status: number;
        id: string;
        userId: string | null;
        platformId: string | null;
        deptId: string;
        createTime: Date;
        sessionId: string;
        recordId: string | null;
        shopId: string | null;
        matchedText: string | null;
        alertType: string;
        content: string;
        handleRemark: string | null;
        handleBy: string | null;
        handleTime: Date | null;
    }[]>;
    addKeyword(data: {
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
    updateKeyword(id: string, data: {
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
    updateKeywordStatus(id: string, status: number): Promise<{
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
