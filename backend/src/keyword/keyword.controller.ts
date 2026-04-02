import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('keyword')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @Get('list')
  @Permissions('keyword:view')
  findAll(
    @Query()
    query: {
      deptId?: string;
      type?: string;
      status?: string;
      word?: string;
    },
  ) {
    return this.keywordService.findAll(query);
  }

  @Post()
  @Permissions('keyword:edit')
  create(@Body() body: { word: string; type: string; deptId?: string }) {
    return this.keywordService.addKeyword(body);
  }

  @Put(':id')
  @Permissions('keyword:edit')
  update(
    @Param('id') id: string,
    @Body() body: { word?: string; type?: string; deptId?: string | null },
  ) {
    return this.keywordService.updateKeyword(id, body);
  }

  @Put(':id/status')
  @Permissions('keyword:edit')
  updateStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.keywordService.updateKeywordStatus(id, body.status);
  }
}
