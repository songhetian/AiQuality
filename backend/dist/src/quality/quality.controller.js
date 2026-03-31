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
exports.QualityController = void 0;
const common_1 = require("@nestjs/common");
const quality_service_1 = require("./quality.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let QualityController = class QualityController {
    qualityService;
    constructor(qualityService) {
        this.qualityService = qualityService;
    }
    findAll(query, req) {
        return this.qualityService.findAllInspections(query, req.user);
    }
    findOne(id, req) {
        return this.qualityService.findDetail(id, req.user);
    }
    findActiveRules(req) {
        return this.qualityService.findActiveRules(req.user);
    }
    startBatch(body, req) {
        return this.qualityService.startBatchQuality(req.user.deptId, body.sessionIds, body.ruleId);
    }
    async lockReview(sessionId, req) {
        const result = await this.qualityService.lockReview(sessionId, req.user.id, req.user.username || req.user.name || '当前用户');
        if (!result.success) {
            throw new common_1.ForbiddenException(`当前会话正由 ${result.owner} 进行复核，请稍后再试`);
        }
        return { message: '锁定成功' };
    }
    async unlockReview(sessionId, req) {
        await this.qualityService.unlockReview(sessionId, req.user.id);
        return { message: '已释放' };
    }
    retry(id, req) {
        return this.qualityService.retryInspection(id, req.user);
    }
    async update(id, data, req) {
        const user = req.user;
        const inspection = await this.qualityService.findDetail(id, user);
        const result = await this.qualityService.updateInspection(id, {
            ...data,
            inspector: { connect: { id: user.id } },
        });
        if (inspection?.sessionId) {
            await this.qualityService.unlockReview(inspection.sessionId, user.id);
        }
        return result;
    }
    batchUpdate(data, req) {
        return this.qualityService.batchUpdateInspections(data, req.user);
    }
};
exports.QualityController = QualityController;
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QualityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QualityController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('rules/active'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QualityController.prototype, "findActiveRules", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QualityController.prototype, "startBatch", null);
__decorate([
    (0, common_1.Post)('manual/lock/:sessionId'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QualityController.prototype, "lockReview", null);
__decorate([
    (0, common_1.Post)('manual/unlock/:sessionId'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QualityController.prototype, "unlockReview", null);
__decorate([
    (0, common_1.Post)('retry/:id'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QualityController.prototype, "retry", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QualityController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('batch-update'),
    (0, permissions_decorator_1.Permissions)('quality:view'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QualityController.prototype, "batchUpdate", null);
exports.QualityController = QualityController = __decorate([
    (0, common_1.Controller)('api/quality'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [quality_service_1.QualityService])
], QualityController);
//# sourceMappingURL=quality.controller.js.map