"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OssService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OssService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const Minio = __importStar(require("minio"));
let OssService = OssService_1 = class OssService {
    configService;
    minioClient;
    logger = new common_1.Logger(OssService_1.name);
    bucketName;
    presignedTtl;
    defaultMaxFileSizeBytes;
    defaultAllowedMimeTypes;
    bucketReadyPromise = null;
    constructor(configService) {
        this.configService = configService;
        this.bucketName = this.configService.get('MINIO_BUCKET') || 'ai-quality';
        this.presignedTtl = parseInt(this.configService.get('MINIO_PRESIGNED_TTL') || '3600', 10);
        this.defaultMaxFileSizeBytes = this.parseMaxSizeMb(this.configService.get('MINIO_UPLOAD_MAX_SIZE_MB'), 50);
        this.defaultAllowedMimeTypes = this.parseMimeList(this.configService.get('MINIO_ALLOWED_MIME_TYPES'));
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
    async uploadFile(file, folder = 'uploads') {
        await this.ensureBucketReady();
        const objectKey = this.buildObjectKey(folder, file.originalname);
        await this.minioClient.putObject(this.bucketName, objectKey, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });
        return objectKey;
    }
    async getPresignedUrl(pathOrUrl, expiresInSeconds = this.presignedTtl) {
        if (!this.isObjectKey(pathOrUrl)) {
            return pathOrUrl;
        }
        await this.ensureBucketReady();
        return this.minioClient.presignedGetObject(this.bucketName, pathOrUrl, expiresInSeconds);
    }
    async getObjectBuffer(pathOrUrl) {
        if (!this.isObjectKey(pathOrUrl)) {
            throw new common_1.BadRequestException('仅支持读取对象存储中的文件');
        }
        await this.ensureBucketReady();
        const stream = await this.minioClient.getObject(this.bucketName, pathOrUrl);
        const chunks = [];
        await new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            stream.on('end', () => resolve());
            stream.on('error', (error) => reject(error));
        });
        return Buffer.concat(chunks);
    }
    validateUpload(file, options) {
        const label = options?.label || '文件';
        if (!file) {
            throw new common_1.BadRequestException(`请先选择要上传的${label}`);
        }
        const maxFileSizeBytes = options?.maxFileSizeBytes || this.defaultMaxFileSizeBytes;
        if (file.size > maxFileSizeBytes) {
            throw new common_1.BadRequestException(`${label}大小不能超过 ${this.formatFileSize(maxFileSizeBytes)}`);
        }
        const allowedMimeTypes = options?.allowedMimeTypes && options.allowedMimeTypes.length > 0
            ? options.allowedMimeTypes
            : this.defaultAllowedMimeTypes;
        if (allowedMimeTypes.length > 0 &&
            file.mimetype &&
            !allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`${label}格式不支持，当前仅允许：${allowedMimeTypes.join(', ')}`);
        }
    }
    async ensureBucketReady() {
        if (!this.bucketReadyPromise) {
            this.bucketReadyPromise = this.ensureBucket();
        }
        await this.bucketReadyPromise;
    }
    async ensureBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            }
        }
        catch (error) {
            this.logger.warn(`MinIO check failed: ${error.message}`);
            throw error;
        }
    }
    buildObjectKey(folder, originalname) {
        const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
        const extension = this.extractExtension(originalname);
        const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
        const uniqueName = crypto.randomUUID().replace(/-/g, '');
        return `${sanitizedFolder}/${datePath}/${uniqueName}${extension}`;
    }
    extractExtension(filename) {
        const dotIndex = filename.lastIndexOf('.');
        if (dotIndex === -1) {
            return '';
        }
        const ext = filename.slice(dotIndex).toLowerCase();
        return ext.replace(/[^a-z0-9.]/g, '');
    }
    isObjectKey(pathOrUrl) {
        return !/^https?:\/\//i.test(pathOrUrl);
    }
    parseMaxSizeMb(rawValue, fallbackMb) {
        const parsed = parseInt(rawValue || `${fallbackMb}`, 10);
        const safeMb = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMb;
        return safeMb * 1024 * 1024;
    }
    parseMimeList(rawValue) {
        return String(rawValue || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    formatFileSize(bytes) {
        const sizeInMb = bytes / (1024 * 1024);
        if (sizeInMb >= 1) {
            return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)} MB`;
        }
        return `${Math.ceil(bytes / 1024)} KB`;
    }
};
exports.OssService = OssService;
exports.OssService = OssService = OssService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OssService);
//# sourceMappingURL=oss.service.js.map