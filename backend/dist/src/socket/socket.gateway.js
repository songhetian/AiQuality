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
var SocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let SocketGateway = SocketGateway_1 = class SocketGateway {
    server;
    logger = new common_1.Logger(SocketGateway_1.name);
    connectedUsers = new Map();
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            this.connectedUsers.set(client.id, userId);
            this.logger.log(`User ${userId} connected with socketId ${client.id}`);
        }
    }
    handleDisconnect(client) {
        const userId = this.connectedUsers.get(client.id);
        this.connectedUsers.delete(client.id);
        this.logger.log(`User ${userId} disconnected`);
    }
    sendRealtimeAlert(userId, alertData) {
        for (const [socketId, uId] of this.connectedUsers.entries()) {
            if (uId === userId) {
                this.server.to(socketId).emit('violation_alert', alertData);
            }
        }
        this.server.emit('admin_alert', alertData);
    }
    sendTaskProgress(taskId, progress) {
        this.server.emit('task_progress', { taskId, progress });
    }
    sendQualityStatusChanged(payload) {
        this.server.emit('quality_status_changed', payload);
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
exports.SocketGateway = SocketGateway = SocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'alerts',
    }),
    (0, common_1.Injectable)()
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map