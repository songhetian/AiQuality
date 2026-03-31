import { Inject, Logger, forwardRef } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AiIntegrationService } from '../ai/ai-integration.service';
import { SocketGateway } from '../socket/socket.gateway';
import { TagMatchingService } from '../tag/tag-matching.service';
import { RedisService } from '../redis/redis.service';

@Processor('quality-queue')
export class QualityProcessor {
  private readonly logger = new Logger(QualityProcessor.name);

  private resolveQualitySummary(status: number) {
    if (status === 0) {
      return 'AI 质检进行中';
    }
    if (status === 1) {
      return '已生成结果，建议人工复核';
    }
    if (status === 2) {
      return 'AI 质检通过，可进入常规复盘';
    }
    if (status === 3) {
      return '检测到风险点，建议尽快整改';
    }
    if (status === 4) {
      return 'AI 分析失败，建议人工补看或重试';
    }
    return '质检状态已更新';
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiIntegrationService,
    private readonly tagService: TagMatchingService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {}

  @Process('analyze-session')
  async handleAnalysis(
    job: Job<{
      sessionId: string;
      ruleId: string;
      taskId: string;
      total: number;
      batchLockKey?: string;
      progressKey?: string;
      retryLockKey?: string;
    }>,
  ) {
    const {
      sessionId,
      ruleId,
      taskId,
      total,
      batchLockKey,
      progressKey,
      retryLockKey,
    } = job.data;

    try {
      const session = await this.prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { records: true },
      });

      if (!session) {
        return;
      }

      const fullText = session.records
        .map((record) => `${record.senderType}: ${record.content}`)
        .join('\n');
      const result = await this.aiService.analyzeSession(fullText, ruleId);
      const finalStatus = result.degraded ? 4 : result.score < 60 ? 3 : 2;

      const inspection = await this.prisma.qualityInspection.upsert({
        where: { sessionId },
        update: {
          status: finalStatus,
          ruleId,
          aiScore: result.degraded ? null : result.score,
          aiResult: result.reason,
        },
        create: {
          sessionId,
          ruleId,
          status: finalStatus,
          aiScore: result.degraded ? null : result.score,
          aiResult: result.reason,
        },
      });

      this.socketGateway.sendQualityStatusChanged({
        sessionId,
        inspectionId: inspection.id,
        status: finalStatus,
        aiScore: inspection.aiScore,
        aiResult: inspection.aiResult,
        updatedAt:
          inspection.updateTime?.toISOString?.() || new Date().toISOString(),
        manualReviewNeeded: [1, 3, 4].includes(finalStatus as number),
        qualitySummary: this.resolveQualitySummary(finalStatus),
      });

      const metaKey = `quality:inspection:meta:${inspection.id}`;
      const currentMeta =
        (await this.redisService.getJson<{
          retryCount?: number;
          lastFailedAt?: string;
          lastRetriedAt?: string;
          lastSucceededAt?: string;
        }>(metaKey)) || {};
      await this.redisService.setJson(
        metaKey,
        {
          ...currentMeta,
          lastFailedAt: result.degraded
            ? new Date().toISOString()
            : currentMeta.lastFailedAt,
          lastSucceededAt: !result.degraded
            ? new Date().toISOString()
            : currentMeta.lastSucceededAt,
        },
        7 * 24 * 60 * 60,
      );

      const matchedTags = await this.tagService.autoTagSession(
        fullText,
        session.deptId,
      );
      if (matchedTags.length > 0) {
        await this.prisma.tagRelation.createMany({
          data: matchedTags.map((tag) => ({
            id: `${sessionId}_${tag.tagCode}`,
            tagCode: tag.tagCode,
            qualityId: inspection.id,
            createBy: 'SYSTEM_AI',
          })),
          skipDuplicates: true,
        });
      }

      if (result.violations.length > 0) {
        await this.prisma.realtimeAlert.create({
          data: {
            sessionId,
            keyword: result.violations.join(','),
            content: result.reason,
            deptId: session.deptId,
          },
        });
        this.socketGateway.sendRealtimeAlert(session.userId || 'admin', {
          sessionId,
          keyword: result.violations.join(','),
        });
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to process session ${sessionId}`,
        err.stack || err.message,
      );
      throw error;
    } finally {
      if (!progressKey) {
        return;
      }

      const completedCount = await this.redisService.incr(progressKey);
      await this.redisService.expire(progressKey, 1800);

      const progress = Math.min(
        100,
        Math.round((completedCount / total) * 100),
      );
      this.socketGateway.sendTaskProgress(taskId, progress);

      if (completedCount >= total) {
        if (batchLockKey) {
          await this.redisService.releaseLock(batchLockKey);
        }
        if (retryLockKey) {
          await this.redisService.releaseLock(retryLockKey);
        }
        await this.redisService.del(progressKey);
      }
    }
  }
}
