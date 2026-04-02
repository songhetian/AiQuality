import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Param,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('knowledge')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class KnowledgeController {
  private readonly allowedKnowledgeMimeTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('list')
  @Permissions('knowledge:view')
  findAll(@Query() query: any, @Request() req) {
    return this.knowledgeService.findAll(query, req.user);
  }

  @Get('search')
  @Permissions('knowledge:view')
  search(@Query() query: any, @Request() req) {
    return this.knowledgeService.search(query, req.user);
  }

  @Get('tasks')
  @Permissions('knowledge:view')
  findTasks(@Query() query: any, @Request() req) {
    return this.knowledgeService.findTasks(query, req.user);
  }

  @Post('upload')
  @Permissions('knowledge:upload')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: any, @Request() req) {
    this.knowledgeService.validateKnowledgeUpload(
      file,
      this.allowedKnowledgeMimeTypes,
    );
    return this.knowledgeService.uploadKnowledge(file, req.user);
  }

  @Post('retry/:id')
  @Permissions('knowledge:upload')
  retry(@Param('id') id: string, @Request() req) {
    return this.knowledgeService.retryKnowledge(id, req.user);
  }
}
