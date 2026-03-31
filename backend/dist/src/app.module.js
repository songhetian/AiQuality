"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const log_interceptor_1 = require("./common/interceptors/log.interceptor");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const qdrant_module_1 = require("./qdrant/qdrant.module");
const auth_module_1 = require("./auth/auth.module");
const organization_module_1 = require("./organization/organization.module");
const user_module_1 = require("./user/user.module");
const tag_module_1 = require("./tag/tag.module");
const chat_module_1 = require("./chat/chat.module");
const ai_module_1 = require("./ai/ai.module");
const cost_module_1 = require("./cost/cost.module");
const quality_module_1 = require("./quality/quality.module");
const adapter_module_1 = require("./adapter/adapter.module");
const socket_module_1 = require("./socket/socket.module");
const keyword_module_1 = require("./keyword/keyword.module");
const redis_module_1 = require("./redis/redis.module");
const log_module_1 = require("./log/log.module");
const oss_module_1 = require("./oss/oss.module");
const knowledge_module_1 = require("./knowledge/knowledge.module");
const settings_module_1 = require("./settings/settings.module");
const bull_1 = require("@nestjs/bull");
const throttler_1 = require("@nestjs/throttler");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 60,
                },
            ]),
            bull_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST') || 'localhost',
                        port: parseInt(config.get('REDIS_PORT') || '6379'),
                        password: config.get('REDIS_PASSWORD'),
                    },
                }),
            }),
            prisma_module_1.PrismaModule,
            qdrant_module_1.QdrantModule,
            auth_module_1.AuthModule,
            organization_module_1.OrganizationModule,
            user_module_1.UserModule,
            tag_module_1.TagModule,
            chat_module_1.ChatModule,
            ai_module_1.AiModule,
            cost_module_1.CostModule,
            quality_module_1.QualityModule,
            adapter_module_1.AdapterModule,
            socket_module_1.SocketModule,
            keyword_module_1.KeywordModule,
            redis_module_1.RedisModule,
            log_module_1.LogModule,
            oss_module_1.OssModule,
            knowledge_module_1.KnowledgeModule,
            settings_module_1.SettingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: log_interceptor_1.LogInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map