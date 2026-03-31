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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QualityProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityProcessor = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_integration_service_1 = require("../ai/ai-integration.service");
const socket_gateway_1 = require("../socket/socket.gateway");
const tag_matching_service_1 = require("../tag/tag-matching.service");
const redis_service_1 = require("../redis/redis.service");
let QualityProcessor = QualityProcessor_1 = class QualityProcessor {
    prisma;
    aiService;
    tagService;
    redisService;
    socketGateway;
    logger = new common_1.Logger(QualityProcessor_1.name);
    resolveQualitySummary(status) {
        if (status === 0) {
            return 'AI 质检进行中';
        }
        if (status === 1) {
            return '已生成结果，建议人工复核';
        }
        if (status === 2) {
            return 'AI 质检通过，可进入常规复盘';
        }
        if (status === 3) {
            return '检测到风险点，建议尽快整改';
        }
        if (status === 4) {
            return 'AI 分析失败，建议人工补看或重试';
        }
        return '质检状态已更新';
    }
    constructor(prisma, aiService, tagService, redisService, socketGateway) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.tagService = tagService;
        this.redisService = redisService;
        this.socketGateway = socketGateway;
    }
    async handleAnalysis(job) {
        const { sessionId, ruleId, taskId, total, batchLockKey, progressKey, retryLockKey, } = job.data;
        try {
            const session = await this.prisma.chatSession.findUnique({
                where: { id: sessionId },
                include: { records: true },
            });
            if (!session) {
                return;
            }
            const fullText = session.records
                .map((record) => `${record.senderType}: ${record.content}`)
                .join('\n');
            const result = await this.aiService.analyzeSession(fullText, ruleId);
            const finalStatus = result.degraded ? 4 : result.score < 60 ? 3 : 2;
            const inspection = await this.prisma.qualityInspection.upsert({
                where: { sessionId },
                update: {
                    status: finalStatus,
                    ruleId,
                    aiScore: result.degraded ? null : result.score,
                    aiResult: result.reason,
                },
                create: {
                    sessionId,
                    ruleId,
                    status: finalStatus,
                    aiScore: result.degraded ? null : result.score,
                    aiResult: result.reason,
                },
            });
            this.socketGateway.sendQualityStatusChanged({
                sessionId,
                inspectionId: inspection.id,
                status: finalStatus,
                aiScore: inspection.aiScore,
                aiResult: inspection.aiResult,
                updatedAt: inspection.updateTime?.toISOString?.() || new Date().toISOString(),
                manualReviewNeeded: [1, 3, 4].includes(finalStatus),
                qualitySummary: this.resolveQualitySummary(finalStatus),
            });
            const metaKey = `quality:inspection:meta:${inspection.id}`;
            const currentMeta = (await this.redisService.getJson(metaKey)) || {};
            await this.redisService.setJson(metaKey, {
                ...currentMeta,
                lastFailedAt: result.degraded
                    ? new Date().toISOString()
                    : currentMeta.lastFailedAt,
                lastSucceededAt: !result.degraded
                    ? new Date().toISOString()
                    : currentMeta.lastSucceededAt,
            }, 7 * 24 * 60 * 60);
            const matchedTags = await this.tagService.autoTagSession(fullText, session.deptId);
            if (matchedTags.length > 0) {
                await this.prisma.tagRelation.createMany({
                    data: matchedTags.map((tag) => ({
                        id: `${sessionId}_${tag.tagCode}`,
                        tagCode: tag.tagCode,
                        qualityId: inspection.id,
                        createBy: 'SYSTEM_AI',
                    })),
                    skipDuplicates: true,
                });
            }
            if (result.violations.length > 0) {
                await this.prisma.realtimeAlert.create({
                    data: {
                        sessionId,
                        keyword: result.violations.join(','),
                        content: result.reason,
                        deptId: session.deptId,
                    },
                });
                this.socketGateway.sendRealtimeAlert(session.userId || 'admin', {
                    sessionId,
                    keyword: result.violations.join(','),
                });
            }
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to process session ${sessionId}`, err.stack || err.message);
            throw error;
        }
        finally {
            if (!progressKey) {
                return;
            }
            const completedCount = await this.redisService.incr(progressKey);
            await this.redisService.expire(progressKey, 1800);
            const progress = Math.min(100, Math.round((completedCount / total) * 100));
            this.socketGateway.sendTaskProgress(taskId, progress);
            if (completedCount >= total) {
                if (batchLockKey) {
                    await this.redisService.releaseLock(batchLockKey);
                }
                if (retryLockKey) {
                    await this.redisService.releaseLock(retryLockKey);
                }
                await this.redisService.del(progressKey);
            }
        }
    }
};
exports.QualityProcessor = QualityProcessor;
__decorate([
    (0, bull_1.Process)('analyze-session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QualityProcessor.prototype, "handleAnalysis", null);
exports.QualityProcessor = QualityProcessor = QualityProcessor_1 = __decorate([
    (0, bull_1.Processor)('quality-queue'),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_gateway_1.SocketGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_integration_service_1.AiIntegrationService,
        tag_matching_service_1.TagMatchingService,
        redis_service_1.RedisService,
        socket_gateway_1.SocketGateway])
], QualityProcessor);
//# sourceMappingURL=quality.processor.js.map