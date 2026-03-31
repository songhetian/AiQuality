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
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LogService = class LogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitizeParams(payload) {
        const sensitiveKeys = new Set([
            'apikey',
            'apiKey',
            'authorization',
            'password',
            'secret',
            'token',
            'authParams',
            'headers',
        ]);
        const walk = (value) => {
            if (Array.isArray(value)) {
                return value.map((item) => walk(item));
            }
            if (!value || typeof value !== 'object') {
                return value;
            }
            return Object.fromEntries(Object.entries(value).map(([key, itemValue]) => {
                if (sensitiveKeys.has(key)) {
                    if (typeof itemValue === 'string' && itemValue.trim()) {
                        return [key, '[MASKED]'];
                    }
                    if (itemValue && typeof itemValue === 'object') {
                        return [key, '[MASKED_OBJECT]'];
                    }
                }
                return [key, walk(itemValue)];
            }));
        };
        return walk(payload);
    }
    buildOperationMeta(method, path, body = {}) {
        const normalizeCount = () => Array.isArray(body.ids) ? body.ids.length : undefined;
        const qualityStatusMap = {
            '2': '确认通过',
            '3': '判定需整改',
        };
        const followUpStatusMap = {
            '1': '人工跟进中',
            '2': '已回访',
            '3': '暂不处理',
        };
        const violationStatusMap = {
            '1': '已处理',
            '2': '误报',
        };
        const defaultMeta = {
            operation: `${method} ${path}`,
            actionKind: `${method}_REQUEST`,
            targetType: 'GENERIC',
            targetId: null,
            targetCount: null,
        };
        if (path.includes('/api/log/violation/batch-handle')) {
            const count = normalizeCount() || 0;
            return {
                operation: `批量处理违规记录 ${count} 条 -> ${violationStatusMap[String(body.status)] || '状态变更'}`,
                actionKind: 'VIOLATION_BATCH_HANDLE',
                targetType: 'VIOLATION_ALERT',
                targetId: null,
                targetCount: count,
            };
        }
        if (path.includes('/api/log/violation/') && path.endsWith('/handle')) {
            return {
                operation: `处理违规记录 -> ${violationStatusMap[String(body.status)] || '状态变更'}`,
                actionKind: 'VIOLATION_HANDLE',
                targetType: 'VIOLATION_ALERT',
                targetId: path.split('/').slice(-2, -1)[0] || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/ai/insight/loss/batch-follow-up')) {
            const count = normalizeCount() || 0;
            return {
                operation: `批量跟进流失记录 ${count} 条 -> ${followUpStatusMap[String(body.followUpStatus)] || '更新处置状态'}`,
                actionKind: 'LOSS_BATCH_FOLLOW_UP',
                targetType: 'LOSS_ANALYSIS',
                targetId: null,
                targetCount: count,
            };
        }
        if (path.includes('/api/ai/insight/loss/') && path.endsWith('/follow-up')) {
            return {
                operation: `更新流失处置 -> ${followUpStatusMap[String(body.followUpStatus)] || '更新处置状态'}`,
                actionKind: 'LOSS_FOLLOW_UP',
                targetType: 'LOSS_ANALYSIS',
                targetId: path.split('/').slice(-2, -1)[0] || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/quality/batch-update')) {
            const count = normalizeCount() || 0;
            return {
                operation: `批量人工复核 ${count} 条 -> ${qualityStatusMap[String(body.status)] || '更新复核状态'}`,
                actionKind: 'QUALITY_BATCH_REVIEW',
                targetType: 'QUALITY_INSPECTION',
                targetId: null,
                targetCount: count,
            };
        }
        if (path.includes('/api/quality/update/')) {
            return {
                operation: `人工复核质检记录 -> ${qualityStatusMap[String(body.status)] || '更新复核状态'}`,
                actionKind: 'QUALITY_REVIEW',
                targetType: 'QUALITY_INSPECTION',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/quality/retry/')) {
            return {
                operation: '重新发起 AI 质检',
                actionKind: 'QUALITY_RETRY',
                targetType: 'QUALITY_INSPECTION',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/quality/batch')) {
            const count = Array.isArray(body.sessionIds) ? body.sessionIds.length : 0;
            return {
                operation: `批量发起 AI 质检 ${count} 条`,
                actionKind: 'QUALITY_BATCH_START',
                targetType: 'CHAT_SESSION',
                targetId: null,
                targetCount: count,
            };
        }
        if (path === '/api/settings/ai-config' && method === 'PUT') {
            return {
                operation: '更新 AI 接入配置',
                actionKind: 'AI_CONFIG_UPDATE',
                targetType: 'SYSTEM_CONFIG',
                targetId: 'AI_RUNTIME_CONFIG',
                targetCount: 1,
            };
        }
        if (path === '/api/settings/ai-config/test' && method === 'POST') {
            return {
                operation: '测试 AI 接入配置',
                actionKind: 'AI_CONFIG_TEST',
                targetType: 'SYSTEM_CONFIG',
                targetId: 'AI_RUNTIME_CONFIG',
                targetCount: 1,
            };
        }
        if (path === '/api/adapter' && method === 'POST') {
            return {
                operation: '创建接口配置',
                actionKind: 'ADAPTER_CREATE',
                targetType: 'ADAPTER_INTERFACE',
                targetId: null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/adapter/') && path.endsWith('/status')) {
            return {
                operation: `切换接口状态 -> ${Number(body.status) === 0 ? '停用' : '启用'}`,
                actionKind: 'ADAPTER_STATUS_UPDATE',
                targetType: 'ADAPTER_INTERFACE',
                targetId: path.split('/').slice(-2, -1)[0] || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/adapter/') &&
            method === 'PUT' &&
            !path.endsWith('/status')) {
            return {
                operation: '更新接口配置',
                actionKind: 'ADAPTER_UPDATE',
                targetType: 'ADAPTER_INTERFACE',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/adapter/fake-data/')) {
            return {
                operation: '更新接口 FakeData 示例',
                actionKind: 'ADAPTER_FAKE_DATA_UPDATE',
                targetType: 'ADAPTER_INTERFACE',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/adapter/fake-mode/')) {
            return {
                operation: `切换接口 FakeData 模式 -> ${body.enable ? '开启' : '关闭'}`,
                actionKind: 'ADAPTER_FAKE_MODE_TOGGLE',
                targetType: 'ADAPTER_INTERFACE',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/adapter/preview/')) {
            return {
                operation: '预览接口映射结果',
                actionKind: 'ADAPTER_PREVIEW',
                targetType: 'ADAPTER_INTERFACE',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        if (path.includes('/api/adapter/collect/')) {
            return {
                operation: body.persist ? '执行接口补录落库' : '执行接口预采集',
                actionKind: body.persist ? 'ADAPTER_COLLECT_PERSIST' : 'ADAPTER_COLLECT_PREVIEW',
                targetType: 'ADAPTER_INTERFACE',
                targetId: path.split('/').pop() || null,
                targetCount: 1,
            };
        }
        return defaultMeta;
    }
    async createOperationLog(data) {
        return this.prisma.operationLog.create({ data });
    }
    async createSystemLog(data) {
        return this.prisma.systemLog.create({ data });
    }
    async findAllOperationLogs(query) {
        const { page = 1, pageSize = 20, username, operation, path, paramsKeyword, actionKind, targetType, targetId, batchOnly, } = query;
        const skip = (page - 1) * pageSize;
        return this.prisma.operationLog.findMany({
            where: {
                username: username ? { contains: username } : undefined,
                operation: operation ? { contains: operation } : undefined,
                path: path ? { contains: path } : undefined,
                params: paramsKeyword ? { contains: paramsKeyword } : undefined,
                actionKind: actionKind ? { contains: actionKind } : undefined,
                targetType: targetType ? { contains: targetType } : undefined,
                targetId: targetId ? { contains: targetId } : undefined,
                ...(String(batchOnly || '') === 'true'
                    ? {
                        targetCount: {
                            gt: 1,
                        },
                    }
                    : {}),
            },
            orderBy: { createTime: 'desc' },
            skip: parseInt(skip.toString()),
            take: parseInt(pageSize.toString()),
        });
    }
    async findOperationLogsPage(query) {
        const { page = 1, pageSize = 20, username, operation, path, paramsKeyword, actionKind, targetType, targetId, batchOnly, } = query;
        const skip = (Number(page) - 1) * Number(pageSize);
        const where = {
            username: username ? { contains: username } : undefined,
            operation: operation ? { contains: operation } : undefined,
            path: path ? { contains: path } : undefined,
            params: paramsKeyword ? { contains: paramsKeyword } : undefined,
            actionKind: actionKind ? { contains: actionKind } : undefined,
            targetType: targetType ? { contains: targetType } : undefined,
            targetId: targetId ? { contains: targetId } : undefined,
            ...(String(batchOnly || '') === 'true'
                ? {
                    targetCount: {
                        gt: 1,
                    },
                }
                : {}),
        };
        const [total, list] = await Promise.all([
            this.prisma.operationLog.count({ where }),
            this.prisma.operationLog.findMany({
                where,
                orderBy: { createTime: 'desc' },
                skip,
                take: Number(pageSize),
            }),
        ]);
        return {
            total,
            list,
            page: Number(page),
            pageSize: Number(pageSize),
        };
    }
    async findAllSystemLogs(query) {
        const { level, module, message, stackKeyword, hasStack, page = 1, pageSize = 20, } = query;
        const skip = (page - 1) * pageSize;
        return this.prisma.systemLog.findMany({
            where: {
                level: level || undefined,
                module: module || undefined,
                message: message ? { contains: message } : undefined,
                stack: stackKeyword ? { contains: stackKeyword } : undefined,
                ...(String(hasStack || '') === 'true'
                    ? {
                        NOT: {
                            stack: null,
                        },
                    }
                    : {}),
            },
            orderBy: { createTime: 'desc' },
            skip: parseInt(skip.toString()),
            take: parseInt(pageSize.toString()),
        });
    }
    async findSystemLogsPage(query) {
        const { level, module, message, stackKeyword, hasStack, page = 1, pageSize = 20, } = query;
        const skip = (Number(page) - 1) * Number(pageSize);
        const where = {
            level: level || undefined,
            module: module || undefined,
            message: message ? { contains: message } : undefined,
            stack: stackKeyword ? { contains: stackKeyword } : undefined,
            ...(String(hasStack || '') === 'true'
                ? {
                    NOT: {
                        stack: null,
                    },
                }
                : {}),
        };
        const [total, list] = await Promise.all([
            this.prisma.systemLog.count({ where }),
            this.prisma.systemLog.findMany({
                where,
                orderBy: { createTime: 'desc' },
                skip,
                take: Number(pageSize),
            }),
        ]);
        return {
            total,
            list,
            page: Number(page),
            pageSize: Number(pageSize),
        };
    }
    async findSystemLogsStats(query) {
        const { dateRange = '7d', level, module, message, stackKeyword, hasStack, } = query;
        const rangeStart = this.resolveRangeStart(String(dateRange || '7d'));
        const where = {
            createTime: { gte: rangeStart },
            level: level || undefined,
            module: module || undefined,
            message: message ? { contains: message } : undefined,
            stack: stackKeyword ? { contains: stackKeyword } : undefined,
            ...(String(hasStack || '') === 'true'
                ? {
                    NOT: {
                        stack: null,
                    },
                }
                : {}),
        };
        const logs = await this.prisma.systemLog.findMany({
            where,
            select: {
                createTime: true,
                level: true,
                module: true,
                stack: true,
            },
            orderBy: { createTime: 'asc' },
        });
        const trendMap = new Map();
        const levelMap = new Map();
        const moduleMap = new Map();
        let stackCount = 0;
        for (const item of logs) {
            const day = this.formatDay(item.createTime);
            trendMap.set(day, (trendMap.get(day) || 0) + 1);
            levelMap.set(item.level || 'UNKNOWN', (levelMap.get(item.level || 'UNKNOWN') || 0) + 1);
            moduleMap.set(item.module || 'UNKNOWN', (moduleMap.get(item.module || 'UNKNOWN') || 0) + 1);
            if (item.stack) {
                stackCount += 1;
            }
        }
        return {
            trend: Array.from(trendMap.entries()).map(([date, value]) => ({
                date,
                value,
            })),
            levelDistribution: Array.from(levelMap.entries()).map(([name, value]) => ({ name, value })),
            moduleDistribution: Array.from(moduleMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6),
            stackCount,
        };
    }
    async findViolationLogs(query, user) {
        const { id, page = 1, pageSize = 10, keyword, userId, username, status, myHandledOnly, overdueOnly, dateRange = 'today', } = query;
        const skip = (Number(page) - 1) * Number(pageSize);
        const rangeStart = this.resolveRangeStart(String(dateRange || 'today'));
        const overdueTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const alertWhere = {
            id: id ? String(id).trim() : undefined,
            createTime: {
                gte: rangeStart,
                ...(String(overdueOnly || '') === 'true' ? { lte: overdueTime } : {}),
            },
            keyword: keyword ? { contains: keyword } : undefined,
            status: status !== undefined && status !== '' ? Number(status) : undefined,
            handleBy: String(myHandledOnly || '') === 'true'
                ? user?.username || '__no_user__'
                : undefined,
            deptId: user?.roles?.includes('SUPER_ADMIN')
                ? undefined
                : user?.deptId || '__no_access__',
        };
        const [total, alerts] = await Promise.all([
            this.prisma.realtimeAlert.count({ where: alertWhere }),
            this.prisma.realtimeAlert.findMany({
                where: alertWhere,
                orderBy: { createTime: 'desc' },
                skip,
                take: Number(pageSize),
            }),
        ]);
        const sessionIds = Array.from(new Set(alerts.map((item) => item.sessionId).filter(Boolean)));
        const sessions = sessionIds.length
            ? await this.prisma.chatSession.findMany({
                where: {
                    id: { in: sessionIds },
                    ...(userId ? { userId } : {}),
                    ...(username ? { user: { username: { contains: username } } } : {}),
                },
                include: { user: true },
            })
            : [];
        const sessionMap = new Map(sessions.map((item) => [item.id, item]));
        const list = alerts
            .map((item) => {
            const session = sessionMap.get(item.sessionId);
            if (userId && !session) {
                return null;
            }
            return {
                ...item,
                username: session?.user?.username || null,
                userId: session?.userId || null,
                statusLabel: this.resolveViolationStatusLabel(item.status),
            };
        })
            .filter(Boolean);
        return {
            total: userId ? list.length : total,
            list,
            page: Number(page),
            pageSize: Number(pageSize),
        };
    }
    async findViolationStats(query, user) {
        const { dateRange = 'today' } = query;
        const rangeStart = this.resolveRangeStart(String(dateRange || 'today'));
        const alerts = await this.prisma.realtimeAlert.findMany({
            where: {
                createTime: { gte: rangeStart },
                deptId: user?.roles?.includes('SUPER_ADMIN')
                    ? undefined
                    : user?.deptId || '__no_access__',
            },
            orderBy: { createTime: 'asc' },
            take: 500,
        });
        const trendMap = new Map();
        const keywordMap = new Map();
        const hourlyMap = new Map();
        const statusMap = new Map();
        const sessionIds = Array.from(new Set(alerts.map((item) => item.sessionId).filter(Boolean)));
        const sessions = sessionIds.length
            ? await this.prisma.chatSession.findMany({
                where: {
                    id: { in: sessionIds },
                },
                include: { user: true },
            })
            : [];
        const sessionMap = new Map(sessions.map((item) => [item.id, item]));
        const agentMap = new Map();
        for (const item of alerts) {
            const day = this.formatDay(item.createTime);
            trendMap.set(day, (trendMap.get(day) || 0) + 1);
            keywordMap.set(item.keyword, (keywordMap.get(item.keyword) || 0) + 1);
            statusMap.set(this.resolveViolationStatusLabel(item.status), (statusMap.get(this.resolveViolationStatusLabel(item.status)) || 0) + 1);
            const hour = `${new Date(item.createTime).getHours()}`.padStart(2, '0');
            hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
            const session = sessionMap.get(item.sessionId);
            const agentName = session?.user?.username || '未知客服';
            const existingAgent = agentMap.get(agentName) || {
                value: 0,
                userId: session?.user?.id || null,
            };
            existingAgent.value += 1;
            if (!existingAgent.userId && session?.user?.id) {
                existingAgent.userId = session.user.id;
            }
            agentMap.set(agentName, existingAgent);
        }
        return {
            trend: Array.from(trendMap.entries()).map(([date, value]) => ({
                date,
                value,
            })),
            topKeywords: Array.from(keywordMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6),
            hourlyDistribution: Array.from(hourlyMap.entries())
                .map(([hour, value]) => ({ hour: `${hour}:00`, value }))
                .sort((a, b) => a.hour.localeCompare(b.hour)),
            agentRanking: Array.from(agentMap.entries())
                .map(([name, payload]) => ({
                name,
                value: payload.value,
                userId: payload.userId,
            }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6),
            statusDistribution: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
        };
    }
    async handleViolation(id, body, user) {
        const alert = await this.prisma.realtimeAlert.findUnique({ where: { id } });
        if (!alert) {
            throw new Error('Violation alert not found');
        }
        if (!user?.roles?.includes('SUPER_ADMIN') &&
            alert.deptId !== user?.deptId) {
            throw new Error('No permission to handle this alert');
        }
        return this.prisma.realtimeAlert.update({
            where: { id },
            data: {
                status: Number(body.status),
                handleRemark: body.handleRemark
                    ? String(body.handleRemark).trim()
                    : null,
                handleBy: user?.username || user?.name || '当前用户',
                handleTime: new Date(),
            },
        });
    }
    async handleViolationsBulk(body, user) {
        const ids = Array.from(new Set((body.ids || []).filter(Boolean)));
        if (ids.length === 0) {
            throw new Error('No alerts selected');
        }
        const where = {
            id: { in: ids },
            ...(user?.roles?.includes('SUPER_ADMIN')
                ? {}
                : { deptId: user?.deptId || '__no_access__' }),
        };
        const result = await this.prisma.realtimeAlert.updateMany({
            where,
            data: {
                status: Number(body.status),
                handleRemark: body.handleRemark
                    ? String(body.handleRemark).trim()
                    : null,
                handleBy: user?.username || user?.name || '当前用户',
                handleTime: new Date(),
            },
        });
        return {
            success: true,
            count: result.count,
        };
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
    formatDay(input) {
        const date = new Date(input);
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${month}-${day}`;
    }
    resolveViolationStatusLabel(status) {
        if (status === 1) {
            return '已处理';
        }
        if (status === 2) {
            return '误报';
        }
        return '待处理';
    }
};
exports.LogService = LogService;
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogService);
//# sourceMappingURL=log.service.js.map