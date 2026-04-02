import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';
import { CreateUserDto, UpdateUserDto, UserListQuery } from './user.schemas';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private readonly userIncludes = {
    roles: {
      select: {
        id: true,
        name: true,
      },
    },
    department: {
      select: {
        id: true,
        name: true,
      },
    },
    platform: {
      select: {
        id: true,
        name: true,
      },
    },
    shop: {
      select: {
        id: true,
        name: true,
      },
    },
  } satisfies Prisma.UserInclude;

  private encryptPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  async create(data: CreateUserDto) {
    const encrypted = this.encryptPassword(data.password);
    return this.prisma.user.create({
      data: this.buildCreateData(data, encrypted),
      include: this.userIncludes,
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: this.userIncludes,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.userIncludes,
    });
  }

  async findAll(query: UserListQuery) {
    const { platformId, deptId, shopId, username, status, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      platformId: platformId ?? undefined,
      deptId: deptId ?? undefined,
      shopId: shopId ?? undefined,
      status,
      OR: username
        ? [
            {
              username: {
                contains: username,
              },
            },
            {
              phone: {
                contains: username,
              },
            },
            {
              email: {
                contains: username,
              },
            },
          ]
        : undefined,
    };

    const [list, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createTime: 'desc' },
        include: this.userIncludes,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: this.buildUpdateData(data),
      include: this.userIncludes,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  private buildCreateData(data: CreateUserDto, encryptedPassword: string): Prisma.UserCreateInput {
    return {
      username: data.username,
      password: encryptedPassword,
      phone: data.phone,
      email: data.email,
      status: data.status,
      platform: this.toRelationInput(data.platformId),
      department: this.toRelationInput(data.deptId),
      shop: this.toRelationInput(data.shopId),
      roles: data.roleIds.length
        ? {
            connect: data.roleIds.map((id) => ({ id })),
          }
        : undefined,
    };
  }

  private buildUpdateData(data: UpdateUserDto): Prisma.UserUpdateInput {
    return {
      username: data.username,
      phone: data.phone,
      email: data.email,
      status: data.status,
      password: data.password ? this.encryptPassword(data.password) : undefined,
      platform: this.toRelationInput(data.platformId, true),
      department: this.toRelationInput(data.deptId, true),
      shop: this.toRelationInput(data.shopId, true),
      roles: {
        set: data.roleIds.map((id) => ({ id })),
      },
    };
  }

  private toRelationInput(
    relationId: string | null | undefined,
    allowDisconnect = false,
  ) {
    if (relationId === undefined) {
      return undefined;
    }

    if (relationId === null) {
      return allowDisconnect ? { disconnect: true } : undefined;
    }

    return {
      connect: { id: relationId },
    };
  }
}
