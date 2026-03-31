import { OssService } from './oss.service';
export declare class OssController {
    private readonly ossService;
    constructor(ossService: OssService);
    uploadFile(file: any): Promise<{
        url: any;
        objectKey: string;
    }>;
}
