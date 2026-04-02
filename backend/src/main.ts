import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载根目录的 .env 文件 (必须在 NestFactory 之前加载)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
  });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RedisIoAdapter } from './socket/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn'],
  });

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 跨域支持
  app.enableCors();

  // 配置 Redis Socket 适配器
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`[bootstrap] API ready: http://localhost:${port}/api`);
  console.log(
    `[bootstrap] Environment: ${process.env.NODE_ENV || 'development'}`,
  );
}
bootstrap();
