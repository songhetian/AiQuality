import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/permission')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('list')
  @Permissions('role:view')
  findAll() {
    return this.permissionService.findAll();
  }

  @Post('sync')
  @Roles('SUPER_ADMIN')
  @Permissions('role:edit')
  sync() {
    return this.permissionService.syncPermissions();
  }
}
