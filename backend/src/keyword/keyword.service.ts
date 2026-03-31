import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class KeywordService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  /**
   * 检测内容中的关键词
   */
  async detectKeywords(
    content: string,
    deptId: string,
    sessionId: string,
    userId: string,
  ) {
    const normalizedContent = String(content || '').trim();
    if (!normalizedContent || !deptId || !sessionId) {
      return [];
    }

    // 查找该部门及全平台的关键词
    const keywords = await this.prisma.keyword.findMany({
      where: {
        OR: [
          { deptId: deptId },
          { deptId: null }, // 全平台
        ],
        status: 1,
      },
      orderBy: { createTime: 'asc' },
    });

    const loweredContent = normalizedContent.toLowerCase();
    const detected = keywords
      .filter((kw) =>
        loweredContent.includes(String(kw.word || '').toLowerCase()),
      )
      .sort((a, b) => b.word.length - a.word.length)
      .filter(
        (kw, index, list) =>
          list.findIndex((item) => item.word === kw.word) === index,
      );

    if (detected.length > 0) {
      // 记录违规警报
      const alerts = await Promise.all(
        detected.map((kw) =>
          this.prisma.realtimeAlert.create({
            data: {
              sessionId,
              keyword: kw.word,
              content: normalizedContent,
              deptId,
            },
          }),
        ),
      );

      // 通过 Socket 推送实时提醒
      if (userId) {
        this.socketGateway.sendRealtimeAlert(userId, {
          sessionId,
          content: normalizedContent,
          keywords: detected.map((k) => k.word),
          type: detected[0].type,
          timestamp: new Date(),
        });
      }

      return alerts;
    }

    return [];
  }

  async addKeyword(data: { word: string; type: string; deptId?: string }) {
    return this.prisma.keyword.create({
      data: {
        word: String(data.word || '').trim(),
        type: String(data.type || '').trim(),
        deptId: data.deptId || undefined,
      },
    });
  }

  async findAll(query: {
    deptId?: string;
    type?: string;
    status?: string;
    word?: string;
  }) {
    return this.prisma.keyword.findMany({
      where: {
        deptId: query.deptId || undefined,
        type: query.type || undefined,
        status: query.status ? Number(query.status) : undefined,
        word: query.word ? { contains: query.word } : undefined,
      },
      orderBy: { createTime: 'desc' },
    });
  }

  async updateKeyword(
    id: string,
    data: { word?: string; type?: string; deptId?: string | null },
  ) {
    return this.prisma.keyword.update({
      where: { id },
      data: {
        word:
          data.word !== undefined ? String(data.word).trim() : undefined,
        type:
          data.type !== undefined ? String(data.type).trim() : undefined,
        deptId:
          data.deptId === null ? null : data.deptId || undefined,
      },
    });
  }

  async updateKeywordStatus(id: string, status: number) {
    return this.prisma.keyword.update({
      where: { id },
      data: {
        status: Number(status) === 1 ? 1 : 0,
      },
    });
  }
}
