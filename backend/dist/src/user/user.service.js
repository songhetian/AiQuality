"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const CryptoJS = __importStar(require("crypto-js"));
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    userIncludes = {
        roles: {
            select: {
                id: true,
                name: true,
            },
        },
        department: {
            select: {
                id: true,
                name: true,
            },
        },
        platform: {
            select: {
                id: true,
                name: true,
            },
        },
        shop: {
            select: {
                id: true,
                name: true,
            },
        },
    };
    encryptPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }
    async create(data) {
        const encrypted = this.encryptPassword(data.password);
        return this.prisma.user.create({
            data: this.buildCreateData(data, encrypted),
            include: this.userIncludes,
        });
    }
    async findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
            include: this.userIncludes,
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: this.userIncludes,
        });
    }
    async findAll(query) {
        const { platformId, deptId, shopId, username, status, page, pageSize } = query;
        const skip = (page - 1) * pageSize;
        const where = {
            platformId: platformId ?? undefined,
            deptId: deptId ?? undefined,
            shopId: shopId ?? undefined,
            status,
            OR: username
                ? [
                    {
                        username: {
                            contains: username,
                        },
                    },
                    {
                        phone: {
                            contains: username,
                        },
                    },
                    {
                        email: {
                            contains: username,
                        },
                    },
                ]
                : undefined,
        };
        const [list, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createTime: 'desc' },
                include: this.userIncludes,
            }),
            this.prisma.user.count({ where }),
        ]);
        return { list, total, page, pageSize };
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data: this.buildUpdateData(data),
            include: this.userIncludes,
        });
    }
    async remove(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    buildCreateData(data, encryptedPassword) {
        return {
            username: data.username,
            password: encryptedPassword,
            phone: data.phone,
            email: data.email,
            status: data.status,
            platform: this.toRelationInput(data.platformId),
            department: this.toRelationInput(data.deptId),
            shop: this.toRelationInput(data.shopId),
            roles: data.roleIds.length
                ? {
                    connect: data.roleIds.map((id) => ({ id })),
                }
                : undefined,
        };
    }
    buildUpdateData(data) {
        return {
            username: data.username,
            phone: data.phone,
            email: data.email,
            status: data.status,
            password: data.password ? this.encryptPassword(data.password) : undefined,
            platform: this.toRelationInput(data.platformId, true),
            department: this.toRelationInput(data.deptId, true),
            shop: this.toRelationInput(data.shopId, true),
            roles: {
                set: data.roleIds.map((id) => ({ id })),
            },
        };
    }
    toRelationInput(relationId, allowDisconnect = false) {
        if (relationId === undefined) {
            return undefined;
        }
        if (relationId === null) {
            return allowDisconnect ? { disconnect: true } : undefined;
        }
        return {
            connect: { id: relationId },
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map