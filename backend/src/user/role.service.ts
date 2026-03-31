import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({ data });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  async assignPermissions(id: string, permissionIds: string[]) {
    return this.prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
    });
  }
}
