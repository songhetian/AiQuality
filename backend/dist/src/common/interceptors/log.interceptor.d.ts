import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LogService } from '../../log/log.service';
export declare class LogInterceptor implements NestInterceptor {
    private logService;
    private readonly logger;
    constructor(logService: LogService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
