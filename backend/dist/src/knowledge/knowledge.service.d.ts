import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OssService } from '../oss/oss.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { AiIntegrationService } from '../ai/ai-integration.service';
import { SocketGateway } from '../socket/socket.gateway';
export declare class KnowledgeService {
    private prisma;
    private configService;
    private ossService;
    private qdrantService;
    private aiService;
    private socketGateway;
    private readonly logger;
    private readonly chunkSize;
    private readonly chunkOverlap;
    private readonly maxKnowledgeUploadBytes;
    constructor(prisma: PrismaService, configService: ConfigService, ossService: OssService, qdrantService: QdrantService, aiService: AiIntegrationService, socketGateway: SocketGateway);
    validateKnowledgeUpload(file: any, fallbackAllowedMimeTypes: string[]): void;
    uploadKnowledge(file: any, user: any): Promise<{
        status: number;
        id: string;
        deptId: string | null;
        createTime: Date;
        updateTime: Date;
        title: string;
        createBy: string;
        vectorId: string | null;
        errorMessage: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileHash: string;
    }>;
    findTasks(query: any, user: any): Promise<{
        total: number;
        list: {
            canRetry: boolean;
            status: number;
            id: string;
            deptId: string | null;
            createTime: Date;
            updateTime: Date;
            title: string;
            createBy: string;
            vectorId: string | null;
            errorMessage: string | null;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileHash: string;
            accessUrl: any;
        }[];
    }>;
    retryKnowledge(id: string, user: any): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    private extractTextFromFile;
    private processVectorization;
    private splitIntoChunks;
    findAll(query: any, user: any): Promise<{
        total: number;
        list: ({
            status: number;
            id: string;
            deptId: string | null;
            createTime: Date;
            updateTime: Date;
            title: string;
            createBy: string;
            vectorId: string | null;
            errorMessage: string | null;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileHash: string;
        } & {
            accessUrl: any;
        })[];
    }>;
    search(query: any, user: any): Promise<{
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
    private resolveDeptId;
    private attachAccessUrl;
    private processKnowledgeAsync;
    private emitKnowledgeStatus;
}
