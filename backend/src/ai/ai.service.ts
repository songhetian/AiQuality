import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CostService } from '../cost/cost.service';
import { AiIntegrationService } from './ai-integration.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly costService: CostService,
    private readonly aiIntegrationService: AiIntegrationService,
  ) {}

  /**
   * 核心质检分析逻辑 (AI 驱动)
   */
  async analyzeChat(params: {
    content: string;
    ruleId: string;
    platformId: string;
    deptId: string;
    shopId: string;
  }) {
    const aiKey = await this.prisma.aIKey.findFirst({
      where: { platformId: params.platformId, status: 1 },
      include: { aiPlatform: true },
    });
    const startTime = Date.now();
    const result = await this.aiIntegrationService.analyzeSession(
      params.content,
      params.ruleId,
    );

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
    } else {
      this.logger.warn(
        `Skip cost recording for platform ${params.platformId}: no active AI key found`,
      );
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

  // AI 平台配置 CRUD
  async createPlatform(data: Prisma.AIPlatformCreateInput) {
    return this.prisma.aIPlatform.create({ data });
  }

  async findAllPlatforms() {
    return this.prisma.aIPlatform.findMany();
  }
}
