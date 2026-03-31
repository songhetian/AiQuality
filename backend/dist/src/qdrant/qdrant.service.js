"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QdrantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantService = void 0;
const common_1 = require("@nestjs/common");
const js_client_rest_1 = require("@qdrant/js-client-rest");
const config_1 = require("@nestjs/config");
let QdrantService = QdrantService_1 = class QdrantService {
    configService;
    client;
    logger = new common_1.Logger(QdrantService_1.name);
    existingCollections = new Set();
    indexedCollections = new Set();
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        const url = this.configService.get('QDRANT_URL') || 'http://127.0.0.1:6333';
        this.client = new js_client_rest_1.QdrantClient({ url });
        try {
            const result = await this.client.getCollections();
            result.collections.forEach((c) => this.existingCollections.add(c.name));
        }
        catch (e) {
            this.logger.warn('Failed to connect to Qdrant on init.');
        }
    }
    getCollectionName(departmentId) {
        return departmentId
            ? `dept_${departmentId.replace(/-/g, '_')}_chats`
            : 'platform_chats';
    }
    async ensureCollection(departmentId, vectorSize) {
        const collectionName = this.getCollectionName(departmentId);
        const configSize = this.configService.get('AI_VECTOR_SIZE');
        const finalSize = parseInt(configSize || '1536') || vectorSize || 1536;
        if (!this.existingCollections.has(collectionName)) {
            try {
                await this.client.createCollection(collectionName, {
                    vectors: { size: finalSize, distance: 'Cosine' },
                });
                this.existingCollections.add(collectionName);
            }
            catch (e) {
                if (e.status === 409) {
                    this.existingCollections.add(collectionName);
                }
                else {
                    throw e;
                }
            }
        }
        await this.ensurePayloadIndexes(collectionName);
    }
    async upsertChatRecord(departmentId, recordId, vector, payload) {
        const collectionName = this.getCollectionName(departmentId);
        await this.ensureCollection(departmentId, vector.length);
        return await this.client.upsert(collectionName, {
            wait: true,
            points: [{ id: recordId, vector, payload }],
        });
    }
    async upsertPoints(departmentId, points, wait = false) {
        if (points.length === 0) {
            return;
        }
        const collectionName = this.getCollectionName(departmentId);
        await this.ensureCollection(departmentId, points[0].vector.length);
        return this.client.upsert(collectionName, {
            wait,
            points,
        });
    }
    async searchSimilarChats(departmentId, vector, limit = 10, filter) {
        const collectionName = this.getCollectionName(departmentId);
        if (!this.existingCollections.has(collectionName))
            return [];
        return await this.client.search(collectionName, {
            vector,
            limit,
            filter,
            with_payload: true,
        });
    }
    async ensurePayloadIndexes(collectionName) {
        if (this.indexedCollections.has(collectionName)) {
            return;
        }
        const payloadIndexes = [
            { field_name: 'type', field_schema: 'keyword' },
            { field_name: 'deptId', field_schema: 'keyword' },
            { field_name: 'sessionId', field_schema: 'keyword' },
            { field_name: 'kbId', field_schema: 'keyword' },
            { field_name: 'chunkIndex', field_schema: 'integer' },
            { field_name: 'senderType', field_schema: 'keyword' },
        ];
        for (const index of payloadIndexes) {
            try {
                await this.client.createPayloadIndex(collectionName, index);
            }
            catch (error) {
                this.logger.warn(`Failed to create payload index ${index.field_name} for ${collectionName}`);
            }
        }
        this.indexedCollections.add(collectionName);
    }
};
exports.QdrantService = QdrantService;
exports.QdrantService = QdrantService = QdrantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QdrantService);
//# sourceMappingURL=qdrant.service.js.map