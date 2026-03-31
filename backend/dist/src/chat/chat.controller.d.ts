import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createSession(body: any): Promise<{
        status: number;
        id: string;
        userId: string | null;
        platformId: string;
        deptId: string;
        createTime: Date;
        sessionId: string;
        shopId: string;
        interfaceId: string;
        startTime: Date;
        endTime: Date | null;
        updateTime: Date;
    }>;
    findAll(query: any, req: any): Promise<{
        total: number;
        list: ({
            shop: {
                status: number;
                id: string;
                platformId: string;
                deptId: string;
                createTime: Date;
                name: string;
                updateTime: Date;
                code: string;
                managerId: string | null;
                remark: string | null;
                serviceTeam: string | null;
            };
            user: {
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
            } | null;
        } & {
            status: number;
            id: string;
            userId: string | null;
            platformId: string;
            deptId: string;
            createTime: Date;
            sessionId: string;
            shopId: string;
            interfaceId: string;
            startTime: Date;
            endTime: Date | null;
            updateTime: Date;
        })[];
        page: number;
        pageSize: number;
    }>;
    findOne(id: string, req: any): Promise<({
        records: {
            id: string;
            createTime: Date;
            sessionId: string;
            content: string;
            senderType: string;
            sendTime: Date;
            senderId: string | null;
            contentType: string;
            vectorId: string | null;
        }[];
        inspection: {
            status: number;
            id: string;
            createTime: Date;
            sessionId: string;
            updateTime: Date;
            aiScore: number | null;
            aiResult: string | null;
            manualScore: number | null;
            manualResult: string | null;
            inspectorId: string | null;
            ruleId: string;
            rectifyOpinion: string | null;
        } | null;
    } & {
        status: number;
        id: string;
        userId: string | null;
        platformId: string;
        deptId: string;
        createTime: Date;
        sessionId: string;
        shopId: string;
        interfaceId: string;
        startTime: Date;
        endTime: Date | null;
        updateTime: Date;
    }) | null>;
    findSimilar(recordId: string, req: any): Promise<{
        id: string;
        score: number;
        content: string;
        senderType: string;
        sendTime: Date;
        sessionId: string;
        shopName: string | null;
    }[]>;
    createRecord(body: any): Promise<{
        session: {
            status: number;
            id: string;
            userId: string | null;
            platformId: string;
            deptId: string;
            createTime: Date;
            sessionId: string;
            shopId: string;
            interfaceId: string;
            startTime: Date;
            endTime: Date | null;
            updateTime: Date;
        };
    } & {
        id: string;
        createTime: Date;
        sessionId: string;
        content: string;
        senderType: string;
        sendTime: Date;
        senderId: string | null;
        contentType: string;
        vectorId: string | null;
    }>;
}
