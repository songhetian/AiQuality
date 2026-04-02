const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

if (!process.env.DATABASE_URL) {
  throw new Error('环境变量 DATABASE_URL 未定义，请检查根目录 .env 文件。');
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL),
});

async function main() {
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
    { name: '知识库管理', code: 'knowledge:view', type: 'MENU' },
    { name: '知识库上传', code: 'knowledge:upload', type: 'BUTTON' },
    { name: '标签查看', code: 'tag:view', type: 'MENU' },
    { name: '标签管理', code: 'tag:edit', type: 'BUTTON' },
    { name: '标签审核', code: 'tag:audit', type: 'BUTTON' },
    { name: '敏感词查看', code: 'keyword:view', type: 'MENU' },
    { name: '敏感词管理', code: 'keyword:edit', type: 'BUTTON' },
    { name: '敏感词记录', code: 'violation:record', type: 'MENU' },
    { name: '高频问题分析', code: 'insight:question', type: 'MENU' },
    { name: '询单流失分析', code: 'insight:loss', type: 'MENU' },
    { name: '流失规则配置', code: 'settings:loss_rule', type: 'BUTTON' },
    { name: '聊天查看', code: 'chat:view', type: 'MENU' },
    { name: '质检查看', code: 'quality:view', type: 'MENU' },
    { name: '质检处理', code: 'quality:edit', type: 'BUTTON' },
    { name: '成本查看', code: 'cost:view', type: 'MENU' },
    { name: '成本配置', code: 'cost:edit', type: 'BUTTON' },
    { name: '系统设置', code: 'settings:view', type: 'MENU' },
    { name: '日志查看', code: 'log:view', type: 'MENU' },
    { name: '文件上传', code: 'file:upload', type: 'BUTTON' },
  ];

  console.log('开始初始化权限数据...');
  
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  // 初始化一个超级管理员角色并关联所有权限
  const allPerms = await prisma.permission.findMany();
  await prisma.role.upsert({
    where: { id: 'admin-role-id' }, // 固定一个ID便于测试
    update: {
      permissions: {
        set: allPerms.map(p => ({ id: p.id }))
      }
    },
    create: {
      id: 'admin-role-id',
      name: 'SUPER_ADMIN',
      description: '系统超级管理员',
      isSystem: true,
      permissions: {
        connect: allPerms.map(p => ({ id: p.id }))
      }
    }
  });

  console.log('权限与角色数据初始化完成！');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
