import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class OssService implements OnModuleInit {
    private readonly configService;
    private minioClient;
    private readonly logger;
    private readonly bucketName;
    private readonly presignedTtl;
    private readonly defaultMaxFileSizeBytes;
    private readonly defaultAllowedMimeTypes;
    private bucketReadyPromise;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    uploadFile(file: any, folder?: string): Promise<string>;
    getPresignedUrl(pathOrUrl: string, expiresInSeconds?: number): Promise<any>;
    getObjectBuffer(pathOrUrl: string): Promise<Buffer<ArrayBuffer>>;
    validateUpload(file: any, options?: {
        maxFileSizeBytes?: number;
        allowedMimeTypes?: string[];
        label?: string;
    }): void;
    private ensureBucketReady;
    private ensureBucket;
    private buildObjectKey;
    private extractExtension;
    private isObjectKey;
    private parseMaxSizeMb;
    private parseMimeList;
    private formatFileSize;
}
