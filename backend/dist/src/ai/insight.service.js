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
var InsightService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const schedule_1 = require("@nestjs/schedule");
let InsightService = InsightService_1 = class InsightService {
    prisma;
    redis;
    logger = new common_1.Logger(InsightService_1.name);
    defaultLossWaitMinutes = 120;
    minimumQuestionLength = 6;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async handleDailyInsight() {
        this.logger.log('Starting daily insight task...');
        const statDate = new Date();
        statDate.setHours(0, 0, 0, 0);
        await this.aggregateHighFreqQuestions(statDate);
        this.logger.log('Daily insight task completed.');
    }
    async analyzeLoss(sessionId) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                records: { orderBy: { sendTime: 'asc' } },
                lossAnalysis: true,
            },
        });
        if (!session) {
            return null;
        }
        return this.upsertLossAnalysis(session);
    }
    async getLossAnalysis(query, user) {
        const { id, page = 1, pageSize = 10, dateRange = '7d', shopName, isLost, reasonKeyword, followUpStatus, overdueOnly, myFollowUpOnly, manualReviewNeeded, } = query;
        const pageNumber = Number(page);
        const size = Number(pageSize);
        const rangeStart = this.resolveRangeStart(dateRange);
        const overdueTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const cacheKey = `stats:loss:${user?.roles?.includes('SUPER_ADMIN') ? 'all' : user?.deptId || 'none'}:${dateRange}:${pageNumber}:${size}`;
        return this.redis.wrap(cacheKey, async () => {
            await this.refreshLossAnalysis(rangeStart, user);
            const sessionWhere = {
                ...(user?.roles?.includes('SUPER_ADMIN')
                    ? {}
                    : {
                        deptId: user?.deptId || '__no_access__',
                    }),
                ...(shopName
                    ? {
                        shop: {
                            name: { contains: shopName },
                        },
                    }
                    : {}),
                ...(String(manualReviewNeeded || '') === 'true'
                    ? {
                        inspection: {
                            status: { in: [1, 3, 4] },
                        },
                    }
                    : {}),
            };
            const where = {
                id: id ? String(id).trim() : undefined,
                createTime: {
                    gte: rangeStart,
                    ...(String(overdueOnly || '') === 'true'
                        ? { lte: overdueTime }
                        : {}),
                },
                ...(String(isLost || '') === 'true'
                    ? { isLost: true }
                    : String(isLost || '') === 'false'
                        ? { isLost: false }
                        : {}),
                ...(reasonKeyword
                    ? {
                        reason: {
                            contains: String(reasonKeyword).trim(),
                        },
                    }
                    : {}),
                ...(followUpStatus !== undefined &&
                    followUpStatus !== null &&
                    String(followUpStatus) !== ''
                    ? { followUpStatus: Number(followUpStatus) }
                    : {}),
                ...(String(myFollowUpOnly || '') === 'true'
                    ? { followUpBy: user?.username || '__no_user__' }
                    : {}),
                ...(Object.keys(sessionWhere).length > 0
                    ? { session: sessionWhere }
                    : {}),
            };
            const [total, lostCount, retainedCount, rawList] = await Promise.all([
                this.prisma.lossAnalysis.count({ where }),
                this.prisma.lossAnalysis.count({ where: { ...where, isLost: true } }),
                this.prisma.lossAnalysis.count({
                    where: { ...where, isLost: false },
                }),
                this.prisma.lossAnalysis.findMany({
                    where,
                    include: {
                        session: {
                            include: { shop: true, inspection: true },
                        },
                    },
                    orderBy: { createTime: 'desc' },
                    skip: (pageNumber - 1) * size,
                    take: size,
                }),
            ]);
            const consultCount = lostCount + retainedCount;
            const list = rawList.map((item) => {
                const current = item;
                const qualityStatus = current.session?.inspection?.status ?? null;
                return {
                    ...current,
                    waitMinutes: this.extractWaitMinutes(current.reason),
                    sessionStartTime: current.session?.startTime,
                    shopName: current.session?.shop?.name || null,
                    reasonCategory: this.summarizeLossReason(current.reason),
                    followUpStatusLabel: this.resolveFollowUpStatusLabel(current.followUpStatus),
                    qualityInspectionId: current.session?.inspection?.id || null,
                    qualityStatus,
                    qualityStatusLabel: this.resolveQualityStatusLabel(qualityStatus),
                    manualReviewNeeded: this.resolveManualReviewNeeded(qualityStatus),
                    qualitySummary: this.resolveQualitySummary(qualityStatus),
                };
            });
            return {
                total,
                list,
                page: pageNumber,
                pageSize: size,
                summary: {
                    consultCount,
                    retainedCount,
                    lostCount,
                    lossRate: consultCount > 0
                        ? Number(((lostCount / consultCount) * 100).toFixed(1))
                        : 0,
                },
            };
        }, 900);
    }
    async getLossStats(query, user) {
        const { dateRange = '7d' } = query;
        const rangeStart = this.resolveRangeStart(dateRange);
        await this.refreshLossAnalysis(rangeStart, user);
        const where = {
            createTime: { gte: rangeStart },
            ...(user?.roles?.includes('SUPER_ADMIN')
                ? {}
                : {
                    session: {
                        deptId: user?.deptId || '__no_access__',
                    },
                }),
        };
        const records = await this.prisma.lossAnalysis.findMany({
            where,
            include: {
                session: {
                    include: { shop: true },
                },
            },
            orderBy: { createTime: 'asc' },
            take: 500,
        });
        const trendMap = new Map();
        const reasonMap = new Map();
        const shopMap = new Map();
        const followUpMap = new Map();
        for (const item of records) {
            const date = this.formatDay(item.createTime);
            const bucket = trendMap.get(date) || { lost: 0, retained: 0 };
            if (item.isLost) {
                bucket.lost += 1;
            }
            else {
                bucket.retained += 1;
            }
            trendMap.set(date, bucket);
            const reason = this.summarizeLossReason(item.reason);
            reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
            const shopName = item.session?.shop?.name || '未识别店铺';
            shopMap.set(shopName, (shopMap.get(shopName) || 0) + (item.isLost ? 1 : 0));
            const followUpName = this.resolveFollowUpStatusLabel(item.followUpStatus);
            followUpMap.set(followUpName, (followUpMap.get(followUpName) || 0) + 1);
        }
        return {
            trend: Array.from(trendMap.entries()).map(([date, bucket]) => ({
                date,
                lost: bucket.lost,
                retained: bucket.retained,
            })),
            reasonDistribution: Array.from(reasonMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6),
            shopRanking: Array.from(shopMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5),
            followUpDistribution: Array.from(followUpMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value),
        };
    }
    async updateLossFollowUp(id, body, user) {
        const current = await this.prisma.lossAnalysis.findUnique({
            where: { id },
            include: {
                session: true,
            },
        });
        if (!current) {
            throw new Error('Loss analysis record not found');
        }
        if (!user?.roles?.includes('SUPER_ADMIN') &&
            current.session?.deptId !== user?.deptId) {
            throw new Error('No permission to update this loss analysis');
        }
        const followUpStatus = Math.max(0, Number(body?.followUpStatus ?? 0));
        const followUpRemark = String(body?.followUpRemark || '').trim() || null;
        const updated = await this.prisma.lossAnalysis.update({
            where: { id },
            data: {
                followUpStatus,
                followUpRemark,
                followUpBy: user?.username || user?.name || 'system',
                followUpTime: new Date(),
            },
        });
        await this.redis.delByPattern('stats:loss:*');
        return updated;
    }
    async batchUpdateLossFollowUp(body, user) {
        const ids = Array.isArray(body?.ids)
            ? body.ids.map((id) => String(id)).filter(Boolean)
            : [];
        if (ids.length === 0) {
            throw new Error('No loss analysis records selected');
        }
        const records = await this.prisma.lossAnalysis.findMany({
            where: { id: { in: ids } },
            include: { session: true },
        });
        if (records.length === 0) {
            throw new Error('Loss analysis records not found');
        }
        if (!user?.roles?.includes('SUPER_ADMIN')) {
            const forbidden = records.some((item) => item.session?.deptId !== user?.deptId);
            if (forbidden) {
                throw new Error('No permission to update selected loss analysis');
            }
        }
        const followUpStatus = Math.max(0, Number(body?.followUpStatus ?? 0));
        const followUpRemark = String(body?.followUpRemark || '').trim() || null;
        const followUpBy = user?.username || user?.name || 'system';
        const followUpTime = new Date();
        const result = await this.prisma.lossAnalysis.updateMany({
            where: { id: { in: records.map((item) => item.id) } },
            data: {
                followUpStatus,
                followUpRemark,
                followUpBy,
                followUpTime,
            },
        });
        await this.redis.delByPattern('stats:loss:*');
        return {
            count: result.count,
            followUpStatus,
            followUpRemark,
            followUpBy,
            followUpTime,
        };
    }
    async getHighFreqQuestions(query) {
        const { userId, productId, date, page = 1, pageSize = 10, search, tagId, } = query;
        const pageNumber = Number(page);
        const size = Number(pageSize);
        const cacheKey = `stats:highfreq:${userId || 'global'}:${date || 'latest'}:${productId || 'all'}:${search || ''}:${tagId || ''}:${pageNumber}:${size}`;
        const rangeStart = this.resolveRangeStart(String(date || query?.dateRange || '7d'));
        const where = {
            userId: userId || undefined,
            productId: productId || undefined,
            tagId: tagId || undefined,
            content: search ? { contains: search } : undefined,
            statDate: { gte: rangeStart },
        };
        return this.redis.wrap(cacheKey, async () => {
            const [total, list] = await Promise.all([
                this.prisma.highFreqQuestion.count({ where }),
                this.prisma.highFreqQuestion.findMany({
                    where,
                    include: { tag: true },
                    orderBy: { count: 'desc' },
                    skip: (pageNumber - 1) * size,
                    take: size,
                }),
            ]);
            return { total, list, page: pageNumber, pageSize: size };
        }, 3600);
    }
    async getHighFreqQuestionTags() {
        return this.prisma.questionTag.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                color: true,
            },
        });
    }
    async aggregateHighFreqQuestions(statDate) {
        const nextDate = new Date(statDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const records = await this.prisma.chatRecord.findMany({
            where: {
                senderType: 'CUSTOMER',
                sendTime: {
                    gte: statDate,
                    lt: nextDate,
                },
            },
            include: {
                session: true,
            },
            orderBy: { sendTime: 'asc' },
            take: 5000,
        });
        const aggregatedMap = new Map();
        for (const record of records) {
            const content = this.normalizeQuestionContent(record.content);
            if (!content) {
                continue;
            }
            const bucket = aggregatedMap.get(content) || {
                content,
                count: 0,
                productId: record.session?.shopId || null,
                userId: record.session?.userId || null,
            };
            bucket.count += 1;
            aggregatedMap.set(content, bucket);
        }
        const sortedQuestions = Array.from(aggregatedMap.values())
            .filter((item) => item.count >= 2)
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);
        await this.prisma.highFreqQuestion.deleteMany({
            where: {
                statDate: {
                    gte: statDate,
                    lt: nextDate,
                },
            },
        });
        for (const item of sortedQuestions) {
            const inferredTagName = this.inferQuestionTagName(item.content);
            const questionTag = await this.ensureQuestionTag(inferredTagName);
            await this.ensureTagAuditHint(inferredTagName, item.content);
            await this.prisma.highFreqQuestion.create({
                data: {
                    content: item.content,
                    count: item.count,
                    productId: item.productId || undefined,
                    userId: item.userId || undefined,
                    tagId: questionTag?.id,
                    statDate,
                },
            });
        }
        await this.redis.delByPattern('stats:highfreq:*');
    }
    normalizeQuestionContent(content) {
        const normalized = String(content || '')
            .replace(/\s+/g, ' ')
            .replace(/[!！?？,，。；;、]/g, '')
            .trim();
        if (normalized.length < this.minimumQuestionLength) {
            return '';
        }
        return normalized;
    }
    inferQuestionTagName(content) {
        const lowered = content.toLowerCase();
        if (lowered.includes('退货') || lowered.includes('退款') || lowered.includes('换货')) {
            return '售后-退换货';
        }
        if (lowered.includes('发票') || lowered.includes('保修') || lowered.includes('售后')) {
            return '售后-服务政策';
        }
        if (lowered.includes('发货') || lowered.includes('物流') || lowered.includes('快递')) {
            return '物流-发货进度';
        }
        if (lowered.includes('价格') || lowered.includes('优惠') || lowered.includes('活动')) {
            return '营销-价格优惠';
        }
        if (lowered.includes('支持') || lowered.includes('兼容') || lowered.includes('型号')) {
            return '商品-功能兼容';
        }
        if (lowered.includes('安装') || lowered.includes('使用') || lowered.includes('教程')) {
            return '商品-使用咨询';
        }
        return '通用-咨询问题';
    }
    async ensureQuestionTag(name) {
        const existing = await this.prisma.questionTag.findFirst({
            where: { name },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.questionTag.create({
            data: {
                name,
            },
        });
    }
    async ensureTagAuditHint(tagName, sampleContent) {
        const existingTag = await this.prisma.tag.findFirst({
            where: { tagName },
        });
        if (existingTag) {
            return;
        }
        const existingAudit = await this.prisma.tagAudit.findFirst({
            where: {
                tagName,
                status: 0,
            },
        });
        if (existingAudit) {
            return;
        }
        await this.prisma.tagAudit.create({
            data: {
                tagName,
                tagType: 'AI发现',
                reason: `基于高频问题聚合发现：用户集中询问 "${sampleContent}"`,
                status: 0,
            },
        });
    }
    async getLossRule(query, user) {
        const platformId = query?.platformId || user?.platformId;
        if (!platformId) {
            return {
                name: '默认流失规则',
                waitMinutes: this.defaultLossWaitMinutes,
                platformId: null,
                status: 1,
            };
        }
        const rule = await this.prisma.lossRule.findFirst({
            where: { platformId, status: 1 },
            orderBy: { waitMinutes: 'asc' },
        });
        return (rule || {
            name: '默认流失规则',
            waitMinutes: this.defaultLossWaitMinutes,
            platformId,
            status: 1,
        });
    }
    async saveLossRule(body, user) {
        const platformId = body?.platformId || user?.platformId;
        if (!platformId) {
            throw new Error('No platform available for current loss rule');
        }
        const name = String(body?.name || '默认流失规则').trim() || '默认流失规则';
        const waitMinutes = Math.max(5, Number(body?.waitMinutes || this.defaultLossWaitMinutes));
        const existingRule = await this.prisma.lossRule.findFirst({
            where: { platformId, status: 1 },
            orderBy: { waitMinutes: 'asc' },
        });
        const data = {
            name,
            platformId,
            waitMinutes,
            status: 1,
        };
        const rule = existingRule
            ? await this.prisma.lossRule.update({
                where: { id: existingRule.id },
                data,
            })
            : await this.prisma.lossRule.create({ data });
        await this.redis.delByPattern(`stats:loss:*`);
        return rule;
    }
    async refreshLossAnalysis(rangeStart, user) {
        const sessions = await this.prisma.chatSession.findMany({
            where: {
                createTime: { gte: rangeStart },
                ...(user?.roles?.includes('SUPER_ADMIN')
                    ? {}
                    : { deptId: user?.deptId || '__no_access__' }),
            },
            include: {
                records: { orderBy: { sendTime: 'asc' } },
                lossAnalysis: true,
            },
            orderBy: { createTime: 'desc' },
            take: 200,
        });
        for (const session of sessions) {
            await this.upsertLossAnalysis(session);
        }
    }
    async upsertLossAnalysis(session) {
        const activeRule = await this.prisma.lossRule.findFirst({
            where: { platformId: session.platformId, status: 1 },
            orderBy: { waitMinutes: 'asc' },
        });
        const waitMinutes = activeRule?.waitMinutes || this.defaultLossWaitMinutes;
        const records = session.records || [];
        const firstRecord = records[0];
        const lastRecord = records[records.length - 1];
        const customerMessages = records.filter((item) => item.senderType === 'CUSTOMER').length;
        const agentMessages = records.filter((item) => item.senderType === 'AGENT').length;
        const latestTime = lastRecord?.sendTime || session.updateTime || session.createTime;
        const inactiveMinutes = Math.max(0, Math.floor((Date.now() - new Date(latestTime).getTime()) / 60000));
        const sessionDurationMinutes = firstRecord && lastRecord
            ? Math.max(1, Math.floor((new Date(lastRecord.sendTime).getTime() -
                new Date(firstRecord.sendTime).getTime()) /
                60000))
            : 0;
        const isLost = inactiveMinutes >= waitMinutes &&
            (records.length === 0 ||
                lastRecord?.senderType === 'CUSTOMER' ||
                (customerMessages >= 2 && agentMessages <= customerMessages));
        const reason = this.buildLossReason({
            waitMinutes,
            inactiveMinutes,
            customerMessages,
            agentMessages,
            lastSenderType: lastRecord?.senderType,
            sessionDurationMinutes,
            hasRecords: records.length > 0,
            isLost,
        });
        return this.prisma.lossAnalysis.upsert({
            where: { sessionId: session.id },
            create: {
                sessionId: session.id,
                platformId: session.platformId || null,
                deptId: session.deptId || null,
                shopId: session.shopId || null,
                interfaceId: session.interfaceId || null,
                productId: session.shopId || null,
                userId: session.userId || null,
                reason,
                isLost,
                lastSenderType: lastRecord?.senderType || null,
                customerMessageCount: customerMessages,
                agentMessageCount: agentMessages,
                sessionDurationMinutes,
                inactiveMinutes,
                waitMinutes,
                confidence: this.resolveLossConfidence({
                    isLost,
                    inactiveMinutes,
                    waitMinutes,
                    customerMessages,
                    agentMessages,
                    lastSenderType: lastRecord?.senderType,
                }),
            },
            update: {
                platformId: session.platformId || null,
                deptId: session.deptId || null,
                shopId: session.shopId || null,
                interfaceId: session.interfaceId || null,
                productId: session.shopId || null,
                userId: session.userId || null,
                reason,
                isLost,
                lastSenderType: lastRecord?.senderType || null,
                customerMessageCount: customerMessages,
                agentMessageCount: agentMessages,
                sessionDurationMinutes,
                inactiveMinutes,
                waitMinutes,
                confidence: this.resolveLossConfidence({
                    isLost,
                    inactiveMinutes,
                    waitMinutes,
                    customerMessages,
                    agentMessages,
                    lastSenderType: lastRecord?.senderType,
                }),
            },
        });
    }
    buildLossReason(input) {
        if (!input.hasRecords) {
            return `会话创建后 ${input.waitMinutes} 分钟内无有效沟通记录`;
        }
        if (!input.isLost) {
            return `最近 ${input.waitMinutes} 分钟内仍有互动，暂不判定流失`;
        }
        if (input.lastSenderType === 'CUSTOMER' && input.agentMessages === 0) {
            return `用户发起咨询后超过 ${input.waitMinutes} 分钟未获客服响应`;
        }
        if (input.lastSenderType === 'CUSTOMER' && input.customerMessages >= 2) {
            return `用户多轮咨询后超过 ${input.waitMinutes} 分钟未继续转化`;
        }
        if (input.sessionDurationMinutes <= 5) {
            return `短时咨询后超过 ${input.waitMinutes} 分钟未继续互动`;
        }
        return `最近一轮沟通已中断 ${input.inactiveMinutes} 分钟，判定为高概率流失`;
    }
    resolveRangeStart(dateRange) {
        const now = new Date();
        const start = new Date(now);
        if (dateRange === 'today') {
            start.setHours(0, 0, 0, 0);
            return start;
        }
        if (dateRange === '30d') {
            start.setDate(start.getDate() - 30);
            return start;
        }
        start.setDate(start.getDate() - 7);
        return start;
    }
    extractWaitMinutes(reason) {
        const matched = String(reason || '').match(/(\d+)\s*分钟/);
        return matched ? Number(matched[1]) : null;
    }
    summarizeLossReason(reason) {
        const text = String(reason || '').trim();
        if (!text) {
            return '待分析';
        }
        if (text.includes('未获客服响应')) {
            return '响应超时';
        }
        if (text.includes('多轮咨询')) {
            return '多轮咨询未转化';
        }
        if (text.includes('短时咨询')) {
            return '短时咨询流失';
        }
        if (text.includes('无有效沟通')) {
            return '无有效沟通';
        }
        if (text.includes('暂不判定流失')) {
            return '仍在跟进';
        }
        return '沟通中断';
    }
    resolveFollowUpStatusLabel(status) {
        if (status === 1) {
            return '人工跟进中';
        }
        if (status === 2) {
            return '已回访';
        }
        if (status === 3) {
            return '暂不处理';
        }
        return '待跟进';
    }
    resolveQualityStatusLabel(status) {
        if (status === 0) {
            return '质检中';
        }
        if (status === 1) {
            return '待复核';
        }
        if (status === 2) {
            return '已复核';
        }
        if (status === 3) {
            return '需整改';
        }
        if (status === 4) {
            return 'AI失败';
        }
        return '暂无质检';
    }
    resolveManualReviewNeeded(status) {
        return status === 1 || status === 3 || status === 4;
    }
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
        return '当前会话暂无质检结论';
    }
    resolveLossConfidence(input) {
        if (!input.isLost) {
            return 0.35;
        }
        let score = 0.55;
        if (input.lastSenderType === 'CUSTOMER') {
            score += 0.15;
        }
        if (input.customerMessages >= 2) {
            score += 0.1;
        }
        if (input.agentMessages === 0) {
            score += 0.1;
        }
        if (input.inactiveMinutes >= input.waitMinutes * 2) {
            score += 0.1;
        }
        return Math.min(0.95, Number(score.toFixed(2)));
    }
    formatDay(input) {
        const date = new Date(input);
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${month}-${day}`;
    }
};
exports.InsightService = InsightService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InsightService.prototype, "handleDailyInsight", null);
exports.InsightService = InsightService = InsightService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], InsightService);
//# sourceMappingURL=insight.service.js.map