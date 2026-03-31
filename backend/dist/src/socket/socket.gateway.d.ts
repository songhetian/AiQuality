import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    sendRealtimeAlert(userId: string, alertData: any): void;
    sendTaskProgress(taskId: string, progress: number): void;
    sendQualityStatusChanged(payload: {
        sessionId: string;
        inspectionId: string;
        status: number;
        aiScore?: number | null;
        aiResult?: string | null;
        updatedAt?: string;
        manualReviewNeeded?: boolean;
        qualitySummary?: string;
    }): void;
}
