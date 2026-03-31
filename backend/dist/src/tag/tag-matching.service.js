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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagMatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TagMatchingService = class TagMatchingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async autoTagSession(content, deptId) {
        const tags = await this.prisma.tag.findMany({
            where: {
                status: 1,
                OR: [{ deptId: deptId }, { deptId: null }],
            },
        });
        const matchedTags = [];
        for (const tag of tags) {
            if (!tag.aiMatchRule)
                continue;
            try {
                const regex = new RegExp(tag.aiMatchRule, 'i');
                if (regex.test(content)) {
                    matchedTags.push(tag);
                }
            }
            catch (e) {
            }
        }
        return matchedTags;
    }
};
exports.TagMatchingService = TagMatchingService;
exports.TagMatchingService = TagMatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagMatchingService);
//# sourceMappingURL=tag-matching.service.js.map