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
exports.CostController = void 0;
const common_1 = require("@nestjs/common");
const cost_service_1 = require("./cost.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let CostController = class CostController {
    costService;
    constructor(costService) {
        this.costService = costService;
    }
    async getSummary(req) {
        const deptId = req.user.roles?.includes('SUPER_ADMIN')
            ? undefined
            : req.user.deptId;
        return this.costService.getSummaryStats(deptId);
    }
    async getTrend(days, req) {
        const deptId = req.user.roles?.includes('SUPER_ADMIN')
            ? undefined
            : req.user.deptId;
        return this.costService.getTrendStats(parseInt(days || '7'), { deptId });
    }
    async getDeptDistribution(days, req) {
        const deptId = req.user.roles?.includes('SUPER_ADMIN')
            ? undefined
            : req.user.deptId;
        return this.costService.getDeptDistribution(parseInt(days || '30'), {
            deptId,
        });
    }
    async getPlatformDistribution(days, req) {
        const deptId = req.user.roles?.includes('SUPER_ADMIN')
            ? undefined
            : req.user.deptId;
        return this.costService.getPlatformDistribution(parseInt(days || '30'), {
            deptId,
        });
    }
    findAll(query) {
        return this.costService.getStatistics(query);
    }
    setBillingRule(data) {
        return this.costService.setBillingRule(data);
    }
};
exports.CostController = CostController;
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, permissions_decorator_1.Permissions)('cost:view'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CostController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('stats/trend'),
    (0, permissions_decorator_1.Permissions)('cost:view'),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CostController.prototype, "getTrend", null);
__decorate([
    (0, common_1.Get)('stats/dept-distribution'),
    (0, permissions_decorator_1.Permissions)('cost:view'),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CostController.prototype, "getDeptDistribution", null);
__decorate([
    (0, common_1.Get)('stats/platform-distribution'),
    (0, permissions_decorator_1.Permissions)('cost:view'),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CostController.prototype, "getPlatformDistribution", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, permissions_decorator_1.Permissions)('cost:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CostController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('billing-rule'),
    (0, permissions_decorator_1.Permissions)('cost:edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CostController.prototype, "setBillingRule", null);
exports.CostController = CostController = __decorate([
    (0, common_1.Controller)('cost'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [cost_service_1.CostService])
], CostController);
//# sourceMappingURL=cost.controller.js.map