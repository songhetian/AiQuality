import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('session')
  @Permissions('chat:view')
  createSession(@Body() body: any) {
    return this.chatService.createSession({
      sessionId: body.sessionId,
      platformId: body.platformId,
      deptId: body.deptId,
      shop: { connect: { id: body.shopId } },
      interface: { connect: { id: body.interfaceId } }, // 修正
      startTime: new Date(),
    });
  }

  @Get('list')
  @Permissions('chat:view')
  findAll(@Query() query: any, @Request() req) {
    const user = req.user;
    const filterQuery = user.roles?.includes('SUPER_ADMIN')
      ? query
      : { ...query, deptId: user.deptId };
    return this.chatService.findAllSessions(filterQuery);
  }

  @Get('detail/:id')
  @Permissions('chat:view')
  async findOne(@Param('id') id: string, @Request() req) {
    const detail = await this.chatService.findSessionDetail(id);
    const user = req.user;

    if (
      detail &&
      !user.roles?.includes('SUPER_ADMIN') &&
      detail.deptId !== user.deptId
    ) {
      throw new Error('No permission to access this session detail');
    }
    return detail;
  }

  @Get('similar/:recordId')
  @Permissions('chat:view')
  findSimilar(@Param('recordId') recordId: string, @Request() req) {
    return this.chatService.findSimilarRecords(recordId, req.user);
  }

  @Post('record')
  @Permissions('chat:view')
  createRecord(@Body() body: any) {
    return this.chatService.createRecord(
      body.sessionId,
      body.data,
      body.vector,
    );
  }
}
