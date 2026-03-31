import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogInterceptor } from './common/interceptors/log.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { CostModule } from './cost/cost.module';
import { QualityModule } from './quality/quality.module';
import { AdapterModule } from './adapter/adapter.module';
import { SocketModule } from './socket/socket.module';
import { KeywordModule } from './keyword/keyword.module';
import { RedisModule } from './redis/redis.module';
import { LogModule } from './log/log.module';
import { OssModule } from './oss/oss.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { SettingsModule } from './settings/settings.module';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: parseInt(config.get('REDIS_PORT') || '6379'),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),
    PrismaModule,
    QdrantModule,
    AuthModule,
    OrganizationModule,
    UserModule,
    TagModule,
    ChatModule,
    AiModule,
    CostModule,
    QualityModule,
    AdapterModule,
    SocketModule,
    KeywordModule,
    RedisModule,
    LogModule,
    OssModule,
    KnowledgeModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
  ],
})
export class AppModule {}
