import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
// @ts-ignore
import * as Minio from 'minio';

@Injectable()
export class OssService implements OnModuleInit {
  private minioClient: any;
  private readonly logger = new Logger(OssService.name);
  private readonly bucketName: string;
  private readonly presignedTtl: number;
  private readonly defaultMaxFileSizeBytes: number;
  private readonly defaultAllowedMimeTypes: string[];
  private bucketReadyPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get('MINIO_BUCKET') || 'ai-quality';
    this.presignedTtl = parseInt(
      this.configService.get('MINIO_PRESIGNED_TTL') || '3600',
      10,
    );
    this.defaultMaxFileSizeBytes = this.parseMaxSizeMb(
      this.configService.get('MINIO_UPLOAD_MAX_SIZE_MB'),
      50,
    );
    this.defaultAllowedMimeTypes = this.parseMimeList(
      this.configService.get('MINIO_ALLOWED_MIME_TYPES'),
    );
  }

  onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') || '127.0.0.1',
      port: parseInt(this.configService.get('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });

    this.bucketReadyPromise = this.ensureBucket();
  }

  async uploadFile(file: any, folder = 'uploads') {
    await this.ensureBucketReady();

    const objectKey = this.buildObjectKey(folder, file.originalname);
    await this.minioClient.putObject(
      this.bucketName,
      objectKey,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    return objectKey;
  }

  async getPresignedUrl(
    pathOrUrl: string,
    expiresInSeconds = this.presignedTtl,
  ) {
    if (!this.isObjectKey(pathOrUrl)) {
      return pathOrUrl;
    }

    await this.ensureBucketReady();
    return this.minioClient.presignedGetObject(
      this.bucketName,
      pathOrUrl,
      expiresInSeconds,
    );
  }

  async getObjectBuffer(pathOrUrl: string) {
    if (!this.isObjectKey(pathOrUrl)) {
      throw new BadRequestException('仅支持读取对象存储中的文件');
    }

    await this.ensureBucketReady();

    const stream = await this.minioClient.getObject(this.bucketName, pathOrUrl);
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve());
      stream.on('error', (error: Error) => reject(error));
    });

    return Buffer.concat(chunks);
  }

  validateUpload(
    file: any,
    options?: {
      maxFileSizeBytes?: number;
      allowedMimeTypes?: string[];
      label?: string;
    },
  ) {
    const label = options?.label || '文件';
    if (!file) {
      throw new BadRequestException(`请先选择要上传的${label}`);
    }

    const maxFileSizeBytes =
      options?.maxFileSizeBytes || this.defaultMaxFileSizeBytes;
    if (file.size > maxFileSizeBytes) {
      throw new BadRequestException(
        `${label}大小不能超过 ${this.formatFileSize(maxFileSizeBytes)}`,
      );
    }

    const allowedMimeTypes =
      options?.allowedMimeTypes && options.allowedMimeTypes.length > 0
        ? options.allowedMimeTypes
        : this.defaultAllowedMimeTypes;

    if (
      allowedMimeTypes.length > 0 &&
      file.mimetype &&
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `${label}格式不支持，当前仅允许：${allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private async ensureBucketReady() {
    if (!this.bucketReadyPromise) {
      this.bucketReadyPromise = this.ensureBucket();
    }

    await this.bucketReadyPromise;
  }

  private async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      this.logger.warn(`MinIO check failed: ${error.message}`);
      throw error;
    }
  }

  private buildObjectKey(folder: string, originalname: string) {
    const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
    const extension = this.extractExtension(originalname);
    const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const uniqueName = crypto.randomUUID().replace(/-/g, '');

    return `${sanitizedFolder}/${datePath}/${uniqueName}${extension}`;
  }

  private extractExtension(filename: string) {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1) {
      return '';
    }

    const ext = filename.slice(dotIndex).toLowerCase();
    return ext.replace(/[^a-z0-9.]/g, '');
  }

  private isObjectKey(pathOrUrl: string) {
    return !/^https?:\/\//i.test(pathOrUrl);
  }

  private parseMaxSizeMb(rawValue: string | undefined, fallbackMb: number) {
    const parsed = parseInt(rawValue || `${fallbackMb}`, 10);
    const safeMb = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMb;
    return safeMb * 1024 * 1024;
  }

  private parseMimeList(rawValue: string | undefined) {
    return String(rawValue || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private formatFileSize(bytes: number) {
    const sizeInMb = bytes / (1024 * 1024);
    if (sizeInMb >= 1) {
      return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)} MB`;
    }

    return `${Math.ceil(bytes / 1024)} KB`;
  }
}
