"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const rawMessage = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : '服务器异常';
        const message = this.normalizeMessage(typeof rawMessage === 'string'
            ? rawMessage
            : rawMessage.message || rawMessage);
        response.status(status).json({
            code: status,
            message,
            data: null,
            timestamp: Date.now(),
        });
    }
    normalizeMessage(message) {
        if (Array.isArray(message)) {
            return message.map((item) => this.normalizeMessage(item)).join('；');
        }
        if (typeof message !== 'string') {
            return '服务器异常，请稍后重试';
        }
        const text = message.trim();
        const lowered = text.toLowerCase();
        if (lowered.includes('pool timeout') ||
            lowered.includes('failed to retrieve a connection from pool')) {
            return '数据库连接池繁忙，请稍后重试';
        }
        if (lowered.includes('can\'t reach database server') ||
            lowered.includes('database connection failed') ||
            lowered.includes('database is unavailable')) {
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map