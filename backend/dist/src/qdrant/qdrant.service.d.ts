import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class QdrantService implements OnModuleInit {
    private configService;
    private client;
    private readonly logger;
    private existingCollections;
    private indexedCollections;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getCollectionName(departmentId: string): string;
    ensureCollection(departmentId: string, vectorSize?: number): Promise<void>;
    upsertChatRecord(departmentId: string, recordId: string, vector: number[], payload: any): Promise<{
        operation_id?: number | null;
        status: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["UpdateStatus"];
    }>;
    upsertPoints(departmentId: string, points: Array<{
        id: string;
        vector: number[];
        payload: Record<string, unknown>;
    }>, wait?: boolean): Promise<{
        operation_id?: number | null;
        status: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["UpdateStatus"];
    } | undefined>;
    searchSimilarChats(departmentId: string, vector: number[], limit?: number, filter?: any): Promise<{
        id: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["ExtendedPointId"];
        version: number;
        score: number;
        payload?: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["Payload"] | (Record<string, unknown> | null);
        vector?: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["VectorStructOutput"] | (Record<string, unknown> | null);
        shard_key?: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["ShardKey"] | (Record<string, unknown> | null);
        order_value?: import("node_modules/@qdrant/js-client-rest/dist/types/openapi/generated_schema.js", { with: { "resolution-mode": "import" } }).components["schemas"]["OrderValue"] | (Record<string, unknown> | null);
    }[]>;
    private ensurePayloadIndexes;
}
