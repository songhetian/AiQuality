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
exports.ShopController = exports.DeptController = exports.PlatformController = void 0;
const common_1 = require("@nestjs/common");
const organization_service_1 = require("./organization.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
let PlatformController = class PlatformController {
    orgService;
    constructor(orgService) {
        this.orgService = orgService;
    }
    create(data) {
        return this.orgService.createPlatform(data);
    }
    findAll() {
        return this.orgService.findAllPlatforms();
    }
};
exports.PlatformController = PlatformController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('org:edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('org:view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "findAll", null);
exports.PlatformController = PlatformController = __decorate([
    (0, common_1.Controller)('api/platform'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], PlatformController);
let DeptController = class DeptController {
    orgService;
    constructor(orgService) {
        this.orgService = orgService;
    }
    create(data) {
        return this.orgService.createDepartment(data);
    }
    findAll(platformId) {
        return this.orgService.findAllDepartments(platformId);
    }
};
exports.DeptController = DeptController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('org:edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DeptController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('org:view'),
    __param(0, (0, common_1.Query)('platformId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeptController.prototype, "findAll", null);
exports.DeptController = DeptController = __decorate([
    (0, common_1.Controller)('api/dept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], DeptController);
let ShopController = class ShopController {
    orgService;
    constructor(orgService) {
        this.orgService = orgService;
    }
    create(data) {
        return this.orgService.createShop(data);
    }
    findAll(deptId) {
        return this.orgService.findAllShops(deptId);
    }
};
exports.ShopController = ShopController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('org:edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, permissions_decorator_1.Permissions)('org:view'),
    __param(0, (0, common_1.Query)('deptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopController.prototype, "findAll", null);
exports.ShopController = ShopController = __decorate([
    (0, common_1.Controller)('api/shop'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], ShopController);
//# sourceMappingURL=organization.controller.js.map