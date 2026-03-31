import { SettingsService } from './settings.service';
type RequestUser = {
    roles?: string[];
    deptId?: string | null;
};
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getOverview(req: {
        user: RequestUser;
    }): Promise<{
        app: {
            name: string;
            env: string;
            version: string;
        };
        overview: {
            knowledgeCount: number;
            activeRuleCount: number;
            chatSessionCount: number;
            userCount: number;
        };
        storage: {
            endpoint: string;
            port: number;
            bucket: string;
            useSSL: boolean;
            maxUploadSizeMb: number;
            presignedTtlSeconds: number;
            allowedMimeTypes: string[];
        };
        knowledge: {
            maxUploadSizeMb: number;
            allowedMimeTypes: string[];
            chunkSize: number;
            chunkOverlap: number;
        };
        ai: {
            baseUrl: string;
            chatModel: string;
            embeddingModel: string;
            timeoutMs: number;
            retries: number;
            vectorSize: number;
            apiKeyConfigured: boolean;
        };
        vectorStore: {
            qdrantUrl: string;
            vectorSize: number;
        };
    }>;
    getAiConfig(): Promise<{
        baseUrl: string;
        chatModel: string;
        embeddingModel: string;
        timeoutMs: number;
        retries: number;
        vectorSize: number;
        apiKeyConfigured: boolean;
    }>;
    updateAiConfig(body: unknown): Promise<{
        baseUrl: string;
        chatModel: string;
        embeddingModel: string;
        timeoutMs: number;
        retries: number;
        vectorSize: number;
        apiKeyConfigured: boolean;
    }>;
    testAiConfig(body: unknown): Promise<{
        success: boolean;
        baseUrl: string;
        modelCount: any;
        message: string;
    }>;
}
export {};
