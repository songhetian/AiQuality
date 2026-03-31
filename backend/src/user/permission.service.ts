import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      where: { status: 1 },
      orderBy: { createTime: 'asc' },
    });
  }

  /**
   * 注册新权限并自动同步给超级管理员
   */
  async registerPermission(data: {
    name: string;
    code: string;
    type: 'MENU' | 'BUTTON' | 'API';
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 创建或更新权限
      const permission = await tx.permission.upsert({
        where: { code: data.code },
        update: { name: data.name, type: data.type },
        create: data,
      });

      // 2. 自动赋予超级管理员角色
      // 假设超级管理员角色 ID 为 admin-role-id，已经在初始化 SQL 中定义
      await tx.role.update({
        where: { id: 'admin-role-id' },
        data: {
          permissions: {
            connect: { id: permission.id },
          },
        },
      });

      return permission;
    });
  }

  /**
   * 自动初始化/同步基础权限数据
   */
  async syncPermissions() {
    const permissions = [
      { name: '控制台查看', code: 'dashboard:view', type: 'MENU' },
      { name: '组织查看', code: 'org:view', type: 'MENU' },
      { name: '组织管理', code: 'org:edit', type: 'BUTTON' },
      { name: '接口适配查看', code: 'adapter:view', type: 'MENU' },
      { name: '接口适配管理', code: 'adapter:edit', type: 'BUTTON' },
      { name: '用户查看', code: 'user:view', type: 'MENU' },
      { name: '用户管理', code: 'user:edit', type: 'BUTTON' },
      { name: '角色查看', code: 'role:view', type: 'MENU' },
      { name: '角色管理', code: 'role:edit', type: 'BUTTON' },
      { name: '知识库查看', code: 'knowledge:view', type: 'MENU' },
      { name: '知识库上传', code: 'knowledge:upload', type: 'BUTTON' },
      { name: '标签查看', code: 'tag:view', type: 'MENU' },
      { name: '标签管理', code: 'tag:edit', type: 'BUTTON' },
      { name: '标签审核', code: 'tag:audit', type: 'BUTTON' },
      { name: '敏感词查看', code: 'keyword:view', type: 'MENU' },
      { name: '敏感词管理', code: 'keyword:edit', type: 'BUTTON' },
      { name: '敏感词记录', code: 'violation:record', type: 'MENU' },
      { name: '高频问题查看', code: 'insight:question', type: 'MENU' },
      { name: '询单流失查看', code: 'insight:loss', type: 'MENU' },
      { name: '流失规则配置', code: 'settings:loss_rule', type: 'BUTTON' },
      { name: '聊天查看', code: 'chat:view', type: 'MENU' },
      { name: '质检查看', code: 'quality:view', type: 'MENU' },
      { name: '质检处理', code: 'quality:edit', type: 'BUTTON' },
      { name: '成本查看', code: 'cost:view', type: 'MENU' },
      { name: '成本配置', code: 'cost:edit', type: 'BUTTON' },
      { name: '系统设置', code: 'settings:view', type: 'MENU' },
      { name: 'AI配置查看', code: 'ai-config:view', type: 'MENU' },
      { name: 'AI配置管理', code: 'ai-config:edit', type: 'BUTTON' },
      { name: '日志查看', code: 'log:view', type: 'MENU' },
      { name: '文件上传', code: 'file:upload', type: 'BUTTON' },
    ];

    for (const p of permissions) {
      await this.prisma.permission.upsert({
        where: { code: p.code },
        update: { name: p.name },
        create: p,
      });
    }

    return { success: true, count: permissions.length };
  }
}
