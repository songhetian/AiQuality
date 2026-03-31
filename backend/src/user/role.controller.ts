import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Prisma } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/role')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @Permissions('role:edit')
  create(@Body() data: Prisma.RoleCreateInput) {
    return this.roleService.create(data);
  }

  @Get('list')
  @Permissions('role:view')
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Permissions('role:view')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('role:edit')
  update(@Param('id') id: string, @Body() data: Prisma.RoleUpdateInput) {
    return this.roleService.update(id, data);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('role:edit')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions')
  @Roles('SUPER_ADMIN')
  @Permissions('role:edit')
  assignPermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.roleService.assignPermissions(id, permissionIds);
  }
}
