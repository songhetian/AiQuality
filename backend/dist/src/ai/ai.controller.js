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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const insight_service_1 = require("./insight.service");
let AiController = class AiController {
    insightService;
    constructor(insightService) {
        this.insightService = insightService;
    }
    getHighFreqQuestions(query) {
        return this.insightService.getHighFreqQuestions(query);
    }
    getHighFreqQuestionTags() {
        return this.insightService.getHighFreqQuestionTags();
    }
    getLossAnalysis(query, req) {
        return this.insightService.getLossAnalysis(query, req.user);
    }
    getLossStats(query, req) {
        return this.insightService.getLossStats(query, req.user);
    }
    analyzeLoss(sessionId) {
        return this.insightService.analyzeLoss(sessionId);
    }
    updateLossFollowUp(id, body, req) {
        return this.insightService.updateLossFollowUp(id, body, req.user);
    }
    batchUpdateLossFollowUp(body, req) {
        return this.insightService.batchUpdateLossFollowUp(body, req.user);
    }
    getLossRule(query, req) {
        return this.insightService.getLossRule(query, req.user);
    }
    saveLossRule(body, req) {
        return this.insightService.saveLossRule(body, req.user);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('insight/question'),
    (0, permissions_decorator_1.Permissions)('insight:question'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getHighFreqQuestions", null);
__decorate([
    (0, common_1.Get)('insight/question/tags'),
    (0, permissions_decorator_1.Permissions)('insight:question'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getHighFreqQuestionTags", null);
__decorate([
    (0, common_1.Get)('insight/loss'),
    (0, permissions_decorator_1.Permissions)('insight:loss'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getLossAnalysis", null);
__decorate([
    (0, common_1.Get)('insight/loss/stats'),
    (0, permissions_decorator_1.Permissions)('insight:loss'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getLossStats", null);
__decorate([
    (0, common_1.Get)('insight/loss/analyze/:sessionId'),
    (0, permissions_decorator_1.Permissions)('insight:loss'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzeLoss", null);
__decorate([
    (0, common_1.Put)('insight/loss/:id/follow-up'),
    (0, permissions_decorator_1.Permissions)('insight:loss'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "updateLossFollowUp", null);
__decorate([
    (0, common_1.Put)('insight/loss/batch-follow-up'),
    (0, permissions_decorator_1.Permissions)('insight:loss'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "batchUpdateLossFollowUp", null);
__decorate([
    (0, common_1.Get)('insight/loss/rule'),
    (0, permissions_decorator_1.Permissions)('settings:loss_rule'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getLossRule", null);
__decorate([
    (0, common_1.Post)('insight/loss/rule'),
    (0, permissions_decorator_1.Permissions)('settings:loss_rule'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "saveLossRule", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('api/ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [insight_service_1.InsightService])
], AiController);
//# sourceMappingURL=ai.controller.js.map