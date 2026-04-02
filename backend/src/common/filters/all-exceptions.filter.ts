import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : '服务器异常';

    const message = this.normalizeMessage(
      typeof rawMessage === 'string'
        ? rawMessage
        : (rawMessage as any).message || rawMessage,
    );

    response.status(status).json({
      code: status,
      message,
      data: null,
      timestamp: Date.now(),
    });
  }

  private normalizeMessage(message: unknown) {
    if (Array.isArray(message)) {
      return message.map((item) => this.normalizeMessage(item)).join('；');
    }

    if (typeof message !== 'string') {
      return '服务器异常，请稍后重试';
    }

    const text = message.trim();
    const lowered = text.toLowerCase();

    if (
      lowered.includes('pool timeout') ||
      lowered.includes('failed to retrieve a connection from pool')
    ) {
      return '数据库连接池繁忙，请稍后重试';
    }

    if (
      lowered.includes('can\'t reach database server') ||
      lowered.includes('database connection failed') ||
      lowered.includes('database is unavailable')
    ) {
      return '数据库连接失败，请检查数据库服务是否正常';
    }

    if (lowered.includes('redis')) {
      return 'Redis 服务暂不可用，请稍后重试';
    }

    if (lowered.includes('invalid credentials')) {
      return '账号或密码错误';
    }

    return text || '服务器异常，请稍后重试';
  }
}
