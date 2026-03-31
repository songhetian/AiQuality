import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAllPlatforms() {
    return this.redis.wrap('org:platforms', async () => {
      return this.prisma.platform.findMany({
        where: { status: 1 },
      });
    });
  }

  async createPlatform(data: Prisma.PlatformCreateInput) {
    const platform = await this.prisma.platform.create({ data });
    await this.redis.del('org:platforms');
    return platform;
  }

  async findAllDepartments(platformId?: string) {
    return this.prisma.department.findMany({
      where: { platformId: platformId || undefined },
      include: { platform: true },
    });
  }

  async createDepartment(data: Prisma.DepartmentCreateInput) {
    const dept = await this.prisma.department.create({ data });
    await this.redis.delByPattern('org:depts:*');
    return dept;
  }

  async findDeptDetail(id: string) {
    const cacheKey = `org:depts:${id}`;
    return this.redis.wrap(cacheKey, async () => {
      return this.prisma.department.findUnique({
        where: { id },
        include: { platform: true, children: true, shops: true },
      });
    });
  }

  async findAllShops(deptId?: string) {
    return this.prisma.shop.findMany({
      where: { deptId: deptId || undefined },
      include: { department: true },
    });
  }

  async createShop(data: Prisma.ShopCreateInput) {
    const shop = await this.prisma.shop.create({ data });
    await this.redis.delByPattern('org:depts:*');
    return shop;
  }

  async removePlatform(id: string) {
    const depts = await this.prisma.department.count({
      where: { platformId: id },
    });
    if (depts > 0)
      throw new Error('Cannot delete platform with associated departments');

    await this.redis.del('org:platforms');
    return this.prisma.platform.delete({ where: { id } });
  }

  async removeDepartment(id: string) {
    const shops = await this.prisma.shop.count({ where: { deptId: id } });
    const users = await this.prisma.user.count({ where: { deptId: id } });

    if (shops > 0 || users > 0) {
      throw new Error(
        'Cannot delete department with associated shops or users',
      );
    }

    await this.redis.delByPattern('org:depts:*');
    return this.prisma.department.delete({ where: { id } });
  }
}
