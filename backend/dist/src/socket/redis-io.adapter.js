"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const common_1 = require("@nestjs/common");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    adapterConstructor;
    logger = new common_1.Logger(RedisIoAdapter.name);
    async connectToRedis() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = process.env.REDIS_PORT || 6379;
        const url = `redis://${host}:${port}`;
        const pubClient = (0, redis_1.createClient)({ url });
        const subClient = pubClient.duplicate();
        try {
            await Promise.all([pubClient.connect(), subClient.connect()]);
            this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
            console.log(`[redis-socket] Socket adapter connected: ${url}`);
        }
        catch (error) {
            this.logger.error(`❌ Socket.io Redis 适配器连接失败: ${error.message}`);
            throw error;
        }
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map