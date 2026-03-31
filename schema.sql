-- CreateTable
CREATE TABLE `Platform` (
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
CREATE TABLE `Department` (
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
CREATE TABLE `Shop` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NOT NULL,
    `managerId` VARCHAR(191) NULL,
    `serviceTeam` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
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
CREATE TABLE `Permission` (
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

-- CreateTable
CREATE TABLE `AdapterInterface` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `headers` VARCHAR(191) NULL,
    `authParams` VARCHAR(191) NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NULL,
    `enableFakeData` BOOLEAN NOT NULL DEFAULT false,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataMapping` (
    `id` VARCHAR(191) NOT NULL,
    `interfaceId` VARCHAR(191) NOT NULL,
    `thirdPartyFields` TEXT NOT NULL,
    `systemFields` TEXT NOT NULL,
    `formatMapping` TEXT NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FakeData` (
    `id` VARCHAR(191) NOT NULL,
    `interfaceId` VARCHAR(191) NOT NULL,
    `fakeData` LONGTEXT NOT NULL,
    `scene` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdapterMonitor` (
    `id` VARCHAR(191) NOT NULL,
    `interfaceId` VARCHAR(191) NOT NULL,
    `responseTime` INTEGER NOT NULL,
    `successRate` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIPlatform` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `secretKey` VARCHAR(191) NOT NULL,
    `billingRule` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIKey` (
    `id` VARCHAR(191) NOT NULL,
    `aiPlatformId` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NULL,
    `secretKey` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QualityRule` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NULL,
    `sensitiveWords` TEXT NULL,
    `violationScenes` TEXT NULL,
    `scoreStandard` TEXT NULL,
    `tagMatchRules` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatSession` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `interfaceId` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChatSession_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRecord` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `senderType` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,
    `contentType` VARCHAR(191) NOT NULL DEFAULT 'TEXT',
    `sendTime` DATETIME(3) NOT NULL,
    `vectorId` VARCHAR(191) NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QualityInspection` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `aiScore` DOUBLE NULL,
    `aiResult` TEXT NULL,
    `manualScore` DOUBLE NULL,
    `manualResult` TEXT NULL,
    `inspectorId` VARCHAR(191) NULL,
    `ruleId` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `rectifyOpinion` TEXT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QualityInspection_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `tagCode` VARCHAR(191) NOT NULL,
    `tagName` VARCHAR(191) NOT NULL,
    `tagType` VARCHAR(191) NOT NULL,
    `applyDimension` VARCHAR(191) NOT NULL,
    `dimensionDetail` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `aiMatchRule` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createBy` VARCHAR(191) NOT NULL,
    `isAiCreate` INTEGER NOT NULL DEFAULT 0,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`tagCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TagRelation` (
    `id` VARCHAR(191) NOT NULL,
    `tagCode` VARCHAR(191) NOT NULL,
    `qualityId` VARCHAR(191) NULL,
    `recordId` VARCHAR(191) NULL,
    `createBy` VARCHAR(191) NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostBillingRule` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `aiPlatformId` VARCHAR(191) NOT NULL,
    `billingType` VARCHAR(191) NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostStatistics` (
    `id` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `aiPlatformId` VARCHAR(191) NOT NULL,
    `callCount` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `totalCost` DOUBLE NOT NULL DEFAULT 0,
    `statDate` DATETIME(3) NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostApportion` (
    `id` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NOT NULL,
    `apportionCost` DOUBLE NOT NULL,
    `statMonth` VARCHAR(191) NOT NULL,
    `ruleName` VARCHAR(191) NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keyword` (
    `id` VARCHAR(191) NOT NULL,
    `word` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `matchMode` VARCHAR(50) NOT NULL DEFAULT 'CONTAINS',
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `severity` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    INDEX `Keyword_platformId_deptId_status_idx`(`platformId`, `deptId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RealtimeAlert` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NULL,
    `platformId` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `matchedText` VARCHAR(191) NULL,
    `alertType` VARCHAR(50) NOT NULL DEFAULT 'KEYWORD',
    `content` TEXT NOT NULL,
    `deptId` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `handleRemark` VARCHAR(191) NULL,
    `handleBy` VARCHAR(191) NULL,
    `handleTime` DATETIME(3) NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RealtimeAlert_deptId_status_createTime_idx`(`deptId`, `status`, `createTime`),
    INDEX `RealtimeAlert_sessionId_createTime_idx`(`sessionId`, `createTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OperationLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `operation` VARCHAR(191) NOT NULL,
    `actionKind` VARCHAR(191) NULL,
    `targetType` VARCHAR(191) NULL,
    `targetId` VARCHAR(191) NULL,
    `targetCount` INTEGER NULL,
    `method` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `params` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `responseTime` INTEGER NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemLog` (
    `id` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `stack` LONGTEXT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemConfig` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `remark` VARCHAR(191) NULL,
    `updateTime` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SystemConfig_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserRoles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserRoles_AB_unique`(`A`, `B`),
    INDEX `_UserRoles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_RolePermissions` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_RolePermissions_AB_unique`(`A`, `B`),
    INDEX `_RolePermissions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Platform` ADD CONSTRAINT `Platform_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdapterInterface` ADD CONSTRAINT `AdapterInterface_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdapterInterface` ADD CONSTRAINT `AdapterInterface_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DataMapping` ADD CONSTRAINT `DataMapping_interfaceId_fkey` FOREIGN KEY (`interfaceId`) REFERENCES `AdapterInterface`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FakeData` ADD CONSTRAINT `FakeData_interfaceId_fkey` FOREIGN KEY (`interfaceId`) REFERENCES `AdapterInterface`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdapterMonitor` ADD CONSTRAINT `AdapterMonitor_interfaceId_fkey` FOREIGN KEY (`interfaceId`) REFERENCES `AdapterInterface`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIKey` ADD CONSTRAINT `AIKey_aiPlatformId_fkey` FOREIGN KEY (`aiPlatformId`) REFERENCES `AIPlatform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIKey` ADD CONSTRAINT `AIKey_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIKey` ADD CONSTRAINT `AIKey_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIKey` ADD CONSTRAINT `AIKey_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QualityRule` ADD CONSTRAINT `QualityRule_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_interfaceId_fkey` FOREIGN KEY (`interfaceId`) REFERENCES `AdapterInterface`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRecord` ADD CONSTRAINT `ChatRecord_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QualityInspection` ADD CONSTRAINT `QualityInspection_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QualityInspection` ADD CONSTRAINT `QualityInspection_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QualityInspection` ADD CONSTRAINT `QualityInspection_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `QualityRule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_createBy_fkey` FOREIGN KEY (`createBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagRelation` ADD CONSTRAINT `TagRelation_tagCode_fkey` FOREIGN KEY (`tagCode`) REFERENCES `Tag`(`tagCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagRelation` ADD CONSTRAINT `TagRelation_qualityId_fkey` FOREIGN KEY (`qualityId`) REFERENCES `QualityInspection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagRelation` ADD CONSTRAINT `TagRelation_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `ChatRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagRelation` ADD CONSTRAINT `TagRelation_createBy_fkey` FOREIGN KEY (`createBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostBillingRule` ADD CONSTRAINT `CostBillingRule_aiPlatformId_fkey` FOREIGN KEY (`aiPlatformId`) REFERENCES `AIPlatform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RealtimeAlert` ADD CONSTRAINT `RealtimeAlert_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RealtimeAlert` ADD CONSTRAINT `RealtimeAlert_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `ChatRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RealtimeAlert` ADD CONSTRAINT `RealtimeAlert_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RealtimeAlert` ADD CONSTRAINT `RealtimeAlert_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RealtimeAlert` ADD CONSTRAINT `RealtimeAlert_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserRoles` ADD CONSTRAINT `_UserRoles_A_fkey` FOREIGN KEY (`A`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserRoles` ADD CONSTRAINT `_UserRoles_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RolePermissions` ADD CONSTRAINT `_RolePermissions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RolePermissions` ADD CONSTRAINT `_RolePermissions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- New Feature Tables
-- ----------------------------

-- 高频问题标签库
CREATE TABLE `QuestionTag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) DEFAULT '#64748b',
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 高频问题记录
CREATE TABLE `HighFreqQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `productId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `tagId` VARCHAR(191) NULL,
    `statDate` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 询单流失规则
CREATE TABLE `LossRule` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `waitMinutes` INTEGER NOT NULL DEFAULT 120, -- 咨询后多久未下单判定为流失
    `platformId` VARCHAR(191) NOT NULL,
    `deptId` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NULL,
    `minCustomerMessages` INTEGER NOT NULL DEFAULT 1,
    `replyTimeoutMinutes` INTEGER NULL,
    `orderWindowMinutes` INTEGER NULL,
    `remark` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    INDEX `LossRule_platformId_deptId_shopId_status_idx`(`platformId`, `deptId`, `shopId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 询单流失记录
CREATE TABLE `LossAnalysis` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `platformId` VARCHAR(191) NULL,
    `deptId` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NULL,
    `interfaceId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `reason` TEXT NULL, -- AI总结的流失可能原因
    `isLost` BOOLEAN NOT NULL DEFAULT true,
    `lastSenderType` VARCHAR(50) NULL,
    `customerMessageCount` INTEGER NOT NULL DEFAULT 0,
    `agentMessageCount` INTEGER NOT NULL DEFAULT 0,
    `sessionDurationMinutes` INTEGER NOT NULL DEFAULT 0,
    `inactiveMinutes` INTEGER NOT NULL DEFAULT 0,
    `waitMinutes` INTEGER NOT NULL DEFAULT 120,
    `confidence` DOUBLE NULL,
    `analyzeVersion` VARCHAR(50) NOT NULL DEFAULT 'v1',
    `followUpStatus` INTEGER NOT NULL DEFAULT 0,
    `followUpRemark` TEXT NULL,
    `followUpBy` VARCHAR(191) NULL,
    `followUpTime` DATETIME(3) NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    INDEX `LossAnalysis_platformId_deptId_createTime_idx`(`platformId`, `deptId`, `createTime`),
    INDEX `LossAnalysis_isLost_createTime_idx`(`isLost`, `createTime`),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `Loss_sessionId_key`(`sessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 知识库文件
CREATE TABLE `KnowledgeBase` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(50) NOT NULL,
    `fileHash` VARCHAR(64) NOT NULL,
    `deptId` VARCHAR(191) NULL,
    `vectorId` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `errorMessage` TEXT NULL,
    `createBy` VARCHAR(191) NOT NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `KnowledgeBase_deptId_idx`(`deptId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AI 自动发现的待审核标签
CREATE TABLE `TagAudit` (
    `id` VARCHAR(191) NOT NULL,
    `tagName` VARCHAR(191) NOT NULL,
    `tagType` VARCHAR(191) NOT NULL DEFAULT '业务类',
    `reason` TEXT NOT NULL, -- 为什么 AI 建议增加这个标签 (支撑证据)
    `status` INTEGER NOT NULL DEFAULT 0, -- 0: Pending, 1: Approved, 2: Rejected
    `deptId` VARCHAR(191) NULL,
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HighFreqQuestion` ADD CONSTRAINT `HighFreqQuestion_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `QuestionTag`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossRule` ADD CONSTRAINT `LossRule_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossRule` ADD CONSTRAINT `LossRule_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossRule` ADD CONSTRAINT `LossRule_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossAnalysis` ADD CONSTRAINT `LossAnalysis_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossAnalysis` ADD CONSTRAINT `LossAnalysis_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossAnalysis` ADD CONSTRAINT `LossAnalysis_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossAnalysis` ADD CONSTRAINT `LossAnalysis_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossAnalysis` ADD CONSTRAINT `LossAnalysis_interfaceId_fkey` FOREIGN KEY (`interfaceId`) REFERENCES `AdapterInterface`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LossAnalysis` ADD CONSTRAINT `LossAnalysis_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KnowledgeBase` ADD CONSTRAINT `KnowledgeBase_createBy_fkey` FOREIGN KEY (`createBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KnowledgeBase` ADD CONSTRAINT `KnowledgeBase_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Data Initialization
-- ----------------------------

-- 1. 初始化基础权限数据
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
(UUID(), '标签查看', 'tag:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '标签管理', 'tag:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '标签审核', 'tag:audit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '敏感词查看', 'keyword:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '敏感词管理', 'keyword:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '聊天查看', 'chat:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '质检查看', 'quality:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '质检处理', 'quality:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '成本查看', 'cost:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '成本配置', 'cost:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '系统设置', 'settings:view', 'MENU', 1, NOW(), NOW()),
(UUID(), 'AI配置查看', 'ai-config:view', 'MENU', 1, NOW(), NOW()),
(UUID(), 'AI配置管理', 'ai-config:edit', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '敏感词记录', 'violation:record', 'MENU', 1, NOW(), NOW()),
(UUID(), '高频问题分析', 'insight:question', 'MENU', 1, NOW(), NOW()),
(UUID(), '询单流失分析', 'insight:loss', 'MENU', 1, NOW(), NOW()),
(UUID(), '流失规则配置', 'settings:loss_rule', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '知识库管理', 'knowledge:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '知识库上传', 'knowledge:upload', 'BUTTON', 1, NOW(), NOW()),
(UUID(), '日志查看', 'log:view', 'MENU', 1, NOW(), NOW()),
(UUID(), '文件上传', 'file:upload', 'BUTTON', 1, NOW(), NOW());

-- 2. 初始化超级管理员角色
INSERT IGNORE INTO `Role` (`id`, `name`, `description`, `isSystem`, `status`, `createTime`, `updateTime`)
VALUES ('admin-role-id', 'SUPER_ADMIN', '系统超级管理员', 1, 1, NOW(), NOW());

-- 3. 将所有权限同步给超级管理员
INSERT IGNORE INTO `_RolePermissions` (`A`, `B`)
SELECT `id`, 'admin-role-id'
FROM `Permission`
WHERE `code` IN (
    'dashboard:view',
    'org:view',
    'org:edit',
    'adapter:view',
    'adapter:edit',
    'user:view',
    'user:edit',
    'role:view',
    'role:edit',
    'tag:view',
    'tag:edit',
    'tag:audit',
    'keyword:view',
    'keyword:edit',
    'chat:view',
    'quality:view',
    'quality:edit',
    'cost:view',
    'cost:edit',
    'settings:view',
    'ai-config:view',
    'ai-config:edit',
    'violation:record',
    'insight:question',
    'insight:loss',
    'settings:loss_rule',
    'knowledge:view',
    'knowledge:upload',
    'log:view',
    'file:upload'
);
