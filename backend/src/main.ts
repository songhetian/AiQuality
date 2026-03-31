import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger } from '@nestjs/common';
import { RedisIoAdapter } from './socket/redis-io.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
  logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
