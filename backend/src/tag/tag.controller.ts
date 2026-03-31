import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('api/tag')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @Permissions('tag:edit')
  create(@Body() data: any) {
    return this.tagService.create(data);
  }

  @Get('list')
  @Permissions('tag:view')
  findAll(@Query() query: any) {
    return this.tagService.findAll(query);
  }

  @Get('audit/list')
  @Permissions('tag:view')
  findAuditList() {
    return this.tagService.findAuditList();
  }

  @Get(':tagCode')
  @Permissions('tag:view')
  findOne(@Param('tagCode') tagCode: string) {
    return this.tagService.findOne(tagCode);
  }

  @Put(':tagCode')
  @Permissions('tag:edit')
  update(@Param('tagCode') tagCode: string, @Body() data: any) {
    return this.tagService.update(tagCode, data);
  }

  @Delete('delete/:tagCode')
  @Permissions('tag:edit')
  remove(@Param('tagCode') tagCode: string) {
    return this.tagService.remove(tagCode);
  }

  @Put(':tagCode/status')
  @Permissions('tag:edit')
  updateStatus(
    @Param('tagCode') tagCode: string,
    @Body('status') status: number,
  ) {
    return this.tagService.updateStatus(tagCode, status);
  }

  @Post('audit/:id')
  @Permissions('tag:audit')
  handleAudit(@Param('id') id: string, @Body('status') status: number) {
    return this.tagService.handleAudit(id, status);
  }
}
