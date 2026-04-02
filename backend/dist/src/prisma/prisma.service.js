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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('环境变量 DATABASE_URL 未定义，请检查根目录 .env 文件。');
        }
        super({
            adapter: new adapter_mariadb_1.PrismaMariaDb(databaseUrl),
            log: [
                { emit: 'event', level: 'warn' },
                { emit: 'event', level: 'error' },
            ],
        });
        this.$on('warn', (event) => {
            this.logger.warn(this.translatePrismaLog(event.message));
        });
        this.$on('error', (event) => {
            this.logger.error(this.translatePrismaLog(event.message));
        });
    }
    async onModuleInit() {
        try {
            await this.$connect();
            console.log('[prisma] MySQL connected');
        }
        catch (error) {
            this.logger.error('❌ 数据库连接失败:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    translatePrismaLog(message) {
        const lowered = message.toLowerCase();
        if (lowered.includes('pool timeout') ||
            lowered.includes('failed to retrieve a connection from pool')) {
            return 'Prisma 数据库连接池超时，请检查数据库负载或连接池配置';
        }
        if (lowered.includes("can't reach database server")) {
            return 'Prisma 无法连接数据库服务，请检查数据库地址、端口和服务状态';
        }
        return `Prisma: ${message}`;
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map