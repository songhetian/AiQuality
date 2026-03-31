import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'alerts',
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(client.id, userId);
      this.logger.log(`User ${userId} connected with socketId ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    this.logger.log(`User ${userId} disconnected`);
  }

  /**
   * 推送实时违规提醒
   */
  sendRealtimeAlert(userId: string, alertData: any) {
    // 找到该用户的全部连接并推送
    for (const [socketId, uId] of this.connectedUsers.entries()) {
      if (uId === userId) {
        this.server.to(socketId).emit('violation_alert', alertData);
      }
    }
    // 同时广播给管理员角色
    this.server.emit('admin_alert', alertData);
  }

  /**
   * 推送质检任务进度
   */
  sendTaskProgress(taskId: string, progress: number) {
    this.server.emit('task_progress', { taskId, progress });
  }

  /**
   * 推送单会话质检状态变更
   */
  sendQualityStatusChanged(payload: {
    sessionId: string;
    inspectionId: string;
    status: number;
    aiScore?: number | null;
    aiResult?: string | null;
    updatedAt?: string;
    manualReviewNeeded?: boolean;
    qualitySummary?: string;
  }) {
    this.server.emit('quality_status_changed', payload);
  }
}
