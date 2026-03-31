import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private encryptPassword(password: string): string {
    // 简单使用 SHA256 加密，实际中应该加盐
    return CryptoJS.SHA256(password).toString();
  }

  async create(data: Prisma.UserCreateInput) {
    const encrypted = this.encryptPassword(data.password);
    return this.prisma.user.create({
      data: {
        ...data,
        password: encrypted,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { roles: true },
    });
  }

  async findAll(query: any) {
    const { platformId, deptId, shopId, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    return this.prisma.user.findMany({
      where: {
        platformId: platformId || undefined,
        deptId: deptId || undefined,
        shopId: shopId || undefined,
      },
      skip: parseInt(skip.toString()),
      take: parseInt(pageSize.toString()),
      orderBy: { createTime: 'desc' },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    if (data.password) {
      data.password = this.encryptPassword(data.password as string);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
