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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const qdrant_service_1 = require("../qdrant/qdrant.service");
const redis_service_1 = require("../redis/redis.service");
const keyword_service_1 = require("../keyword/keyword.service");
const ai_integration_service_1 = require("../ai/ai-integration.service");
let ChatService = class ChatService {
    prisma;
    qdrant;
    redis;
    keywordService;
    aiService;
    constructor(prisma, qdrant, redis, keywordService, aiService) {
        this.prisma = prisma;
        this.qdrant = qdrant;
        this.redis = redis;
        this.keywordService = keywordService;
        this.aiService = aiService;
    }
    async createSession(data) {
        return this.prisma.chatSession.create({ data });
    }
    async findAllSessions(query) {
        const { deptId, shopId, status, keyword, page = 1, pageSize = 10 } = query;
        const skip = (page - 1) * pageSize;
        const where = {
            deptId: deptId || undefined,
            shopId: shopId || undefined,
            status: status ? parseInt(status) : undefined,
            OR: keyword
                ? [
                    { sessionId: { contains: keyword } },
                    { records: { some: { content: { contains: keyword } } } },
                ]
                : undefined,
        };
        const [total, list] = await Promise.all([
            this.prisma.chatSession.count({ where }),
            this.prisma.chatSession.findMany({
                where,
                skip,
                take: parseInt(pageSize),
                include: { shop: true, user: true },
                orderBy: { createTime: 'desc' },
            }),
        ]);
        return { total, list, page: Number(page), pageSize: Number(pageSize) };
    }
    async findSessionDetail(id) {
        const cacheKey = `chat:session:${id}`;
        return this.redis.wrap(cacheKey, async () => {
            return this.prisma.chatSession.findUnique({
                where: { id },
                include: {
                    records: { orderBy: { sendTime: 'asc' } },
                    inspection: true,
                },
            });
        }, 600);
    }
    async createRecord(sessionId, data, vector) {
        const record = await this.prisma.chatRecord.create({
            data: {
                ...data,
                session: { connect: { id: sessionId } },
            },
            include: { session: true },
        });
        await this.redis.del(`chat:session:${sessionId}`);
        if (vector && vector.length > 0) {
            await this.qdrant.upsertChatRecord(record.session.deptId, record.id, vector, {
                sessionId: record.sessionId,
                content: record.content,
                senderType: record.senderType,
            });
        }
        if (record.senderType === 'AGENT' && record.content.trim()) {
            await this.keywordService.detectKeywords(record.content, record.session.deptId, record.sessionId, record.session.userId || '');
        }
        return record;
    }
    async findSimilarRecords(recordId, user) {
        const record = await this.prisma.chatRecord.findUnique({
            where: { id: recordId },
            include: {
                session: {
                    include: {
                        shop: true,
                    },
                },
            },
        });
        if (!record) {
            return [];
        }
        if (!user?.roles?.includes('SUPER_ADMIN') &&
            record.session?.deptId !== user?.deptId) {
            return [];
        }
        const content = String(record.content || '').trim();
        if (!content) {
            return [];
        }
        const vector = await this.aiService.getEmbedding(content);
        const similar = await this.qdrant.searchSimilarChats(record.session.deptId, vector, 8, {
            must: [{ key: 'senderType', match: { value: record.senderType } }],
        });
        const similarIds = similar
            .map((item) => String(item.id))
            .filter((id) => id && id !== recordId);
        if (similarIds.length === 0) {
            return [];
        }
        const relatedRecords = await this.prisma.chatRecord.findMany({
            where: {
                id: { in: similarIds },
            },
            include: {
                session: {
                    include: {
                        shop: true,
                    },
                },
            },
        });
        const recordMap = new Map(relatedRecords.map((item) => [item.id, item]));
        return similar
            .filter((item) => String(item.id) !== recordId)
            .map((item) => {
            const related = recordMap.get(String(item.id));
            if (!related) {
                return null;
            }
            return {
                id: related.id,
                score: item.score,
                content: related.content,
                senderType: related.senderType,
                sendTime: related.sendTime,
                sessionId: related.sessionId,
                shopName: related.session?.shop?.name || null,
            };
        })
            .filter((item) => Boolean(item));
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        qdrant_service_1.QdrantService,
        redis_service_1.RedisService,
        keyword_service_1.KeywordService,
        ai_integration_service_1.AiIntegrationService])
], ChatService);
//# sourceMappingURL=chat.service.js.map