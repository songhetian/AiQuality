"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const common_1 = require("@nestjs/common");
const redis_io_adapter_1 = require("./socket/redis-io.adapter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.setGlobalPrefix('api');
    app.enableCors();
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map