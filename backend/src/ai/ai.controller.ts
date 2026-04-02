import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { InsightService } from './insight.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AiController {
  constructor(private readonly insightService: InsightService) {}

  @Get('insight/question')
  @Permissions('insight:question')
  getHighFreqQuestions(@Query() query: any) {
    return this.insightService.getHighFreqQuestions(query);
  }

  @Get('insight/question/tags')
  @Permissions('insight:question')
  getHighFreqQuestionTags() {
    return this.insightService.getHighFreqQuestionTags();
  }

  @Get('insight/loss')
  @Permissions('insight:loss')
  getLossAnalysis(@Query() query: any, @Request() req) {
    return this.insightService.getLossAnalysis(query, req.user);
  }

  @Get('insight/loss/stats')
  @Permissions('insight:loss')
  getLossStats(@Query() query: any, @Request() req) {
    return this.insightService.getLossStats(query, req.user);
  }

  @Get('insight/loss/analyze/:sessionId')
  @Permissions('insight:loss')
  analyzeLoss(@Param('sessionId') sessionId: string) {
    return this.insightService.analyzeLoss(sessionId);
  }

  @Put('insight/loss/:id/follow-up')
  @Permissions('insight:loss')
  updateLossFollowUp(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    return this.insightService.updateLossFollowUp(id, body, req.user);
  }

  @Put('insight/loss/batch-follow-up')
  @Permissions('insight:loss')
  batchUpdateLossFollowUp(@Body() body: any, @Request() req) {
    return this.insightService.batchUpdateLossFollowUp(body, req.user);
  }

  @Get('insight/loss/rule')
  @Permissions('settings:loss_rule')
  getLossRule(@Query() query: any, @Request() req) {
    return this.insightService.getLossRule(query, req.user);
  }

  @Post('insight/loss/rule')
  @Permissions('settings:loss_rule')
  saveLossRule(@Body() body: any, @Request() req) {
    return this.insightService.saveLossRule(body, req.user);
  }
}
