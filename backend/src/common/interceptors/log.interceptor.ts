import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogService } from '../../log/log.service';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogInterceptor.name);

  constructor(private logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    // 仅记录变更操作
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const now = Date.now();
    return next.handle().pipe(
      tap(async () => {
        const responseTime = Date.now() - now;
        const user = req.user || {};

        try {
          const sanitizedBody = this.logService.sanitizeParams(req.body || {});
          const operationMeta = this.logService.buildOperationMeta(
            method,
            url,
            sanitizedBody as Record<string, any>,
          );
          await this.logService.createOperationLog({
            userId: user.id,
            username: user.username,
            platformId: user.platformId,
            deptId: user.deptId,
            operation: operationMeta.operation,
            actionKind: operationMeta.actionKind,
            targetType: operationMeta.targetType,
            targetId: operationMeta.targetId,
            targetCount: operationMeta.targetCount,
            method,
            path: url,
            params: JSON.stringify(sanitizedBody).slice(0, 1000), // 截断过长参数
            ip: req.ip,
            status: 200,
            responseTime,
          });
        } catch (error) {
          this.logger.error('Failed to write audit log', error);
        }
      }),
    );
  }
}
