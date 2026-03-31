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
var LogInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const log_service_1 = require("../../log/log.service");
let LogInterceptor = LogInterceptor_1 = class LogInterceptor {
    logService;
    logger = new common_1.Logger(LogInterceptor_1.name);
    constructor(logService) {
        this.logService = logService;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        if (!['POST', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const now = Date.now();
        return next.handle().pipe((0, operators_1.tap)(async () => {
            const responseTime = Date.now() - now;
            const user = req.user || {};
            try {
                const sanitizedBody = this.logService.sanitizeParams(req.body || {});
                const operationMeta = this.logService.buildOperationMeta(method, url, sanitizedBody);
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
                    params: JSON.stringify(sanitizedBody).slice(0, 1000),
                    ip: req.ip,
                    status: 200,
                    responseTime,
                });
            }
            catch (error) {
                this.logger.error('Failed to write audit log', error);
            }
        }));
    }
};
exports.LogInterceptor = LogInterceptor;
exports.LogInterceptor = LogInterceptor = LogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogInterceptor);
//# sourceMappingURL=log.interceptor.js.map