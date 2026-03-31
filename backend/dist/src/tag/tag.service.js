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
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TagService = class TagService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeTagName(name) {
        return String(name || '').trim();
    }
    async ensureTagUniqueness(tagName, deptId, excludeTagCode) {
        const normalizedName = this.normalizeTagName(tagName);
        if (!normalizedName) {
            throw new common_1.ConflictException('标签名称不能为空');
        }
        const existing = await this.prisma.tag.findFirst({
            where: {
                tagName: normalizedName,
                deptId: deptId ?? null,
                ...(excludeTagCode
                    ? {
                        NOT: {
                            tagCode: excludeTagCode,
                        },
                    }
                    : {}),
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`标签“${normalizedName}”已存在`);
        }
        return normalizedName;
    }
    async create(data) {
        const deptId = data.deptId ?? null;
        const tagName = await this.ensureTagUniqueness(data.tagName, deptId);
        return this.prisma.tag.create({
            data: {
                tagName,
                tagType: String(data.tagType || '').trim(),
                applyDimension: String(data.applyDimension || '').trim(),
                dimensionDetail: String(data.dimensionDetail || 'all').trim(),
                description: data.description || undefined,
                aiMatchRule: data.aiMatchRule || undefined,
                createBy: data.createBy,
                deptId: deptId || undefined,
            },
        });
    }
    async findAll(query) {
        const { page = 1, pageSize = 10, tagName, tagType, status } = query;
        const skip = (page - 1) * pageSize;
        const where = {
            tagName: tagName ? { contains: tagName } : undefined,
            tagType: tagType ? String(tagType) : undefined,
            status: status !== undefined && status !== '' ? Number(status) : undefined,
        };
        const [total, list] = await Promise.all([
            this.prisma.tag.count({ where }),
            this.prisma.tag.findMany({
                where,
                skip,
                take: parseInt(pageSize),
                orderBy: { createTime: 'desc' },
            }),
        ]);
        return { total, list };
    }
    async findOne(tagCode) {
        return this.prisma.tag.findUnique({ where: { tagCode } });
    }
    async findAuditList() {
        return this.prisma.tagAudit.findMany({
            where: { status: 0 },
            orderBy: { createTime: 'desc' },
        });
    }
    async update(tagCode, data) {
        const current = await this.prisma.tag.findUnique({ where: { tagCode } });
        if (!current) {
            throw new common_1.NotFoundException('标签不存在');
        }
        const nextTagName = typeof data.tagName === 'string' ? data.tagName : current.tagName;
        const nextDeptId = data.deptId !== undefined
            ? data.deptId === null
                ? null
                : String(data.deptId)
            : current.deptId;
        const normalizedName = await this.ensureTagUniqueness(nextTagName, nextDeptId, tagCode);
        return this.prisma.tag.update({
            where: { tagCode },
            data: {
                tagName: normalizedName,
                tagType: data.tagType !== undefined && data.tagType !== null
                    ? String(data.tagType).trim()
                    : undefined,
                applyDimension: data.applyDimension !== undefined && data.applyDimension !== null
                    ? String(data.applyDimension).trim()
                    : undefined,
                dimensionDetail: data.dimensionDetail !== undefined && data.dimensionDetail !== null
                    ? String(data.dimensionDetail).trim()
                    : undefined,
                description: data.description !== undefined ? data.description || null : undefined,
                aiMatchRule: data.aiMatchRule !== undefined ? data.aiMatchRule || null : undefined,
                deptId: data.deptId !== undefined ? data.deptId || null : undefined,
            },
        });
    }
    async remove(tagCode) {
        const relationCount = await this.prisma.tagRelation.count({
            where: { tagCode },
        });
        if (relationCount > 0) {
            const disabled = await this.prisma.tag.update({
                where: { tagCode },
                data: { status: 0 },
            });
            return {
                mode: 'disabled',
                tag: disabled,
                relationCount,
            };
        }
        await this.prisma.tag.delete({ where: { tagCode } });
        return {
            mode: 'deleted',
            tagCode,
            relationCount: 0,
        };
    }
    async updateStatus(tagCode, status) {
        return this.prisma.tag.update({
            where: { tagCode },
            data: {
                status: Number(status) === 1 ? 1 : 0,
            },
        });
    }
    async handleAudit(id, status) {
        const audit = await this.prisma.tagAudit.findUnique({ where: { id } });
        if (!audit)
            throw new Error('Audit record not found');
        if (status === 1) {
            const normalizedName = this.normalizeTagName(audit.tagName);
            const existing = await this.prisma.tag.findFirst({
                where: {
                    tagName: normalizedName,
                    deptId: audit.deptId ?? null,
                },
            });
            if (existing) {
                await this.prisma.tag.update({
                    where: { tagCode: existing.tagCode },
                    data: {
                        status: 1,
                        tagType: existing.tagType || audit.tagType,
                        isAiCreate: 1,
                    },
                });
            }
            else {
                await this.prisma.tag.create({
                    data: {
                        tagName: normalizedName,
                        tagType: audit.tagType,
                        applyDimension: '部门',
                        dimensionDetail: audit.deptId || 'all',
                        deptId: audit.deptId,
                        status: 1,
                        createBy: 'SYSTEM_AI',
                        isAiCreate: 1,
                    },
                });
            }
        }
        return this.prisma.tagAudit.update({
            where: { id },
            data: { status },
        });
    }
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagService);
//# sourceMappingURL=tag.service.js.map