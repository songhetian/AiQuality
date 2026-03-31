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
exports.AdapterController = void 0;
const common_1 = require("@nestjs/common");
const adapter_service_1 = require("./adapter.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const auth_controller_1 = require("../auth/auth.controller");
const zod_validation_1 = require("../common/utils/zod-validation");
const adapter_schemas_1 = require("./adapter.schemas");
let AdapterController = class AdapterController {
    adapterService;
    constructor(adapterService) {
        this.adapterService = adapterService;
    }
    async list(req) {
        return this.adapterService.findInterfaces(req.user);
    }
    async getConfigOptions() {
        return this.adapterService.getConfigOptions();
    }
    async create(body) {
        return this.adapterService.createInterface((0, zod_validation_1.parseWithZod)(adapter_schemas_1.adapterUpsertSchema, body));
    }
    async update(interfaceId, body) {
        return this.adapterService.updateInterface(interfaceId, (0, zod_validation_1.parseWithZod)(adapter_schemas_1.adapterUpsertSchema, body));
    }
    async updateStatus(interfaceId, body) {
        const payload = (0, zod_validation_1.parseWithZod)(adapter_schemas_1.adapterStatusSchema, body);
        return this.adapterService.updateInterfaceStatus(interfaceId, payload.status);
    }
    async handleWebhook(platformCode, body) {
        return this.adapterService.processRealtimeMessage(platformCode, body);
    }
    async collect(interfaceId, body) {
        return this.adapterService.collectChatData(interfaceId, (0, zod_validation_1.parseWithZod)(adapter_schemas_1.adapterCollectSchema, body));
    }
    async preview(interfaceId, body) {
        return this.adapterService.previewMapping(interfaceId, body);
    }
    async setFakeData(interfaceId, body) {
        const payload = (0, zod_validation_1.parseWithZod)(adapter_schemas_1.adapterFakeDataSchema, body);
        return this.adapterService.setFakeData(interfaceId, payload.data, payload.scene || 'manual');
    }
    async toggleFakeMode(interfaceId, body) {
        const payload = (0, zod_validation_1.parseWithZod)(adapter_schemas_1.adapterFakeModeSchema, body);
        return this.adapterService.toggleFakeMode(interfaceId, payload.enable);
    }
    async getMonitor(interfaceId) {
        return this.adapterService.getMonitor(interfaceId);
    }
};
exports.AdapterController = AdapterController;
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('adapter:view'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('config-options'),
    (0, permissions_decorator_1.Permissions)('adapter:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "getConfigOptions", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':interfaceId'),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Param)('interfaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':interfaceId/status'),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Param)('interfaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "updateStatus", null);
__decorate([
    (0, auth_controller_1.Public)(),
    (0, common_1.Post)('webhook/:platformCode'),
    __param(0, (0, common_1.Param)('platformCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('collect/:interfaceId'),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Param)('interfaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "collect", null);
__decorate([
    (0, common_1.Post)('preview/:interfaceId'),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Param)('interfaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('fake-data/:interfaceId'),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Param)('interfaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "setFakeData", null);
__decorate([
    (0, common_1.Post)('fake-mode/:interfaceId'),
    (0, permissions_decorator_1.Permissions)('adapter:edit'),
    __param(0, (0, common_1.Param)('interfaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "toggleFakeMode", null);
__decorate([
    (0, common_1.Get)('monitor'),
    (0, permissions_decorator_1.Permissions)('adapter:view'),
    __param(0, (0, common_1.Query)('interfaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdapterController.prototype, "getMonitor", null);
exports.AdapterController = AdapterController = __decorate([
    (0, common_1.Controller)('api/adapter'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [adapter_service_1.AdapterService])
], AdapterController);
//# sourceMappingURL=adapter.controller.js.map