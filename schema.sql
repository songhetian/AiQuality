-- 设置编码，防止中文乱码
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Platform` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `managerId` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Platform_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Department` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `managerId` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Shop` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NOT NULL,
    `managerId` VARCHAR(191) NULL,
    `serviceTeam` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime?` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId?` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Permission_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------
-- 数据初始化 (具有幂等性)
-- ----------------------------

-- 1. 初始化基础权限数据
INSERT IGNORE INTO `Permission` (`id`, `name`, `code`, `type`, `status`, `createTime`, `updateTime`) VALUES
('p1', '控制台查看', 'dashboard:view', 'MENU', 1, NOW(), NOW()),
('p2', '组织查看', 'org:view', 'MENU', 1, NOW(), NOW()),
('p3', '组织管理', 'org:edit', 'BUTTON', 1, NOW(), NOW()),
('p4', '接口适配查看', 'adapter:view', 'MENU', 1, NOW(), NOW()),
('p5', '接口适配管理', 'adapter:edit', 'BUTTON', 1, NOW(), NOW()),
('p6', '用户查看', 'user:view', 'MENU', 1, NOW(), NOW()),
('p7', '用户管理', 'user:edit', 'BUTTON', 1, NOW(), NOW()),
('p8', '角色查看', 'role:view', 'MENU', 1, NOW(), NOW()),
('p9', '角色管理', 'role:edit', 'BUTTON', 1, NOW(), NOW()),
('p10', '标签查看', 'tag:view', 'MENU', 1, NOW(), NOW()),
('p11', '标签管理', 'tag:edit', 'BUTTON', 1, NOW(), NOW()),
('p12', '标签审核', 'tag:audit', 'BUTTON', 1, NOW(), NOW()),
('p13', '敏感词查看', 'keyword:view', 'MENU', 1, NOW(), NOW()),
('p14', '敏感词管理', 'keyword:edit', 'BUTTON', 1, NOW(), NOW()),
('p15', '聊天查看', 'chat:view', 'MENU', 1, NOW(), NOW()),
('p16', '质检查看', 'quality:view', 'MENU', 1, NOW(), NOW()),
('p17', '质检处理', 'quality:edit', 'BUTTON', 1, NOW(), NOW()),
('p18', '成本查看', 'cost:view', 'MENU', 1, NOW(), NOW()),
('p19', '成本配置', 'cost:edit', 'BUTTON', 1, NOW(), NOW()),
('p20', '系统设置', 'settings:view', 'MENU', 1, NOW(), NOW()),
('p21', 'AI配置查看', 'ai-config:view', 'MENU', 1, NOW(), NOW()),
('p22', 'AI配置管理', 'ai-config:edit', 'BUTTON', 1, NOW(), NOW()),
('p23', '敏感词记录', 'violation:record', 'MENU', 1, NOW(), NOW()),
('p24', '高频问题分析', 'insight:question', 'MENU', 1, NOW(), NOW()),
('p25', '询单流失分析', 'insight:loss', 'MENU', 1, NOW(), NOW()),
('p26', '流失规则配置', 'settings:loss_rule', 'BUTTON', 1, NOW(), NOW()),
('p27', '知识库管理', 'knowledge:view', 'MENU', 1, NOW(), NOW()),
('p28', '知识库上传', 'knowledge:upload', 'BUTTON', 1, NOW(), NOW()),
('p29', '日志查看', 'log:view', 'MENU', 1, NOW(), NOW()),
('p30', '文件上传', 'file:upload', 'BUTTON', 1, NOW(), NOW());

-- 2. 初始化超级管理员角色
INSERT IGNORE INTO `Role` (`id`, `name`, `description`, `isSystem`, `status`, `createTime`, `updateTime`)
VALUES ('admin-role-id', 'SUPER_ADMIN', '系统超级管理员', 1, 1, NOW(), NOW());

-- 3. 初始化默认管理员用户 (用户名: admin, 密码: 123456)
-- 密码哈希值为 SHA256(123456)
INSERT IGNORE INTO `User` (`id`, `username`, `password`, `status`, `createTime`, `updateTime`)
VALUES ('admin-user-id', 'admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, NOW(), NOW());

-- 4. 建立用户与角色的关联
CREATE TABLE IF NOT EXISTS `_UserRoles` (`A` VARCHAR(191) NOT NULL, `B` VARCHAR(191) NOT NULL, UNIQUE INDEX `_UserRoles_AB_unique`(`A`, `B`), INDEX `_UserRoles_B_index`(`B`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO `_UserRoles` (`A`, `B`) VALUES ('admin-role-id', 'admin-user-id');

-- 5. 将所有权限同步给超级管理员角色
CREATE TABLE IF NOT EXISTS `_RolePermissions` (`A` VARCHAR(191) NOT NULL, `B` VARCHAR(191) NOT NULL, UNIQUE INDEX `_RolePermissions_AB_unique`(`A`, `B`), INDEX `_RolePermissions_B_index`(`B`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO `_RolePermissions` (`A`, `B`)
SELECT `id`, 'admin-role-id' FROM `Permission`;

SET FOREIGN_KEY_CHECKS = 1;
