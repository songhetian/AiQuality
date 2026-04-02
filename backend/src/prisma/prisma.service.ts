import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('环境变量 DATABASE_URL 未定义，请检查根目录 .env 文件。');
    }

    super({
      adapter: new PrismaMariaDb(databaseUrl),
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    (this as any).$on('warn', (event: { message: string }) => {
      this.logger.warn(this.translatePrismaLog(event.message));
    });

    (this as any).$on('error', (event: { message: string }) => {
      this.logger.error(this.translatePrismaLog(event.message));
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[prisma] MySQL connected');
    } catch (error) {
      this.logger.error('❌ 数据库连接失败:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private translatePrismaLog(message: string) {
    const lowered = message.toLowerCase();

    if (
      lowered.includes('pool timeout') ||
      lowered.includes('failed to retrieve a connection from pool')
    ) {
      return 'Prisma 数据库连接池超时，请检查数据库负载或连接池配置';
    }

    if (lowered.includes("can't reach database server")) {
      return 'Prisma 无法连接数据库服务，请检查数据库地址、端口和服务状态';
    }

    return `Prisma: ${message}`;
  }
}
