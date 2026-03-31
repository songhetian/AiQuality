import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LogService } from './log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('api/log')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('operation/list')
  @Permissions('log:view')
  findOperationLogs(@Query() query: any) {
    return this.logService.findAllOperationLogs(query);
  }

  @Get('operation/page')
  @Permissions('log:view')
  findOperationLogsPage(@Query() query: any) {
    return this.logService.findOperationLogsPage(query);
  }

  @Get('system/list')
  @Permissions('log:view')
  findSystemLogs(@Query() query: any) {
    return this.logService.findAllSystemLogs(query);
  }

  @Get('system/page')
  @Permissions('log:view')
  findSystemLogsPage(@Query() query: any) {
    return this.logService.findSystemLogsPage(query);
  }

  @Get('system/stats')
  @Permissions('log:view')
  findSystemLogsStats(@Query() query: any) {
    return this.logService.findSystemLogsStats(query);
  }

  @Get('violation/list')
  @Permissions('violation:record')
  findViolationLogs(@Query() query: any, @Request() req) {
    return this.logService.findViolationLogs(query, req.user);
  }

  @Get('violation/stats')
  @Permissions('violation:record')
  findViolationStats(@Query() query: any, @Request() req) {
    return this.logService.findViolationStats(query, req.user);
  }

  @Put('violation/:id/handle')
  @Permissions('violation:record')
  handleViolation(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.logService.handleViolation(id, body, req.user);
  }

  @Put('violation/batch-handle')
  @Permissions('violation:record')
  handleViolationsBulk(@Body() body: any, @Request() req) {
    return this.logService.handleViolationsBulk(body, req.user);
  }
}
