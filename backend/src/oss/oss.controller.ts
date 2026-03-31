import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OssService } from './oss.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('api/file')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Post('upload')
  @Permissions('file:upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    this.ossService.validateUpload(file, { label: '附件' });
    const objectKey = await this.ossService.uploadFile(file);
    const url = await this.ossService.getPresignedUrl(objectKey);
    return { url, objectKey };
  }
}
