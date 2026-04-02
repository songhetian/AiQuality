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
import { Prisma } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('user:edit')
  create(@Body() data: Prisma.UserCreateInput) {
    return this.userService.create(data);
  }

  @Get('list')
  @Permissions('user:view')
  findAll(@Query() query: any) {
    return this.userService.findAll(query);
  }

  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Get(':id')
  @Permissions('user:view')
  findOne(@Param('id') id: string) {
    return this.userService.findByUsername(id); // Or findById
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('user:edit')
  update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('user:edit')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
