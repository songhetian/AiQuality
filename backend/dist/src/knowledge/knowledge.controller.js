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
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const knowledge_service_1 = require("./knowledge.service");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const throttler_1 = require("@nestjs/throttler");
let KnowledgeController = class KnowledgeController {
    knowledgeService;
    allowedKnowledgeMimeTypes = [
        'text/plain',
        'text/markdown',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    constructor(knowledgeService) {
        this.knowledgeService = knowledgeService;
    }
    findAll(query, req) {
        return this.knowledgeService.findAll(query, req.user);
    }
    search(query, req) {
        return this.knowledgeService.search(query, req.user);
    }
    findTasks(query, req) {
        return this.knowledgeService.findTasks(query, req.user);
    }
    upload(file, req) {
        this.knowledgeService.validateKnowledgeUpload(file, this.allowedKnowledgeMimeTypes);
        return this.knowledgeService.uploadKnowledge(file, req.user);
    }
    retry(id, req) {
        return this.knowledgeService.retryKnowledge(id, req.user);
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('knowledge:view'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, permissions_decorator_1.Permissions)('knowledge:view'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('tasks'),
    (0, permissions_decorator_1.Permissions)('knowledge:view'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeController.prototype, "findTasks", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, permissions_decorator_1.Permissions)('knowledge:upload'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('retry/:id'),
    (0, permissions_decorator_1.Permissions)('knowledge:upload'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KnowledgeController.prototype, "retry", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, common_1.Controller)('api/knowledge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [knowledge_service_1.KnowledgeService])
], KnowledgeController);
//# sourceMappingURL=knowledge.controller.js.map