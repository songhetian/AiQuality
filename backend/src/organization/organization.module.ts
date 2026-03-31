import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import {
  PlatformController,
  DeptController,
  ShopController,
} from './organization.controller';

@Module({
  providers: [OrganizationService],
  controllers: [PlatformController, DeptController, ShopController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
