import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QualityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    @InjectQueue('quality-queue') private readonly qualityQueue: Queue,
  ) {}

  async startBatchQuality(
    deptId: string,
    sessionIds: string[],
    ruleId: string,
  ) {
    if (sessionIds.length === 0) {
      throw new ConflictException('没有可执行的会话，无法启动批量质检');
    }

    await this.prisma.qualityInspection.createMany({
      data: sessionIds.map((sessionId) => ({
        sessionId,
        ruleId,
        status: 0,
      })),
      skipDuplicates: true,
    });

    await this.prisma.qualityInspection.updateMany({
      where: {
        sessionId: { in: sessionIds },
      },
      data: {
        status: 0,
      },
    });

    const batchLockKey = `quality:batch:${deptId}:${ruleId}`;
    const batchLockTtl = parseInt(
      this.configService.get<string>('BATCH_QUALITY_LOCK_TTL') || '1800',
      10,
    );
    const acquired = await this.redis.acquireLock(batchLockKey, batchLockTtl);
    if (!acquired) {
      throw new ConflictException('同一部门下该规则的批量质检任务正在执行中');
    }

    const taskId = `task_${Date.now()}`;
    const total = sessionIds.length;
    const progressKey = `quality:batch:progress:${taskId}`;
    await this.redis.set(progressKey, '0', batchLockTtl);

    try {
      const batchSize = 100;
      for (let offset = 0; offset < sessionIds.length; offset += batchSize) {
        const chunk = sessionIds.slice(offset, offset + batchSize);
        await Promise.all(
          chunk.map((sessionId, index) =>
            this.qualityQueue.add(
              'analyze-session',
              {
                sessionId,
                ruleId,
                taskId,
                total,
                index: offset + index,
                batchLockKey,
                progressKey,
              },
              {
                attempts: 3,
                backoff: 5000,
                removeOnComplete: true,
              },
            ),
          ),
        );
      }

      return { taskId, total, status: 'QUEUED' };
    } catch (error) {
      await this.redis.releaseLock(batchLockKey);
      await this.redis.del(progressKey);
      throw error;
    }
  }

  async findAllInspections(query: any, user: any) {
    const {
      status,
      page = 1,
      pageSize = 10,
      sessionId,
      inspectionId,
      manualReviewNeeded,
    } = query;
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const where = {
      id: inspectionId ? String(inspectionId).trim() : undefined,
      status:
        String(manualReviewNeeded || '') === 'true'
          ? { in: [1, 3, 4] }
          : status
            ? parseInt(status as string)
            : undefined,
      session: {
        ...(user?.roles?.includes('SUPER_ADMIN')
          ? {}
          : {
              deptId: user?.deptId || '__no_access__',
            }),
        ...(sessionId
          ? {
              OR: [
                { id: String(sessionId).trim() },
                { sessionId: { contains: String(sessionId).trim() } },
              ],
            }
          : {}),
      },
    };

    const [total, rawList] = await Promise.all([
      this.prisma.qualityInspection.count({ where }),
      this.prisma.qualityInspection.findMany({
        where,
        skip,
        take: parseInt(pageSize as string),
        include: { session: true, rule: true },
        orderBy: { createTime: 'desc' },
      }),
    ]);

    const list = rawList.map((item) => ({
      ...item,
      manualReviewNeeded: this.resolveManualReviewNeeded(item.status),
      qualitySummary: this.resolveQualitySummary(item.status),
    }));

    return { total, list };
  }

  async findDetail(id: string, user?: any) {
    const inspection = await this.prisma.qualityInspection.findUnique({
      where: { id },
      include: {
        session: { include: { records: { orderBy: { sendTime: 'asc' } } } },
        rule: true,
      },
    });

    if (!inspection) {
      return null;
    }

    if (
      user &&
      !user.roles?.includes('SUPER_ADMIN') &&
      inspection.session?.deptId !== user.deptId
    ) {
      throw new ForbiddenException('无权查看当前部门之外的质检记录');
    }

    const aiMeta = await this.redis.getJson<{
      retryCount?: number;
      lastFailedAt?: string;
      lastRetriedAt?: string;
      lastSucceededAt?: string;
    }>(`quality:inspection:meta:${inspection.id}`);

    return {
      ...inspection,
      aiMeta,
      manualReviewNeeded: this.resolveManualReviewNeeded(inspection.status),
      qualitySummary: this.resolveQualitySummary(inspection.status),
    };
  }

  async findActiveRules(user: any) {
    return this.prisma.qualityRule.findMany({
      where: {
        status: 1,
        ...(user?.roles?.includes('SUPER_ADMIN')
          ? {}
          : {
              OR: [{ deptId: user?.deptId }, { deptId: null }],
            }),
      },
      select: {
        id: true,
        name: true,
        deptId: true,
      },
      orderBy: [{ deptId: 'desc' }, { updateTime: 'desc' }],
    });
  }

  async updateInspection(id: string, data: any) {
    return this.prisma.qualityInspection.update({
      where: { id },
      data,
    });
  }

  async batchUpdateInspections(body: any, user: any) {
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id: unknown) => String(id)).filter(Boolean)
      : [];

    if (ids.length === 0) {
      throw new ConflictException('没有选择可更新的质检记录');
    }

    const inspections = await this.prisma.qualityInspection.findMany({
      where: { id: { in: ids } },
      include: { session: true },
    });

    if (inspections.length === 0) {
      throw new ConflictException('质检记录不存在');
    }

    if (!user?.roles?.includes('SUPER_ADMIN')) {
      const forbidden = inspections.some(
        (item) => item.session?.deptId !== user?.deptId,
      );
      if (forbidden) {
        throw new ForbiddenException('无权批量更新当前部门之外的质检记录');
      }
    }

    const status = Number(body?.status);
    const manualScore =
      body?.manualScore === undefined ||
      body?.manualScore === null ||
      body?.manualScore === ''
        ? null
        : Number(body.manualScore);
    const manualResult = String(body?.manualResult || '').trim() || null;

    await this.prisma.$transaction(
      inspections.map((item) =>
        this.prisma.qualityInspection.update({
          where: { id: item.id },
          data: {
            status,
            manualScore,
            manualResult,
            inspector: { connect: { id: user.id } },
          },
        }),
      ),
    );

    return {
      count: inspections.length,
      status,
      manualScore,
      manualResult,
      inspectorId: user.id,
    };
  }

  async retryInspection(id: string, user?: any) {
    const detail = await this.findDetail(id, user);
    if (!detail) {
      throw new ConflictException('质检记录不存在');
    }

    const inspection = await this.prisma.qualityInspection.findUnique({
      where: { id },
      select: { id: true, sessionId: true, ruleId: true },
    });

    if (!inspection) {
      throw new ConflictException('质检记录不存在');
    }

    const retryLockKey = `quality:retry:${inspection.sessionId}`;
    const acquired = await this.redis.acquireLock(retryLockKey, 300);
    if (!acquired) {
      throw new ConflictException('该会话的 AI 重试任务正在执行中');
    }

    const taskId = `retry_${Date.now()}`;
    const progressKey = `quality:batch:progress:${taskId}`;
    await this.redis.set(progressKey, '0', 300);
    const metaKey = `quality:inspection:meta:${inspection.id}`;
    const currentMeta =
      (await this.redis.getJson<{
        retryCount?: number;
        lastFailedAt?: string;
        lastRetriedAt?: string;
        lastSucceededAt?: string;
      }>(metaKey)) || {};
    await this.redis.setJson(
      metaKey,
      {
        ...currentMeta,
        retryCount: (currentMeta.retryCount || 0) + 1,
        lastRetriedAt: new Date().toISOString(),
      },
      7 * 24 * 60 * 60,
    );

    try {
      await this.qualityQueue.add(
        'analyze-session',
        {
          sessionId: inspection.sessionId,
          ruleId: inspection.ruleId,
          taskId,
          total: 1,
          progressKey,
          retryLockKey,
        },
        {
          attempts: 2,
          backoff: 3000,
          removeOnComplete: true,
        },
      );

      return { taskId, status: 'QUEUED' };
    } catch (error) {
      await this.redis.releaseLock(retryLockKey);
      await this.redis.del(progressKey);
      throw error;
    }
  }

  async lockReview(sessionId: string, userId: string, username: string) {
    return this.redis.tryLockReview(sessionId, userId, username);
  }

  async unlockReview(sessionId: string, userId: string) {
    return this.redis.unlockReview(sessionId, userId);
  }

  private resolveManualReviewNeeded(status?: number | null) {
    return status === 1 || status === 3 || status === 4;
  }

  private resolveQualitySummary(status?: number | null) {
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
    return '质检状态待同步';
  }
}
