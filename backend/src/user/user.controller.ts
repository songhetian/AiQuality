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
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { parseWithZod } from '../common/utils/zod-validation';
import {
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
} from './user.schemas';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('user:edit')
  create(@Body() body: unknown) {
    return this.userService.create(parseWithZod(createUserSchema, body));
  }

  @Get('list')
  @Permissions('user:view')
  findAll(@Query() query: Record<string, unknown>) {
    return this.userService.findAll(parseWithZod(userListQuerySchema, query));
  }

  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Get(':id')
  @Permissions('user:view')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('user:edit')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.userService.update(id, parseWithZod(updateUserSchema, body));
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('user:edit')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
