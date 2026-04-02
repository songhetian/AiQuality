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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    createSession(body) {
        return this.chatService.createSession({
            sessionId: body.sessionId,
            platformId: body.platformId,
            deptId: body.deptId,
            shop: { connect: { id: body.shopId } },
            interface: { connect: { id: body.interfaceId } },
            startTime: new Date(),
        });
    }
    findAll(query, req) {
        const user = req.user;
        const filterQuery = user.roles?.includes('SUPER_ADMIN')
            ? query
            : { ...query, deptId: user.deptId };
        return this.chatService.findAllSessions(filterQuery);
    }
    async findOne(id, req) {
        const detail = await this.chatService.findSessionDetail(id);
        const user = req.user;
        if (detail &&
            !user.roles?.includes('SUPER_ADMIN') &&
            detail.deptId !== user.deptId) {
            throw new Error('No permission to access this session detail');
        }
        return detail;
    }
    findSimilar(recordId, req) {
        return this.chatService.findSimilarRecords(recordId, req.user);
    }
    createRecord(body) {
        return this.chatService.createRecord(body.sessionId, body.data, body.vector);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('session'),
    (0, permissions_decorator_1.Permissions)('chat:view'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('chat:view'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    (0, permissions_decorator_1.Permissions)('chat:view'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('similar/:recordId'),
    (0, permissions_decorator_1.Permissions)('chat:view'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "findSimilar", null);
__decorate([
    (0, common_1.Post)('record'),
    (0, permissions_decorator_1.Permissions)('chat:view'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createRecord", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map