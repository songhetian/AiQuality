import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { SettingsService } from './settings.service';
import { parseWithZod } from '../common/utils/zod-validation';
import {
  testAiConfigSchema,
  updateAiConfigSchema,
} from './settings.schemas';

type RequestUser = {
  roles?: string[];
  deptId?: string | null;
};

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('overview')
  @Permissions('settings:view')
  getOverview(@Request() req: { user: RequestUser }) {
    return this.settingsService.getOverview(req.user);
  }

  @Get('ai-config')
  @Permissions('ai-config:view')
  getAiConfig() {
    return this.settingsService.getAiConfig();
  }

  @Put('ai-config')
  @Permissions('ai-config:edit')
  updateAiConfig(
    @Body()
    body: unknown,
  ) {
    return this.settingsService.updateAiConfig(
      parseWithZod(updateAiConfigSchema, body),
    );
  }

  @Post('ai-config/test')
  @Permissions('ai-config:edit')
  testAiConfig(
    @Body()
    body: unknown,
  ) {
    return this.settingsService.testAiConfig(
      parseWithZod(testAiConfigSchema, body),
    );
  }
}
