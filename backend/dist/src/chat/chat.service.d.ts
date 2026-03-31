import { PrismaService } from '../prisma/prisma.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';
import { KeywordService } from '../keyword/keyword.service';
import { AiIntegrationService } from '../ai/ai-integration.service';
export declare class ChatService {
    private prisma;
    private qdrant;
    private redis;
    private keywordService;
    private aiService;
    constructor(prisma: PrismaService, qdrant: QdrantService, redis: RedisService, keywordService: KeywordService, aiService: AiIntegrationService);
    createSession(data: Prisma.ChatSessionCreateInput): Promise<{
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
    findAllSessions(query: any): Promise<{
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
    findSessionDetail(id: string): Promise<({
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
    createRecord(sessionId: string, data: Prisma.ChatRecordCreateWithoutSessionInput, vector?: number[]): Promise<{
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
    findSimilarRecords(recordId: string, user: any): Promise<{
        id: string;
        score: number;
        content: string;
        senderType: string;
        sendTime: Date;
        sessionId: string;
        shopName: string | null;
    }[]>;
}
