import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';

@Module({
  providers: [UserService, RoleService, PermissionService],
  controllers: [UserController, RoleController, PermissionController],
  exports: [UserService, RoleService, PermissionService],
})
export class UserModule {}
