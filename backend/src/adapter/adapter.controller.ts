import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdapterService } from './adapter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/auth.controller';
import { parseWithZod } from '../common/utils/zod-validation';
import {
  adapterCollectSchema,
  adapterFakeDataSchema,
  adapterFakeModeSchema,
  adapterStatusSchema,
  adapterUpsertSchema,
} from './adapter.schemas';

@Controller('api/adapter')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdapterController {
  constructor(private readonly adapterService: AdapterService) {}

  @Get('list')
  @Permissions('adapter:view')
  async list(@Request() req) {
    return this.adapterService.findInterfaces(req.user);
  }

  @Get('config-options')
  @Permissions('adapter:view')
  async getConfigOptions() {
    return this.adapterService.getConfigOptions();
  }

  @Post()
  @Permissions('adapter:edit')
  async create(@Body() body: unknown) {
    return this.adapterService.createInterface(parseWithZod(adapterUpsertSchema, body));
  }

  @Put(':interfaceId')
  @Permissions('adapter:edit')
  async update(@Param('interfaceId') interfaceId: string, @Body() body: unknown) {
    return this.adapterService.updateInterface(
      interfaceId,
      parseWithZod(adapterUpsertSchema, body),
    );
  }

  @Put(':interfaceId/status')
  @Permissions('adapter:edit')
  async updateStatus(
    @Param('interfaceId') interfaceId: string,
    @Body() body: unknown,
  ) {
    const payload = parseWithZod(adapterStatusSchema, body);
    return this.adapterService.updateInterfaceStatus(interfaceId, payload.status);
  }

  /**
   * 接收第三方平台实时 Webhook (全自动入口)
   */
  @Public()
  @Post('webhook/:platformCode')
  async handleWebhook(
    @Param('platformCode') platformCode: string,
    @Body() body: any,
  ) {
    return this.adapterService.processRealtimeMessage(platformCode, body);
  }

  /**
   * 手动触发指定接口的数据采集 (补录入口)
   */
  @Post('collect/:interfaceId')
  @Permissions('adapter:edit')
  async collect(
    @Param('interfaceId') interfaceId: string,
    @Body() body?: unknown,
  ) {
    return this.adapterService.collectChatData(
      interfaceId,
      parseWithZod(adapterCollectSchema, body),
    );
  }

  /**
   * 预览映射结果，便于新平台接入时联调
   */
  @Post('preview/:interfaceId')
  @Permissions('adapter:edit')
  async preview(@Param('interfaceId') interfaceId: string, @Body() body: any) {
    return this.adapterService.previewMapping(interfaceId, body);
  }

  @Post('fake-data/:interfaceId')
  @Permissions('adapter:edit')
  async setFakeData(
    @Param('interfaceId') interfaceId: string,
    @Body() body: unknown,
  ) {
    const payload = parseWithZod(adapterFakeDataSchema, body);
    return this.adapterService.setFakeData(
      interfaceId,
      payload.data,
      payload.scene || 'manual',
    );
  }

  @Post('fake-mode/:interfaceId')
  @Permissions('adapter:edit')
  async toggleFakeMode(
    @Param('interfaceId') interfaceId: string,
    @Body() body: unknown,
  ) {
    const payload = parseWithZod(adapterFakeModeSchema, body);
    return this.adapterService.toggleFakeMode(interfaceId, payload.enable);
  }

  /**
   * 获取采集监控状态
   */
  @Get('monitor')
  @Permissions('adapter:view')
  async getMonitor(@Query('interfaceId') interfaceId: string) {
    return this.adapterService.getMonitor(interfaceId);
  }
}
