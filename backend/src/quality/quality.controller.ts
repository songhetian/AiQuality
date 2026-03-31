import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('api/quality')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get('list')
  @Permissions('quality:view')
  findAll(@Query() query: any, @Request() req) {
    return this.qualityService.findAllInspections(query, req.user);
  }

  @Get('detail/:id')
  @Permissions('quality:view')
  findOne(@Param('id') id: string, @Request() req) {
    return this.qualityService.findDetail(id, req.user);
  }

  @Get('rules/active')
  @Permissions('quality:view')
  findActiveRules(@Request() req) {
    return this.qualityService.findActiveRules(req.user);
  }

  @Post('batch')
  @Permissions('quality:view')
  startBatch(@Body() body: any, @Request() req) {
    return this.qualityService.startBatchQuality(
      req.user.deptId,
      body.sessionIds,
      body.ruleId,
    );
  }

  @Post('manual/lock/:sessionId')
  @Permissions('quality:view')
  async lockReview(@Param('sessionId') sessionId: string, @Request() req) {
    const result = await this.qualityService.lockReview(
      sessionId,
      req.user.id,
      req.user.username || req.user.name || '当前用户',
    );

    if (!result.success) {
      throw new ForbiddenException(
        `当前会话正由 ${result.owner} 进行复核，请稍后再试`,
      );
    }

    return { message: '锁定成功' };
  }

  @Post('manual/unlock/:sessionId')
  @Permissions('quality:view')
  async unlockReview(@Param('sessionId') sessionId: string, @Request() req) {
    await this.qualityService.unlockReview(sessionId, req.user.id);
    return { message: '已释放' };
  }

  @Post('retry/:id')
  @Permissions('quality:view')
  retry(@Param('id') id: string, @Request() req) {
    return this.qualityService.retryInspection(id, req.user);
  }

  @Put('update/:id')
  @Permissions('quality:view')
  async update(@Param('id') id: string, @Body() data: any, @Request() req) {
    const user = req.user;
    const inspection = await this.qualityService.findDetail(id, user);
    const result = await this.qualityService.updateInspection(id, {
      ...data,
      inspector: { connect: { id: user.id } }, // 修正 Prisma 关联
    });

    if (inspection?.sessionId) {
      await this.qualityService.unlockReview(inspection.sessionId, user.id);
    }

    return result;
  }

  @Put('batch-update')
  @Permissions('quality:view')
  batchUpdate(@Body() data: any, @Request() req) {
    return this.qualityService.batchUpdateInspections(data, req.user);
  }
}
