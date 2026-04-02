import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('platform')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PlatformController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @Permissions('org:edit')
  create(@Body() data: Prisma.PlatformCreateInput) {
    return this.orgService.createPlatform(data);
  }

  @Get('list')
  @Permissions('org:view')
  findAll() {
    return this.orgService.findAllPlatforms();
  }
}

@Controller('dept')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DeptController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @Permissions('org:edit')
  create(@Body() data: Prisma.DepartmentCreateInput) {
    return this.orgService.createDepartment(data);
  }

  @Get('list')
  @Permissions('org:view')
  findAll(@Query('platformId') platformId?: string) {
    return this.orgService.findAllDepartments(platformId);
  }
}

@Controller('shop')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ShopController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post()
  @Permissions('org:edit')
  create(@Body() data: Prisma.ShopCreateInput) {
    return this.orgService.createShop(data);
  }

  @Get('list')
  @Permissions('org:view')
  findAll(@Query('deptId') deptId?: string) {
    return this.orgService.findAllShops(deptId);
  }
}
