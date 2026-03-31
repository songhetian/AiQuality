"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KnowledgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const oss_service_1 = require("../oss/oss.service");
const qdrant_service_1 = require("../qdrant/qdrant.service");
const ai_integration_service_1 = require("../ai/ai-integration.service");
const socket_gateway_1 = require("../socket/socket.gateway");
const crypto = __importStar(require("crypto"));
const pdfParse = require('pdf-parse');
const mammoth = __importStar(require("mammoth"));
let KnowledgeService = KnowledgeService_1 = class KnowledgeService {
    prisma;
    configService;
    ossService;
    qdrantService;
    aiService;
    socketGateway;
    logger = new common_1.Logger(KnowledgeService_1.name);
    chunkSize = 1200;
    chunkOverlap = 200;
    maxKnowledgeUploadBytes;
    constructor(prisma, configService, ossService, qdrantService, aiService, socketGateway) {
        this.prisma = prisma;
        this.configService = configService;
        this.ossService = ossService;
        this.qdrantService = qdrantService;
        this.aiService = aiService;
        this.socketGateway = socketGateway;
        const maxSizeMb = parseInt(this.configService.get('KNOWLEDGE_UPLOAD_MAX_SIZE_MB') || '20', 10);
        this.maxKnowledgeUploadBytes =
            (Number.isFinite(maxSizeMb) && maxSizeMb > 0 ? maxSizeMb : 20) *
                1024 *
                1024;
    }
    validateKnowledgeUpload(file, fallbackAllowedMimeTypes) {
        const allowedMimeTypes = String(this.configService.get('KNOWLEDGE_ALLOWED_MIME_TYPES') || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        this.ossService.validateUpload(file, {
            label: '知识文档',
            maxFileSizeBytes: this.maxKnowledgeUploadBytes,
            allowedMimeTypes: allowedMimeTypes.length > 0
                ? allowedMimeTypes
                : fallbackAllowedMimeTypes,
        });
    }
    async uploadKnowledge(file, user) {
        const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
        const existing = await this.prisma.knowledgeBase.findFirst({
            where: { fileHash: hash, deptId: user.deptId },
        });
        if (existing)
            return existing;
        const objectKey = await this.ossService.uploadFile(file, `knowledge/${user.deptId}`);
        const kb = await this.prisma.knowledgeBase.create({
            data: {
                title: file.originalname,
                fileName: file.originalname,
                fileUrl: objectKey,
                fileType: file.mimetype,
                fileHash: hash,
                deptId: user.deptId,
                createBy: user.id,
                status: 1,
            },
        });
        this.processKnowledgeAsync(kb.id, file.buffer);
        return kb;
    }
    async findTasks(query, user) {
        const { page = 1, pageSize = 10, title, status } = query;
        const where = {
            deptId: this.resolveDeptId(user),
            title: title ? { contains: String(title) } : undefined,
            status: status !== undefined && status !== null && String(status).trim() !== ''
                ? parseInt(String(status), 10)
                : undefined,
        };
        const [total, rawList] = await Promise.all([
            this.prisma.knowledgeBase.count({ where }),
            this.prisma.knowledgeBase.findMany({
                where,
                skip: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
                take: parseInt(pageSize, 10),
                orderBy: [{ status: 'asc' }, { updateTime: 'desc' }],
            }),
        ]);
        const list = await this.attachAccessUrl(rawList);
        return {
            total,
            list: list.map((item) => ({
                ...item,
                canRetry: item.status === 3,
            })),
        };
    }
    async retryKnowledge(id, user) {
        const knowledge = await this.prisma.knowledgeBase.findFirst({
            where: {
                id,
                deptId: this.resolveDeptId(user),
            },
        });
        if (!knowledge) {
            throw new Error('知识文档不存在或无权操作');
        }
        if (knowledge.status === 1) {
            throw new Error('当前文档正在处理中，请稍后刷新');
        }
        await this.prisma.knowledgeBase.update({
            where: { id },
            data: {
                status: 1,
                errorMessage: null,
            },
        });
        const buffer = await this.ossService.getObjectBuffer(knowledge.fileUrl);
        this.processKnowledgeAsync(id, buffer);
        return {
            id,
            status: 'QUEUED',
            message: '已重新加入向量化处理队列',
        };
    }
    async extractTextFromFile(buffer, mimeType) {
        try {
            if (mimeType.includes('pdf')) {
                const data = await pdfParse(buffer);
                return data.text;
            }
            if (mimeType.includes('officedocument.wordprocessingml')) {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            }
            if (mimeType.includes('video') || mimeType.includes('audio')) {
                return await this.aiService.transcribeMedia(buffer, mimeType);
            }
            return buffer.toString('utf-8');
        }
        catch (e) {
            return '';
        }
    }
    async processVectorization(kbId, buffer) {
        const kb = await this.prisma.knowledgeBase.findUnique({
            where: { id: kbId },
        });
        if (!kb)
            return;
        const content = await this.extractTextFromFile(buffer, kb.fileType);
        if (!content || content.length < 2)
            throw new Error('Text extraction failed.');
        const normalizedContent = content.replace(/\s+/g, ' ').trim();
        const chunks = this.splitIntoChunks(normalizedContent);
        if (chunks.length === 0) {
            throw new Error('No valid chunks generated from knowledge content.');
        }
        const embeddings = await Promise.all(chunks.map((chunk) => this.aiService.getEmbedding(chunk.content)));
        await this.qdrantService.upsertPoints(kb.deptId, chunks.map((chunk, index) => ({
            id: `${kbId}_chunk_${index}`,
            vector: embeddings[index],
            payload: {
                type: 'knowledge',
                deptId: kb.deptId,
                kbId,
                title: kb.title,
                url: kb.fileUrl,
                chunkIndex: index,
                content: chunk.content,
                contentLength: chunk.content.length,
            },
        })));
        await this.prisma.knowledgeBase.update({
            where: { id: kbId },
            data: { status: 2, vectorId: `${kbId}_chunk_0` },
        });
        this.emitKnowledgeStatus({
            id: kbId,
            title: kb.title,
            status: 'SUCCESS',
        });
    }
    splitIntoChunks(content) {
        const chunks = [];
        const text = content.trim();
        if (!text) {
            return chunks;
        }
        let start = 0;
        while (start < text.length) {
            const end = Math.min(start + this.chunkSize, text.length);
            const chunk = text.slice(start, end).trim();
            if (chunk.length > 0) {
                chunks.push({ content: chunk });
            }
            if (end >= text.length) {
                break;
            }
            start = Math.max(end - this.chunkOverlap, start + 1);
        }
        return chunks;
    }
    async findAll(query, user) {
        const { page = 1, pageSize = 10, title } = query;
        const where = {
            deptId: user.roles?.includes('SUPER_ADMIN') ? undefined : user.deptId,
            title: title ? { contains: title } : undefined,
        };
        const [total, rawList] = await Promise.all([
            this.prisma.knowledgeBase.count({ where }),
            this.prisma.knowledgeBase.findMany({
                where,
                skip: (parseInt(page) - 1) * parseInt(pageSize),
                take: parseInt(pageSize),
                orderBy: { createTime: 'desc' },
            }),
        ]);
        const list = await this.attachAccessUrl(rawList);
        return { total, list };
    }
    async search(query, user) {
        const { keyword, limit = 5, kbId, deptId } = query;
        const normalizedKeyword = String(keyword || '').trim();
        if (!normalizedKeyword) {
            return { list: [] };
        }
        const vector = await this.aiService.getEmbedding(normalizedKeyword);
        const targetDeptId = user.roles?.includes('SUPER_ADMIN')
            ? String(deptId || user.deptId || '').trim()
            : user.deptId;
        if (!targetDeptId) {
            return { list: [] };
        }
        const results = await this.qdrantService.searchSimilarChats(targetDeptId, vector, parseInt(limit, 10) || 5, {
            must: [
                { key: 'type', match: { value: 'knowledge' } },
                ...(kbId ? [{ key: 'kbId', match: { value: kbId } }] : []),
                ...(targetDeptId
                    ? [{ key: 'deptId', match: { value: targetDeptId } }]
                    : []),
            ],
        });
        const knowledgeIds = Array.from(new Set(results
            .map((item) => String(item.payload?.kbId || '').trim())
            .filter(Boolean)));
        const knowledgeRecords = knowledgeIds.length
            ? await this.prisma.knowledgeBase.findMany({
                where: { id: { in: knowledgeIds } },
                select: {
                    id: true,
                    title: true,
                    fileName: true,
                    fileUrl: true,
                    status: true,
                    createTime: true,
                },
            })
            : [];
        const knowledgeEntries = await Promise.all(knowledgeRecords.map(async (record) => [
            record.id,
            {
                ...record,
                accessUrl: await this.ossService.getPresignedUrl(record.fileUrl),
            },
        ]));
        const knowledgeMap = new Map(knowledgeEntries);
        return {
            list: results.map((item) => ({
                id: item.id,
                score: item.score,
                ...(item.payload || {}),
                knowledge: item.payload?.kbId
                    ? knowledgeMap.get(String(item.payload.kbId))
                    : undefined,
            })),
        };
    }
    resolveDeptId(user) {
        return user?.roles?.includes('SUPER_ADMIN') ? undefined : user?.deptId;
    }
    async attachAccessUrl(records) {
        return Promise.all(records.map(async (item) => ({
            ...item,
            accessUrl: await this.ossService.getPresignedUrl(item.fileUrl),
        })));
    }
    processKnowledgeAsync(kbId, buffer) {
        this.processVectorization(kbId, buffer).catch(async (error) => {
            this.logger.error(`Vectorization failed for ${kbId}`, error);
            const updated = await this.prisma.knowledgeBase.update({
                where: { id: kbId },
                data: { status: 3, errorMessage: error.message },
            });
            this.emitKnowledgeStatus({
                id: kbId,
                title: updated.title,
                status: 'FAILED',
                errorMessage: error.message,
            });
        });
    }
    emitKnowledgeStatus(payload) {
        this.socketGateway.server?.emit('knowledge_processed', payload);
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = KnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_gateway_1.SocketGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        oss_service_1.OssService,
        qdrant_service_1.QdrantService,
        ai_integration_service_1.AiIntegrationService,
        socket_gateway_1.SocketGateway])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map