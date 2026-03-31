import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly logger = new Logger(QdrantService.name);
  private existingCollections: Set<string> = new Set();
  private indexedCollections: Set<string> = new Set();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url =
      this.configService.get<string>('QDRANT_URL') || 'http://127.0.0.1:6333';
    this.client = new QdrantClient({ url });

    try {
      const result = await this.client.getCollections();
      result.collections.forEach((c) => this.existingCollections.add(c.name));
    } catch (e) {
      this.logger.warn('Failed to connect to Qdrant on init.');
    }
  }

  getCollectionName(departmentId: string): string {
    return departmentId
      ? `dept_${departmentId.replace(/-/g, '_')}_chats`
      : 'platform_chats';
  }

  async ensureCollection(departmentId: string, vectorSize?: number) {
    const collectionName = this.getCollectionName(departmentId);
    const configSize = this.configService.get<string>('AI_VECTOR_SIZE');
    const finalSize = parseInt(configSize || '1536') || vectorSize || 1536;

    if (!this.existingCollections.has(collectionName)) {
      try {
        await this.client.createCollection(collectionName, {
          vectors: { size: finalSize, distance: 'Cosine' },
        });
        this.existingCollections.add(collectionName);
      } catch (e) {
        if (e.status === 409) {
          this.existingCollections.add(collectionName);
        } else {
          throw e;
        }
      }
    }

    await this.ensurePayloadIndexes(collectionName);
  }

  async upsertChatRecord(
    departmentId: string,
    recordId: string,
    vector: number[],
    payload: any,
  ) {
    const collectionName = this.getCollectionName(departmentId);
    await this.ensureCollection(departmentId, vector.length);

    return await this.client.upsert(collectionName, {
      wait: true,
      points: [{ id: recordId, vector, payload }],
    });
  }

  async upsertPoints(
    departmentId: string,
    points: Array<{
      id: string;
      vector: number[];
      payload: Record<string, unknown>;
    }>,
    wait: boolean = false,
  ) {
    if (points.length === 0) {
      return;
    }

    const collectionName = this.getCollectionName(departmentId);
    await this.ensureCollection(departmentId, points[0].vector.length);

    return this.client.upsert(collectionName, {
      wait,
      points,
    });
  }

  async searchSimilarChats(
    departmentId: string,
    vector: number[],
    limit: number = 10,
    filter?: any,
  ) {
    const collectionName = this.getCollectionName(departmentId);
    if (!this.existingCollections.has(collectionName)) return [];

    return await this.client.search(collectionName, {
      vector,
      limit,
      filter,
      with_payload: true,
    });
  }

  private async ensurePayloadIndexes(collectionName: string) {
    if (this.indexedCollections.has(collectionName)) {
      return;
    }

    const payloadIndexes = [
      { field_name: 'type', field_schema: 'keyword' as const },
      { field_name: 'deptId', field_schema: 'keyword' as const },
      { field_name: 'sessionId', field_schema: 'keyword' as const },
      { field_name: 'kbId', field_schema: 'keyword' as const },
      { field_name: 'chunkIndex', field_schema: 'integer' as const },
      { field_name: 'senderType', field_schema: 'keyword' as const },
    ];

    for (const index of payloadIndexes) {
      try {
        await this.client.createPayloadIndex(collectionName, index);
      } catch (error) {
        this.logger.warn(
          `Failed to create payload index ${index.field_name} for ${collectionName}`,
        );
      }
    }

    this.indexedCollections.add(collectionName);
  }
}
