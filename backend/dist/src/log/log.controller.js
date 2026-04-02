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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("./log.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let LogController = class LogController {
    logService;
    constructor(logService) {
        this.logService = logService;
    }
    findOperationLogs(query) {
        return this.logService.findAllOperationLogs(query);
    }
    findOperationLogsPage(query) {
        return this.logService.findOperationLogsPage(query);
    }
    findSystemLogs(query) {
        return this.logService.findAllSystemLogs(query);
    }
    findSystemLogsPage(query) {
        return this.logService.findSystemLogsPage(query);
    }
    findSystemLogsStats(query) {
        return this.logService.findSystemLogsStats(query);
    }
    findViolationLogs(query, req) {
        return this.logService.findViolationLogs(query, req.user);
    }
    findViolationStats(query, req) {
        return this.logService.findViolationStats(query, req.user);
    }
    handleViolation(id, body, req) {
        return this.logService.handleViolation(id, body, req.user);
    }
    handleViolationsBulk(body, req) {
        return this.logService.handleViolationsBulk(body, req.user);
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Get)('operation/list'),
    (0, permissions_decorator_1.Permissions)('log:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findOperationLogs", null);
__decorate([
    (0, common_1.Get)('operation/page'),
    (0, permissions_decorator_1.Permissions)('log:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findOperationLogsPage", null);
__decorate([
    (0, common_1.Get)('system/list'),
    (0, permissions_decorator_1.Permissions)('log:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findSystemLogs", null);
__decorate([
    (0, common_1.Get)('system/page'),
    (0, permissions_decorator_1.Permissions)('log:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findSystemLogsPage", null);
__decorate([
    (0, common_1.Get)('system/stats'),
    (0, permissions_decorator_1.Permissions)('log:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findSystemLogsStats", null);
__decorate([
    (0, common_1.Get)('violation/list'),
    (0, permissions_decorator_1.Permissions)('violation:record'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findViolationLogs", null);
__decorate([
    (0, common_1.Get)('violation/stats'),
    (0, permissions_decorator_1.Permissions)('violation:record'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "findViolationStats", null);
__decorate([
    (0, common_1.Put)('violation/:id/handle'),
    (0, permissions_decorator_1.Permissions)('violation:record'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "handleViolation", null);
__decorate([
    (0, common_1.Put)('violation/batch-handle'),
    (0, permissions_decorator_1.Permissions)('violation:record'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LogController.prototype, "handleViolationsBulk", null);
exports.LogController = LogController = __decorate([
    (0, common_1.Controller)('log'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogController);
//# sourceMappingURL=log.controller.js.map