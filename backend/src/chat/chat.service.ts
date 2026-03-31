import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';
import { KeywordService } from '../keyword/keyword.service';
import { AiIntegrationService } from '../ai/ai-integration.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private qdrant: QdrantService,
    private redis: RedisService,
    private keywordService: KeywordService,
    private aiService: AiIntegrationService,
  ) {}

  async createSession(data: Prisma.ChatSessionCreateInput) {
    return this.prisma.chatSession.create({ data });
  }

  async findAllSessions(query: any) {
    const { deptId, shopId, status, keyword, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;
    const where = {
      deptId: deptId || undefined,
      shopId: shopId || undefined,
      status: status ? parseInt(status) : undefined,
      OR: keyword
        ? [
            { sessionId: { contains: keyword } },
            { records: { some: { content: { contains: keyword } } } },
          ]
        : undefined,
    };

    const [total, list] = await Promise.all([
      this.prisma.chatSession.count({ where }),
      this.prisma.chatSession.findMany({
        where,
        skip,
        take: parseInt(pageSize as string),
        include: { shop: true, user: true },
        orderBy: { createTime: 'desc' },
      }),
    ]);

    return { total, list, page: Number(page), pageSize: Number(pageSize) };
  }

  async findSessionDetail(id: string) {
    const cacheKey = `chat:session:${id}`;
    return this.redis.wrap(
      cacheKey,
      async () => {
        return this.prisma.chatSession.findUnique({
          where: { id },
          include: {
            records: { orderBy: { sendTime: 'asc' } },
            inspection: true,
          },
        });
      },
      600,
    );
  }

  async createRecord(
    sessionId: string,
    data: Prisma.ChatRecordCreateWithoutSessionInput,
    vector?: number[],
  ) {
    const record = await this.prisma.chatRecord.create({
      data: {
        ...data,
        session: { connect: { id: sessionId } },
      },
      include: { session: true },
    });

    // 清除详情缓存
    await this.redis.del(`chat:session:${sessionId}`);

    if (vector && vector.length > 0) {
      await this.qdrant.upsertChatRecord(
        record.session.deptId,
        record.id,
        vector,
        {
          sessionId: record.sessionId,
          content: record.content,
          senderType: record.senderType,
        },
      );
    }

    if (record.senderType === 'AGENT' && record.content.trim()) {
      await this.keywordService.detectKeywords(
        record.content,
        record.session.deptId,
        record.sessionId,
        record.session.userId || '',
      );
    }

    return record;
  }

  async findSimilarRecords(recordId: string, user: any) {
    const record = await this.prisma.chatRecord.findUnique({
      where: { id: recordId },
      include: {
        session: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!record) {
      return [];
    }

    if (
      !user?.roles?.includes('SUPER_ADMIN') &&
      record.session?.deptId !== user?.deptId
    ) {
      return [];
    }

    const content = String(record.content || '').trim();
    if (!content) {
      return [];
    }

    const vector = await this.aiService.getEmbedding(content);
    const similar = await this.qdrant.searchSimilarChats(
      record.session.deptId,
      vector,
      8,
      {
        must: [{ key: 'senderType', match: { value: record.senderType } }],
      },
    );

    const similarIds = similar
      .map((item) => String(item.id))
      .filter((id) => id && id !== recordId);

    if (similarIds.length === 0) {
      return [];
    }

    const relatedRecords = await this.prisma.chatRecord.findMany({
      where: {
        id: { in: similarIds },
      },
      include: {
        session: {
          include: {
            shop: true,
          },
        },
      },
    });

    const recordMap = new Map(relatedRecords.map((item) => [item.id, item]));

    return similar
      .filter((item) => String(item.id) !== recordId)
      .map((item) => {
        const related = recordMap.get(String(item.id));
        if (!related) {
          return null;
        }

        return {
          id: related.id,
          score: item.score,
          content: related.content,
          senderType: related.senderType,
          sendTime: related.sendTime,
          sessionId: related.sessionId,
          shopName: related.session?.shop?.name || null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }
}
