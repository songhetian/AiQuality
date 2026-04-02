import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CostService } from './cost.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('cost')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get('stats/summary')
  @Permissions('cost:view')
  async getSummary(@Request() req) {
    const deptId = req.user.roles?.includes('SUPER_ADMIN')
      ? undefined
      : req.user.deptId;
    return this.costService.getSummaryStats(deptId);
  }

  @Get('stats/trend')
  @Permissions('cost:view')
  async getTrend(@Query('days') days: string, @Request() req) {
    const deptId = req.user.roles?.includes('SUPER_ADMIN')
      ? undefined
      : req.user.deptId;
    return this.costService.getTrendStats(parseInt(days || '7'), { deptId });
  }

  @Get('stats/dept-distribution')
  @Permissions('cost:view')
  async getDeptDistribution(@Query('days') days: string, @Request() req) {
    const deptId = req.user.roles?.includes('SUPER_ADMIN')
      ? undefined
      : req.user.deptId;
    return this.costService.getDeptDistribution(parseInt(days || '30'), {
      deptId,
    });
  }

  @Get('stats/platform-distribution')
  @Permissions('cost:view')
  async getPlatformDistribution(@Query('days') days: string, @Request() req) {
    const deptId = req.user.roles?.includes('SUPER_ADMIN')
      ? undefined
      : req.user.deptId;
    return this.costService.getPlatformDistribution(parseInt(days || '30'), {
      deptId,
    });
  }

  @Get('statistics')
  @Permissions('cost:view')
  findAll(@Query() query: any) {
    return this.costService.getStatistics(query);
  }

  @Post('billing-rule')
  @Permissions('cost:edit')
  setBillingRule(@Body() data: any) {
    return this.costService.setBillingRule(data);
  }
}
