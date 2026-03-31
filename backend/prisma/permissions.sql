-- 1. 清理并初始化基础权限数据
-- 使用 REPLACE 确保幂等性
INSERT INTO `Permission` (`id`, `name`, `code`, `type`, `status`, `createTime`, `updateTime`) VALUES
(UUID(), '控制台查看', 'dashboard:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '组织查看', 'org:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '组织管理', 'org:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '接口适配查看', 'adapter:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '接口适配管理', 'adapter:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '用户查看', 'user:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '用户管理', 'user:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '角色查看', 'role:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '角色管理', 'role:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '知识库管理', 'knowledge:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '知识库上传', 'knowledge:upload', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '标签查看', 'tag:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '标签管理', 'tag:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '标签审核', 'tag:audit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '敏感词查看', 'keyword:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '敏感词管理', 'keyword:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '敏感词记录', 'violation:record', 'MENU', 1, NOW(), NOW()),
(UUID(), '高频问题分析', 'insight:question', 'MENU', 1, NOW(), NOW()),
(UUID(), '询单流失分析', 'insight:loss', 'MENU', 1, NOW(), NOW()),
(UUID(), '流失规则配置', 'settings:loss_rule', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '聊天查看', 'chat:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '质检查看', 'quality:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '质检处理', 'quality:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '成本查看', 'cost:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '成本配置', 'cost:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '系统设置', 'settings:view', 'MENU', 1, NOW(), NOW()),
(UUID(), 'AI配置查看', 'ai-config:view', 'MENU', 1, NOW(), NOW()),
(UUID(), 'AI配置管理', 'ai-config:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '日志查看', 'log:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '文件上传', 'file:upload', 'BUTTON', 1, NOW(), NOW());

-- 2. 初始化超级管理员角色 (如果不存在)
INSERT IGNORE INTO `Role` (`id`, `name`, `description`, `isSystem`, `status`, `createTime`, `updateTime`) 
VALUES ('admin-role-id', 'SUPER_ADMIN', '系统超级管理员', 1, 1, NOW(), NOW());

-- 3. 将所有权限关联给超级管理员角色
-- 注意：这里使用跨表插入，确保 SUPER_ADMIN 拥有所有权限
INSERT IGNORE INTO `_RolePermissions` (`A`, `B`)
SELECT 'admin-role-id', `id` FROM `Permission`;
