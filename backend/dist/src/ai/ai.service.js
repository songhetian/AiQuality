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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cost_service_1 = require("../cost/cost.service");
const ai_integration_service_1 = require("./ai-integration.service");
let AiService = AiService_1 = class AiService {
    prisma;
    costService;
    aiIntegrationService;
    logger = new common_1.Logger(AiService_1.name);
    constructor(prisma, costService, aiIntegrationService) {
        this.prisma = prisma;
        this.costService = costService;
        this.aiIntegrationService = aiIntegrationService;
    }
    async analyzeChat(params) {
        const aiKey = await this.prisma.aIKey.findFirst({
            where: { platformId: params.platformId, status: 1 },
            include: { aiPlatform: true },
        });
        const startTime = Date.now();
        const result = await this.aiIntegrationService.analyzeSession(params.content, params.ruleId);
        if (aiKey?.aiPlatformId) {
            this.costService
                .recordAiCall({
                platformId: params.platformId,
                deptId: params.deptId,
                shopId: params.shopId,
                aiPlatformId: aiKey.aiPlatformId,
                duration: (Date.now() - startTime) / 1000,
            })
                .catch((error) => this.logger.error('Cost recording failed', error));
        }
        else {
            this.logger.warn(`Skip cost recording for platform ${params.platformId}: no active AI key found`);
        }
        return {
            score: result.score,
            violations: result.violations,
            detectedTags: [],
            tokens: 0,
            reason: result.reason,
            degraded: result.degraded ?? false,
        };
    }
    async createPlatform(data) {
        return this.prisma.aIPlatform.create({ data });
    }
    async findAllPlatforms() {
        return this.prisma.aIPlatform.findMany();
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cost_service_1.CostService,
        ai_integration_service_1.AiIntegrationService])
], AiService);
//# sourceMappingURL=ai.service.js.map