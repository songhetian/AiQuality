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
exports.TagController = void 0;
const common_1 = require("@nestjs/common");
const tag_service_1 = require("./tag.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let TagController = class TagController {
    tagService;
    constructor(tagService) {
        this.tagService = tagService;
    }
    create(data) {
        return this.tagService.create(data);
    }
    findAll(query) {
        return this.tagService.findAll(query);
    }
    findAuditList() {
        return this.tagService.findAuditList();
    }
    findOne(tagCode) {
        return this.tagService.findOne(tagCode);
    }
    update(tagCode, data) {
        return this.tagService.update(tagCode, data);
    }
    remove(tagCode) {
        return this.tagService.remove(tagCode);
    }
    updateStatus(tagCode, status) {
        return this.tagService.updateStatus(tagCode, status);
    }
    handleAudit(id, status) {
        return this.tagService.handleAudit(id, status);
    }
};
exports.TagController = TagController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('tag:edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('tag:view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('audit/list'),
    (0, permissions_decorator_1.Permissions)('tag:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findAuditList", null);
__decorate([
    (0, common_1.Get)(':tagCode'),
    (0, permissions_decorator_1.Permissions)('tag:view'),
    __param(0, (0, common_1.Param)('tagCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':tagCode'),
    (0, permissions_decorator_1.Permissions)('tag:edit'),
    __param(0, (0, common_1.Param)('tagCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('delete/:tagCode'),
    (0, permissions_decorator_1.Permissions)('tag:edit'),
    __param(0, (0, common_1.Param)('tagCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':tagCode/status'),
    (0, permissions_decorator_1.Permissions)('tag:edit'),
    __param(0, (0, common_1.Param)('tagCode')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('audit/:id'),
    (0, permissions_decorator_1.Permissions)('tag:audit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "handleAudit", null);
exports.TagController = TagController = __decorate([
    (0, common_1.Controller)('api/tag'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [tag_service_1.TagService])
], TagController);
//# sourceMappingURL=tag.controller.js.map