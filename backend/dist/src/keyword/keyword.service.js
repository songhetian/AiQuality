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
exports.KeywordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const socket_gateway_1 = require("../socket/socket.gateway");
let KeywordService = class KeywordService {
    prisma;
    socketGateway;
    constructor(prisma, socketGateway) {
        this.prisma = prisma;
        this.socketGateway = socketGateway;
    }
    async detectKeywords(content, deptId, sessionId, userId) {
        const normalizedContent = String(content || '').trim();
        if (!normalizedContent || !deptId || !sessionId) {
            return [];
        }
        const keywords = await this.prisma.keyword.findMany({
            where: {
                OR: [
                    { deptId: deptId },
                    { deptId: null },
                ],
                status: 1,
            },
            orderBy: { createTime: 'asc' },
        });
        const loweredContent = normalizedContent.toLowerCase();
        const detected = keywords
            .filter((kw) => loweredContent.includes(String(kw.word || '').toLowerCase()))
            .sort((a, b) => b.word.length - a.word.length)
            .filter((kw, index, list) => list.findIndex((item) => item.word === kw.word) === index);
        if (detected.length > 0) {
            const alerts = await Promise.all(detected.map((kw) => this.prisma.realtimeAlert.create({
                data: {
                    sessionId,
                    keyword: kw.word,
                    content: normalizedContent,
                    deptId,
                },
            })));
            if (userId) {
                this.socketGateway.sendRealtimeAlert(userId, {
                    sessionId,
                    content: normalizedContent,
                    keywords: detected.map((k) => k.word),
                    type: detected[0].type,
                    timestamp: new Date(),
                });
            }
            return alerts;
        }
        return [];
    }
    async addKeyword(data) {
        return this.prisma.keyword.create({
            data: {
                word: String(data.word || '').trim(),
                type: String(data.type || '').trim(),
                deptId: data.deptId || undefined,
            },
        });
    }
    async findAll(query) {
        return this.prisma.keyword.findMany({
            where: {
                deptId: query.deptId || undefined,
                type: query.type || undefined,
                status: query.status ? Number(query.status) : undefined,
                word: query.word ? { contains: query.word } : undefined,
            },
            orderBy: { createTime: 'desc' },
        });
    }
    async updateKeyword(id, data) {
        return this.prisma.keyword.update({
            where: { id },
            data: {
                word: data.word !== undefined ? String(data.word).trim() : undefined,
                type: data.type !== undefined ? String(data.type).trim() : undefined,
                deptId: data.deptId === null ? null : data.deptId || undefined,
            },
        });
    }
    async updateKeywordStatus(id, status) {
        return this.prisma.keyword.update({
            where: { id },
            data: {
                status: Number(status) === 1 ? 1 : 0,
            },
        });
    }
};
exports.KeywordService = KeywordService;
exports.KeywordService = KeywordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        socket_gateway_1.SocketGateway])
], KeywordService);
//# sourceMappingURL=keyword.service.js.map