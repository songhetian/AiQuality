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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    configService;
    client;
    logger = new common_1.Logger(RedisService_1.name);
    inFlight = new Map();
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const host = this.configService.get('REDIS_HOST') || '127.0.0.1';
        const port = parseInt(this.configService.get('REDIS_PORT') || '6379', 10);
        this.client = new ioredis_1.default({
            host,
            port,
            password: this.configService.get('REDIS_PASSWORD') || undefined,
            db: 0,
            retryStrategy: (times) => {
                const delay = Math.min(times * 100, 3000);
                return delay;
            },
        });
        this.client.on('connect', () => {
            this.logger.log(`正在连接 Redis: ${host}:${port}...`);
        });
        this.client.on('ready', () => {
            this.logger.log(`✅ Redis 连接成功: ${host}:${port}`);
        });
        this.client.on('error', (err) => {
            this.logger.error(`❌ Redis 连接错误: ${err.message}`);
        });
    }
    onModuleDestroy() {
        this.client.disconnect();
    }
    async wrap(key, fn, ttl = 3600) {
        const cached = await this.getJson(key);
        if (cached !== null) {
            return cached;
        }
        const existing = this.inFlight.get(key);
        if (existing) {
            return existing;
        }
        const promise = (async () => {
            const cachedAgain = await this.getJson(key);
            if (cachedAgain !== null) {
                return cachedAgain;
            }
            const result = await fn();
            if (result !== undefined && result !== null) {
                await this.setJson(key, result, this.withJitter(ttl));
            }
            return result;
        })();
        this.inFlight.set(key, promise);
        try {
            return await promise;
        }
        finally {
            this.inFlight.delete(key);
        }
    }
    async delByPattern(pattern) {
        let cursor = '0';
        let deleted = 0;
        do {
            const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
            if (keys.length > 0) {
                deleted += await this.client.del(...keys);
            }
            cursor = nextCursor;
        } while (cursor !== '0');
        return deleted;
    }
    async acquireLock(key, ttl = 30) {
        const result = await this.client.set(key, '1', 'EX', ttl, 'NX');
        return result === 'OK';
    }
    async releaseLock(key) {
        return this.client.del(key);
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttl) {
        if (ttl) {
            return this.client.set(key, value, 'EX', ttl);
        }
        return this.client.set(key, value);
    }
    async del(key) {
        return this.client.del(key);
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async expire(key, ttl) {
        return this.client.expire(key, ttl);
    }
    async setJson(key, value, ttl) {
        return this.set(key, JSON.stringify(value), ttl);
    }
    async getJson(key) {
        const data = await this.get(key);
        return data ? JSON.parse(data) : null;
    }
    async tryLockReview(sessionId, userId, username) {
        const key = `review:lock:${sessionId}`;
        const value = JSON.stringify({ userId, username, time: Date.now() });
        const result = await this.client.set(key, value, 'EX', 900, 'NX');
        if (result === 'OK') {
            return { success: true };
        }
        const currentOwner = await this.getJson(key);
        return { success: false, owner: currentOwner?.username };
    }
    async unlockReview(sessionId, userId) {
        const key = `review:lock:${sessionId}`;
        const current = await this.getJson(key);
        if (current?.userId === userId) {
            await this.client.del(key);
        }
    }
    withJitter(ttl) {
        if (ttl <= 0) {
            return ttl;
        }
        const jitter = Math.max(1, Math.round(ttl * 0.1));
        return ttl + Math.floor(Math.random() * jitter);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map