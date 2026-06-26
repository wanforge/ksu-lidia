-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'OPERATOR', 'VERIFIER', 'VIEWER', 'EMPLOYEE') NOT NULL DEFAULT 'OPERATOR',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NULL,
    `passwordChangedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `credentialSalt` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `issuedById` VARCHAR(191) NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_tokenHash_key`(`tokenHash`),
    INDEX `password_reset_tokens_userId_idx`(`userId`),
    INDEX `password_reset_tokens_issuedById_idx`(`issuedById`),
    INDEX `password_reset_tokens_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `actorRole` ENUM('ADMIN', 'OPERATOR', 'VERIFIER', 'VIEWER', 'EMPLOYEE') NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'UPLOAD', 'DOWNLOAD', 'EXPORT', 'VERIFY', 'REJECT', 'REQUEST_REVISION', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET_ISSUED', 'PASSWORD_RESET_USED', 'PASSWORD_CHANGED') NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `correlationId` VARCHAR(191) NULL,
    `source` ENUM('BACK_OFFICE', 'EMPLOYEE_PORTAL') NULL,
    `summary` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_actorId_idx`(`actorId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_correlationId_idx`(`correlationId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `data_change_logs` (
    `id` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `table` VARCHAR(191) NULL,
    `operation` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NULL,
    `rowCount` INTEGER NULL,
    `actorId` VARCHAR(191) NULL,
    `actorRole` VARCHAR(191) NULL,
    `correlationId` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `diff` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `data_change_logs_model_idx`(`model`),
    INDEX `data_change_logs_recordId_idx`(`recordId`),
    INDEX `data_change_logs_actorId_idx`(`actorId`),
    INDEX `data_change_logs_correlationId_idx`(`correlationId`),
    INDEX `data_change_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_credentials` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'lainnya',
    `loginUrl` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `passwordEnc` TEXT NOT NULL,
    `notesEnc` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `account_credentials_userId_idx`(`userId`),
    INDEX `account_credentials_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_issuedById_fkey` FOREIGN KEY (`issuedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account_credentials` ADD CONSTRAINT `account_credentials_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
