import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OssService } from '../oss/oss.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { AiIntegrationService } from '../ai/ai-integration.service';
import { SocketGateway } from '../socket/socket.gateway';
import * as crypto from 'crypto';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly chunkSize = 1200;
  private readonly chunkOverlap = 200;
  private readonly maxKnowledgeUploadBytes: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private ossService: OssService,
    private qdrantService: QdrantService,
    private aiService: AiIntegrationService,
    @Inject(forwardRef(() => SocketGateway))
    private socketGateway: SocketGateway,
  ) {
    const maxSizeMb = parseInt(
      this.configService.get('KNOWLEDGE_UPLOAD_MAX_SIZE_MB') || '20',
      10,
    );
    this.maxKnowledgeUploadBytes =
      (Number.isFinite(maxSizeMb) && maxSizeMb > 0 ? maxSizeMb : 20) *
      1024 *
      1024;
  }

  validateKnowledgeUpload(file: any, fallbackAllowedMimeTypes: string[]) {
    const allowedMimeTypes = String(
      this.configService.get('KNOWLEDGE_ALLOWED_MIME_TYPES') || '',
    )
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    this.ossService.validateUpload(file, {
      label: '知识文档',
      maxFileSizeBytes: this.maxKnowledgeUploadBytes,
      allowedMimeTypes:
        allowedMimeTypes.length > 0
          ? allowedMimeTypes
          : fallbackAllowedMimeTypes,
    });
  }

  async uploadKnowledge(file: any, user: any) {
    const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
    const existing = await this.prisma.knowledgeBase.findFirst({
      where: { fileHash: hash, deptId: user.deptId },
    });

    if (existing) return existing;

    const objectKey = await this.ossService.uploadFile(
      file,
      `knowledge/${user.deptId}`,
    );

    const kb = await this.prisma.knowledgeBase.create({
      data: {
        title: file.originalname,
        fileName: file.originalname,
        fileUrl: objectKey,
        fileType: file.mimetype,
        fileHash: hash,
        deptId: user.deptId,
        createBy: user.id,
        status: 1,
      },
    });

    this.processKnowledgeAsync(kb.id, file.buffer);

    return kb;
  }

  async findTasks(query: any, user: any) {
    const { page = 1, pageSize = 10, title, status } = query;
    const where = {
      deptId: this.resolveDeptId(user),
      title: title ? { contains: String(title) } : undefined,
      status:
        status !== undefined && status !== null && String(status).trim() !== ''
          ? parseInt(String(status), 10)
          : undefined,
    };

    const [total, rawList] = await Promise.all([
      this.prisma.knowledgeBase.count({ where }),
      this.prisma.knowledgeBase.findMany({
        where,
        skip:
          (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10),
        take: parseInt(pageSize as string, 10),
        orderBy: [{ status: 'asc' }, { updateTime: 'desc' }],
      }),
    ]);

    const list = await this.attachAccessUrl(rawList);

    return {
      total,
      list: list.map((item) => ({
        ...item,
        canRetry: item.status === 3,
      })),
    };
  }

  async retryKnowledge(id: string, user: any) {
    const knowledge = await this.prisma.knowledgeBase.findFirst({
      where: {
        id,
        deptId: this.resolveDeptId(user),
      },
    });

    if (!knowledge) {
      throw new Error('知识文档不存在或无权操作');
    }

    if (knowledge.status === 1) {
      throw new Error('当前文档正在处理中，请稍后刷新');
    }

    await this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        status: 1,
        errorMessage: null,
      },
    });

    const buffer = await this.ossService.getObjectBuffer(knowledge.fileUrl);
    this.processKnowledgeAsync(id, buffer);

    return {
      id,
      status: 'QUEUED',
      message: '已重新加入向量化处理队列',
    };
  }

  private async extractTextFromFile(
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    try {
      if (mimeType.includes('pdf')) {
        const data = await pdfParse(buffer);
        return data.text;
      }
      if (mimeType.includes('officedocument.wordprocessingml')) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      if (mimeType.includes('video') || mimeType.includes('audio')) {
        return await this.aiService.transcribeMedia(buffer, mimeType);
      }
      return buffer.toString('utf-8');
    } catch (e) {
      return '';
    }
  }

  private async processVectorization(kbId: string, buffer: Buffer) {
    const kb = await this.prisma.knowledgeBase.findUnique({
      where: { id: kbId },
    });
    if (!kb) return;

    const content = await this.extractTextFromFile(buffer, kb.fileType);
    if (!content || content.length < 2)
      throw new Error('Text extraction failed.');

    const normalizedContent = content.replace(/\s+/g, ' ').trim();
    const chunks = this.splitIntoChunks(normalizedContent);
    if (chunks.length === 0) {
      throw new Error('No valid chunks generated from knowledge content.');
    }

    const embeddings = await Promise.all(
      chunks.map((chunk) => this.aiService.getEmbedding(chunk.content)),
    );

    await this.qdrantService.upsertPoints(
      kb.deptId as string,
      chunks.map((chunk, index) => ({
        id: `${kbId}_chunk_${index}`,
        vector: embeddings[index],
        payload: {
          type: 'knowledge',
          deptId: kb.deptId,
          kbId,
          title: kb.title,
          url: kb.fileUrl,
          chunkIndex: index,
          content: chunk.content,
          contentLength: chunk.content.length,
        },
      })),
    );

    await this.prisma.knowledgeBase.update({
      where: { id: kbId },
      data: { status: 2, vectorId: `${kbId}_chunk_0` },
    });

    this.emitKnowledgeStatus({
      id: kbId,
      title: kb.title,
      status: 'SUCCESS',
    });
  }

  private splitIntoChunks(content: string) {
    const chunks: Array<{ content: string }> = [];
    const text = content.trim();

    if (!text) {
      return chunks;
    }

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      const chunk = text.slice(start, end).trim();

      if (chunk.length > 0) {
        chunks.push({ content: chunk });
      }

      if (end >= text.length) {
        break;
      }

      start = Math.max(end - this.chunkOverlap, start + 1);
    }

    return chunks;
  }

  async findAll(query: any, user: any) {
    const { page = 1, pageSize = 10, title } = query;
    const where = {
      deptId: user.roles?.includes('SUPER_ADMIN') ? undefined : user.deptId,
      title: title ? { contains: title } : undefined,
    };

    const [total, rawList] = await Promise.all([
      this.prisma.knowledgeBase.count({ where }),
      this.prisma.knowledgeBase.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { createTime: 'desc' },
      }),
    ]);

    const list = await this.attachAccessUrl(rawList);

    return { total, list };
  }

  async search(query: any, user: any) {
    const { keyword, limit = 5, kbId, deptId } = query;
    const normalizedKeyword = String(keyword || '').trim();
    if (!normalizedKeyword) {
      return { list: [] };
    }

    const vector = await this.aiService.getEmbedding(normalizedKeyword);
    const targetDeptId = user.roles?.includes('SUPER_ADMIN')
      ? String(deptId || user.deptId || '').trim()
      : user.deptId;

    if (!targetDeptId) {
      return { list: [] };
    }

    const results = await this.qdrantService.searchSimilarChats(
      targetDeptId as string,
      vector,
      parseInt(limit as string, 10) || 5,
      {
        must: [
          { key: 'type', match: { value: 'knowledge' } },
          ...(kbId ? [{ key: 'kbId', match: { value: kbId } }] : []),
          ...(targetDeptId
            ? [{ key: 'deptId', match: { value: targetDeptId } }]
            : []),
        ],
      },
    );

    const knowledgeIds = Array.from(
      new Set(
        results
          .map((item) => String(item.payload?.kbId || '').trim())
          .filter(Boolean),
      ),
    );

    const knowledgeRecords = knowledgeIds.length
      ? await this.prisma.knowledgeBase.findMany({
          where: { id: { in: knowledgeIds } },
          select: {
            id: true,
            title: true,
            fileName: true,
            fileUrl: true,
            status: true,
            createTime: true,
          },
        })
      : [];

    const knowledgeEntries: Array<
      [
        string,
        {
          id: string;
          title: string;
          fileName: string;
          fileUrl: string;
          status: number;
          createTime: Date;
          accessUrl: string;
        },
      ]
    > = await Promise.all(
      knowledgeRecords.map(async (record) => [
        record.id,
        {
          ...record,
          accessUrl: await this.ossService.getPresignedUrl(record.fileUrl),
        },
      ]),
    );

    const knowledgeMap = new Map(knowledgeEntries);

    return {
      list: results.map((item) => ({
        id: item.id,
        score: item.score,
        ...(item.payload || {}),
        knowledge: item.payload?.kbId
          ? knowledgeMap.get(String(item.payload.kbId))
          : undefined,
      })),
    };
  }

  private resolveDeptId(user: any) {
    return user?.roles?.includes('SUPER_ADMIN') ? undefined : user?.deptId;
  }

  private async attachAccessUrl<T extends { fileUrl: string }>(records: T[]) {
    return Promise.all(
      records.map(async (item) => ({
        ...item,
        accessUrl: await this.ossService.getPresignedUrl(item.fileUrl),
      })),
    );
  }

  private processKnowledgeAsync(kbId: string, buffer: Buffer) {
    this.processVectorization(kbId, buffer).catch(async (error) => {
      this.logger.error(`Vectorization failed for ${kbId}`, error);
      const updated = await this.prisma.knowledgeBase.update({
        where: { id: kbId },
        data: { status: 3, errorMessage: error.message },
      });

      this.emitKnowledgeStatus({
        id: kbId,
        title: updated.title,
        status: 'FAILED',
        errorMessage: error.message,
      });
    });
  }

  private emitKnowledgeStatus(payload: {
    id: string;
    title: string;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
  }) {
    this.socketGateway.server?.emit('knowledge_processed', payload);
  }
}
