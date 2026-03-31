import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: { permissions: true },
        },
      },
    });

    if (!user) throw new UnauthorizedException('用户不存在');

    // 使用与 UserService 一致的加密方式进行比对
    const encryptedPass = CryptoJS.SHA256(pass).toString();
    if (user.password !== encryptedPass) {
      throw new UnauthorizedException('密码错误');
    }

    if (user.status === 0) throw new UnauthorizedException('账号已禁用');

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const roles = user.roles?.map((r) => r.name) || [];
    const permissions = Array.from(
      new Set(
        user.roles?.flatMap((r) => r.permissions?.map((p) => p.code)) || [],
      ),
    );

    const payload = {
      username: user.username,
      sub: user.id,
      deptId: user.deptId,
      platformId: user.platformId,
      roles,
      permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        deptId: user.deptId,
        roles: user.roles,
        permissions,
      },
    };
  }
}
