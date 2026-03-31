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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AdapterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const quality_service_1 = require("../quality/quality.service");
const keyword_service_1 = require("../keyword/keyword.service");
let AdapterService = AdapterService_1 = class AdapterService {
    prisma;
    qualityService;
    keywordService;
    logger = new common_1.Logger(AdapterService_1.name);
    constructor(prisma, qualityService, keywordService) {
        this.prisma = prisma;
        this.qualityService = qualityService;
        this.keywordService = keywordService;
    }
    async findInterfaces(user) {
        const isSuperAdmin = user.roles?.includes('SUPER_ADMIN');
        return this.prisma.adapterInterface.findMany({
            where: {
                ...(isSuperAdmin ? {} : { deptId: user.deptId || undefined }),
            },
            include: {
                platform: true,
                department: true,
                mappings: {
                    where: { status: 1 },
                    orderBy: { createTime: 'asc' },
                },
                fakeData: {
                    where: { status: 1 },
                    orderBy: { updateTime: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createTime: 'desc' },
        });
    }
    async getConfigOptions() {
        const [platforms, departments] = await Promise.all([
            this.prisma.platform.findMany({
                where: { status: 1 },
                orderBy: { createTime: 'asc' },
                select: { id: true, name: true, code: true },
            }),
            this.prisma.department.findMany({
                where: { status: 1 },
                orderBy: { createTime: 'asc' },
                select: { id: true, name: true, code: true, platformId: true },
            }),
        ]);
        return { platforms, departments };
    }
    async createInterface(payload) {
        return this.prisma.$transaction(async (tx) => {
            const created = await tx.adapterInterface.create({
                data: {
                    name: String(payload.name || '').trim(),
                    type: String(payload.type || '').trim(),
                    url: String(payload.url || '').trim(),
                    method: String(payload.method || 'GET').trim().toUpperCase(),
                    platformId: String(payload.platformId || '').trim(),
                    deptId: payload.deptId || undefined,
                    headers: payload.headers?.trim() || undefined,
                    authParams: payload.authParams?.trim() || undefined,
                    enableFakeData: Boolean(payload.enableFakeData),
                    status: Number(payload.status) === 0 ? 0 : 1,
                },
            });
            await this.replaceMappings(tx, created.id, payload.mappings || []);
            return tx.adapterInterface.findUnique({
                where: { id: created.id },
                include: {
                    platform: true,
                    department: true,
                    mappings: {
                        where: { status: 1 },
                        orderBy: { createTime: 'asc' },
                    },
                    fakeData: {
                        where: { status: 1 },
                        orderBy: { updateTime: 'desc' },
                        take: 1,
                    },
                },
            });
        });
    }
    async updateInterface(interfaceId, payload) {
        return this.prisma.$transaction(async (tx) => {
            await tx.adapterInterface.update({
                where: { id: interfaceId },
                data: {
                    name: String(payload.name || '').trim(),
                    type: String(payload.type || '').trim(),
                    url: String(payload.url || '').trim(),
                    method: String(payload.method || 'GET').trim().toUpperCase(),
                    platformId: String(payload.platformId || '').trim(),
                    deptId: payload.deptId || null,
                    headers: payload.headers?.trim() || null,
                    authParams: payload.authParams?.trim() || null,
                    enableFakeData: Boolean(payload.enableFakeData),
                    status: Number(payload.status) === 0 ? 0 : 1,
                },
            });
            await this.replaceMappings(tx, interfaceId, payload.mappings || []);
            return tx.adapterInterface.findUnique({
                where: { id: interfaceId },
                include: {
                    platform: true,
                    department: true,
                    mappings: {
                        where: { status: 1 },
                        orderBy: { createTime: 'asc' },
                    },
                    fakeData: {
                        where: { status: 1 },
                        orderBy: { updateTime: 'desc' },
                        take: 1,
                    },
                },
            });
        });
    }
    async updateInterfaceStatus(interfaceId, status) {
        return this.prisma.adapterInterface.update({
            where: { id: interfaceId },
            data: { status: Number(status) === 0 ? 0 : 1 },
        });
    }
    async resolveAutoQualityRuleId(deptId) {
        const rule = await this.prisma.qualityRule.findFirst({
            where: {
                status: 1,
                OR: [{ deptId: deptId || undefined }, { deptId: null }],
            },
            orderBy: [{ deptId: 'desc' }, { updateTime: 'desc' }],
        });
        return rule?.id || null;
    }
    async processRealtimeMessage(platformCode, rawBody) {
        const startedAt = Date.now();
        let interfaceId = '';
        let normalizedPayload = null;
        try {
            const config = await this.prisma.adapterInterface.findFirst({
                where: {
                    status: 1,
                    platform: { code: platformCode },
                },
                include: { mappings: true, platform: true, department: true },
                orderBy: { createTime: 'asc' },
            });
            if (!config) {
                throw new Error(`No active adapter interface found for platform ${platformCode}`);
            }
            interfaceId = config.id;
            const normalized = this.transformData(rawBody, config.mappings);
            normalizedPayload = normalized;
            const sessionId = this.ensureString(normalized.sessionId) || `wh_${Date.now()}`;
            const shop = await this.resolveShop(config.platformId, config.deptId, normalized);
            const senderType = this.normalizeSenderType(normalized.senderType);
            const sendTime = this.normalizeDate(normalized.sendTime) || new Date();
            const isSessionEnd = this.normalizeBoolean(normalized.isSessionEnd);
            const session = await this.prisma.chatSession.upsert({
                where: { sessionId },
                update: {
                    updateTime: new Date(),
                    endTime: isSessionEnd ? sendTime : undefined,
                },
                create: {
                    sessionId,
                    platformId: config.platformId,
                    deptId: config.deptId || shop.deptId,
                    shopId: shop.id,
                    interfaceId: config.id,
                    userId: this.ensureString(normalized.userId) || undefined,
                    startTime: sendTime,
                    endTime: isSessionEnd ? sendTime : undefined,
                },
            });
            const record = await this.prisma.chatRecord.create({
                data: {
                    sessionId: session.id,
                    senderType,
                    senderId: this.ensureString(normalized.senderId) || undefined,
                    content: this.ensureString(normalized.content) || '',
                    contentType: this.ensureString(normalized.contentType) || 'TEXT',
                    sendTime,
                },
            });
            if (senderType === 'AGENT' && record.content.trim()) {
                await this.keywordService.detectKeywords(record.content, session.deptId, session.id, session.userId || '');
            }
            await this.recordMonitor(config.id, Date.now() - startedAt, 'ONLINE', 1);
            await this.writeAdapterAuditLog('info', 'webhook_processed', {
                platformCode,
                interfaceId: config.id,
                responseTime: Date.now() - startedAt,
                rawBody,
                normalized,
                sessionId,
                recordId: record.id,
                matchedShopId: shop.id,
            });
            if (isSessionEnd) {
                this.resolveAutoQualityRuleId(session.deptId)
                    .then((ruleId) => {
                    if (!ruleId) {
                        this.logger.warn(`Skip auto quality for session ${session.id}: no active quality rule found`);
                        return;
                    }
                    return this.qualityService.startBatchQuality(session.deptId, [session.id], ruleId);
                })
                    .catch((err) => this.logger.error('Auto quality trigger failed', err));
            }
            return { status: 'RECEIVED', recordId: record.id };
        }
        catch (error) {
            if (interfaceId) {
                await this.recordMonitor(interfaceId, Date.now() - startedAt, 'OFFLINE', 0);
            }
            await this.writeAdapterAuditLog('error', 'webhook_failed', {
                platformCode,
                interfaceId: interfaceId || null,
                responseTime: Date.now() - startedAt,
                rawBody,
                normalized: normalizedPayload,
                errorMessage: error instanceof Error ? error.message : String(error),
            });
            this.logger.error('Webhook processing failed', error);
            throw error;
        }
    }
    async collectChatData(interfaceId, options) {
        const config = await this.prisma.adapterInterface.findUnique({
            where: { id: interfaceId },
            include: {
                mappings: true,
                fakeData: true,
                platform: true,
                department: true,
            },
        });
        if (!config || config.status === 0) {
            throw new Error('Interface configuration not found or disabled.');
        }
        let rawData;
        const startedAt = Date.now();
        try {
            if (config.enableFakeData) {
                rawData = config.fakeData[0]?.fakeData
                    ? JSON.parse(config.fakeData[0].fakeData)
                    : [];
            }
            else {
                const response = await (0, axios_1.default)({
                    url: config.url,
                    method: config.method,
                    headers: config.headers ? JSON.parse(config.headers) : {},
                    params: config.authParams ? JSON.parse(config.authParams) : {},
                    timeout: 5000,
                });
                rawData = response.data;
            }
            const transformed = this.transformData(rawData, config.mappings);
            let persisted = { sessionCount: 0, recordCount: 0, alertCount: 0 };
            if (options?.persist) {
                persisted = await this.persistCollectedMessages(config, transformed);
            }
            await this.recordMonitor(interfaceId, Date.now() - startedAt, 'ONLINE', 1);
            await this.writeAdapterAuditLog('info', 'collect_success', {
                interfaceId,
                responseTime: Date.now() - startedAt,
                persisted,
                sampleRawData: this.pickSamplePayload(rawData),
                sampleNormalizedData: this.pickSamplePayload(transformed),
            });
            return {
                list: transformed,
                persisted,
            };
        }
        catch (error) {
            await this.recordMonitor(interfaceId, Date.now() - startedAt, 'OFFLINE', 0);
            await this.writeAdapterAuditLog('error', 'collect_failed', {
                interfaceId,
                responseTime: Date.now() - startedAt,
                sampleRawData: this.pickSamplePayload(rawData),
                errorMessage: error instanceof Error ? error.message : String(error),
            });
            this.logger.error(`Error collecting data from interface ${interfaceId}:`, error);
            throw error;
        }
    }
    transformData(rawData, mappings) {
        if (!mappings || mappings.length === 0)
            return rawData;
        const transformSingle = (item) => {
            const result = {};
            mappings.forEach((mapping) => {
                const value = this.resolveMappedValue(item, mapping.thirdPartyFields);
                if (value !== undefined) {
                    const finalValue = this.applyFormatMapping(value, mapping.formatMapping, item);
                    result[mapping.systemFields] = finalValue;
                }
            });
            return result;
        };
        return Array.isArray(rawData)
            ? rawData.map(transformSingle)
            : transformSingle(rawData);
    }
    async replaceMappings(tx, interfaceId, mappings) {
        await tx.dataMapping.deleteMany({
            where: { interfaceId },
        });
        const validMappings = (mappings || []).filter((item) => String(item?.thirdPartyFields || '').trim() &&
            String(item?.systemFields || '').trim());
        if (validMappings.length === 0) {
            return;
        }
        await tx.dataMapping.createMany({
            data: validMappings.map((item) => ({
                interfaceId,
                thirdPartyFields: String(item.thirdPartyFields).trim(),
                systemFields: String(item.systemFields).trim(),
                formatMapping: item.formatMapping?.trim() || null,
                remark: item.remark?.trim() || null,
                status: 1,
            })),
        });
    }
    async setFakeData(interfaceId, data, scene) {
        return this.prisma.fakeData.upsert({
            where: { id: interfaceId },
            create: { interfaceId, fakeData: JSON.stringify(data), scene },
            update: { fakeData: JSON.stringify(data), scene },
        });
    }
    async toggleFakeMode(interfaceId, enable) {
        return this.prisma.adapterInterface.update({
            where: { id: interfaceId },
            data: { enableFakeData: enable },
        });
    }
    async getMonitor(interfaceId) {
        return this.prisma.adapterMonitor.findMany({
            where: { interfaceId },
            orderBy: { createTime: 'desc' },
            take: 10,
        });
    }
    async previewMapping(interfaceId, payload) {
        const config = await this.prisma.adapterInterface.findUnique({
            where: { id: interfaceId },
            include: { mappings: true, platform: true, department: true },
        });
        if (!config || config.status === 0) {
            throw new Error('Interface configuration not found or disabled.');
        }
        const normalized = this.transformData(payload, config.mappings);
        let shopMatch = null;
        try {
            const shop = await this.resolveShop(config.platformId, config.deptId, normalized);
            shopMatch = { id: shop.id, name: shop.name, code: shop.code };
        }
        catch {
            shopMatch = null;
        }
        return {
            interfaceId: config.id,
            platformId: config.platformId,
            deptId: config.deptId,
            normalized,
            preview: {
                sessionId: this.ensureString(normalized.sessionId) || `wh_${Date.now()}`,
                senderType: this.normalizeSenderType(normalized.senderType),
                sendTime: this.normalizeDate(normalized.sendTime)?.toISOString() || null,
                isSessionEnd: this.normalizeBoolean(normalized.isSessionEnd),
                matchedShop: shopMatch,
            },
        };
    }
    async persistCollectedMessages(config, transformed) {
        const rows = Array.isArray(transformed) ? transformed : [transformed];
        let sessionCount = 0;
        let recordCount = 0;
        let alertCount = 0;
        const touchedSessions = new Set();
        for (const row of rows) {
            if (!row || typeof row !== 'object') {
                continue;
            }
            const result = await this.persistNormalizedMessage(config, row);
            if (!touchedSessions.has(result.sessionId)) {
                touchedSessions.add(result.sessionId);
                sessionCount += 1;
            }
            recordCount += 1;
            alertCount += result.alertCount;
        }
        return { sessionCount, recordCount, alertCount };
    }
    async persistNormalizedMessage(config, normalized) {
        const sessionId = this.ensureString(normalized.sessionId) ||
            `sync_${Date.now()}_${Math.random()}`;
        const shop = await this.resolveShop(config.platformId, config.deptId, normalized);
        const senderType = this.normalizeSenderType(normalized.senderType);
        const sendTime = this.normalizeDate(normalized.sendTime) || new Date();
        const isSessionEnd = this.normalizeBoolean(normalized.isSessionEnd);
        const session = await this.prisma.chatSession.upsert({
            where: { sessionId },
            update: {
                updateTime: new Date(),
                endTime: isSessionEnd ? sendTime : undefined,
            },
            create: {
                sessionId,
                platformId: config.platformId,
                deptId: config.deptId || shop.deptId,
                shopId: shop.id,
                interfaceId: config.id,
                userId: this.ensureString(normalized.userId) || undefined,
                startTime: sendTime,
                endTime: isSessionEnd ? sendTime : undefined,
            },
        });
        const record = await this.prisma.chatRecord.create({
            data: {
                sessionId: session.id,
                senderType,
                senderId: this.ensureString(normalized.senderId) || undefined,
                content: this.ensureString(normalized.content) || '',
                contentType: this.ensureString(normalized.contentType) || 'TEXT',
                sendTime,
            },
        });
        let alertCount = 0;
        if (senderType === 'AGENT' && record.content.trim()) {
            const alerts = await this.keywordService.detectKeywords(record.content, session.deptId, session.id, session.userId || '');
            alertCount = alerts.length;
        }
        if (isSessionEnd) {
            this.resolveAutoQualityRuleId(session.deptId)
                .then((ruleId) => {
                if (!ruleId) {
                    this.logger.warn(`Skip auto quality for session ${session.id}: no active quality rule found`);
                    return;
                }
                return this.qualityService.startBatchQuality(session.deptId, [session.id], ruleId);
            })
                .catch((err) => this.logger.error('Auto quality trigger failed', err));
        }
        return {
            sessionId: session.id,
            recordId: record.id,
            alertCount,
        };
    }
    resolveMappedValue(item, fieldExpression) {
        const trimmed = String(fieldExpression || '').trim();
        if (!trimmed) {
            return undefined;
        }
        try {
            if (trimmed.startsWith('[')) {
                const fields = JSON.parse(trimmed);
                if (Array.isArray(fields)) {
                    for (const field of fields) {
                        const value = (0, lodash_1.get)(item, field);
                        if (value !== undefined && value !== null && value !== '') {
                            return value;
                        }
                    }
                }
            }
        }
        catch {
        }
        const candidates = trimmed
            .split('||')
            .map((field) => field.trim())
            .filter(Boolean);
        for (const candidate of candidates) {
            const value = (0, lodash_1.get)(item, candidate);
            if (value !== undefined && value !== null && value !== '') {
                return value;
            }
        }
        return undefined;
    }
    applyFormatMapping(value, formatMapping, source) {
        if (!formatMapping) {
            return value;
        }
        if (formatMapping === 'timestamp_to_date') {
            return this.normalizeDate(value) || value;
        }
        try {
            const parsed = JSON.parse(formatMapping);
            if (!parsed || typeof parsed !== 'object') {
                return value;
            }
            if (parsed.type === 'enum_map') {
                const mappedValue = parsed.map?.[String(value)];
                return mappedValue ?? parsed.default ?? value;
            }
            if (parsed.type === 'concat' && Array.isArray(parsed.fields)) {
                return parsed.fields
                    .map((field) => this.resolveMappedValue(source, field))
                    .filter((item) => item !== undefined && item !== null && item !== '')
                    .join(parsed.separator || '');
            }
            if (parsed.type === 'boolean_cast') {
                return this.normalizeBoolean(value);
            }
            if (parsed.type === 'number_cast') {
                const numericValue = Number(value);
                return Number.isNaN(numericValue) ? value : numericValue;
            }
        }
        catch {
            if (formatMapping === 'upper_case') {
                return String(value).toUpperCase();
            }
            if (formatMapping === 'lower_case') {
                return String(value).toLowerCase();
            }
        }
        return value;
    }
    async resolveShop(platformId, deptId, normalized) {
        const shopId = this.ensureString(normalized.shopId);
        const shopCode = this.ensureString(normalized.shopCode);
        const shopName = this.ensureString(normalized.shopName);
        const shop = await this.prisma.shop.findFirst({
            where: {
                platformId,
                ...(shopId ? { id: shopId } : {}),
                ...(shopCode ? { code: shopCode } : {}),
                ...(shopName ? { name: shopName } : {}),
                ...(deptId ? { deptId } : {}),
            },
        });
        if (shop) {
            return shop;
        }
        const fallbackShop = await this.prisma.shop.findFirst({
            where: {
                platformId,
                ...(deptId ? { deptId } : {}),
            },
            orderBy: { createTime: 'asc' },
        });
        if (!fallbackShop) {
            throw new Error('No shop configuration found for current adapter interface.');
        }
        return fallbackShop;
    }
    normalizeSenderType(value) {
        const normalizedValue = String(value || '')
            .trim()
            .toUpperCase();
        if (['CUSTOMER', 'USER', 'BUYER', 'CLIENT'].includes(normalizedValue)) {
            return 'CUSTOMER';
        }
        if (['SYSTEM', 'BOT'].includes(normalizedValue)) {
            return 'SYSTEM';
        }
        return 'AGENT';
    }
    normalizeDate(value) {
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === 'number' || /^\d+$/.test(String(value || ''))) {
            const timestamp = Number(value);
            if (!Number.isNaN(timestamp)) {
                return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
            }
        }
        if (typeof value === 'string' && value.trim()) {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
                return date;
            }
        }
        return undefined;
    }
    normalizeBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        const normalizedValue = String(value || '')
            .trim()
            .toLowerCase();
        return ['true', '1', 'yes', 'y', 'done', 'closed', 'end'].includes(normalizedValue);
    }
    ensureString(value) {
        if (value === undefined || value === null) {
            return '';
        }
        return String(value).trim();
    }
    async recordMonitor(interfaceId, responseTime, status, successRate) {
        await this.prisma.adapterMonitor.create({
            data: {
                interfaceId,
                responseTime: Math.max(1, responseTime),
                successRate,
                status,
            },
        });
    }
    async writeAdapterAuditLog(level, event, payload) {
        const serializedPayload = this.safeJsonStringify(payload);
        await this.prisma.systemLog.create({
            data: {
                level: level.toUpperCase(),
                module: 'ADAPTER',
                message: `[${event}] ${serializedPayload.slice(0, 1000)}`,
                stack: serializedPayload.slice(0, 20000),
            },
        });
    }
    pickSamplePayload(payload) {
        if (Array.isArray(payload)) {
            return payload.slice(0, 3);
        }
        return payload ?? null;
    }
    safeJsonStringify(payload) {
        try {
            return JSON.stringify(payload, (_key, value) => {
                if (value instanceof Date) {
                    return value.toISOString();
                }
                if (typeof value === 'string' && value.length > 4000) {
                    return `${value.slice(0, 4000)}...`;
                }
                return value;
            });
        }
        catch (error) {
            return JSON.stringify({
                fallback: 'serialize_failed',
                errorMessage: error instanceof Error ? error.message : String(error),
            });
        }
    }
};
exports.AdapterService = AdapterService;
exports.AdapterService = AdapterService = AdapterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => quality_service_1.QualityService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quality_service_1.QualityService,
        keyword_service_1.KeywordService])
], AdapterService);
//# sourceMappingURL=adapter.service.js.map