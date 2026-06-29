-- AlterTable
ALTER TABLE `loans` ADD COLUMN `crkRate` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    ADD COLUMN `penaltyRate` DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    ADD COLUMN `provisionRate` DECIMAL(5, 2) NOT NULL DEFAULT 100.00;

-- CreateTable
CREATE TABLE `app_settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `snapshots` (
    `id` VARCHAR(191) NOT NULL,
    `periodDate` DATETIME(3) NOT NULL,
    `snapshotType` VARCHAR(191) NOT NULL DEFAULT 'MONTHLY',
    `description` VARCHAR(191) NULL,
    `data` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,

    INDEX `snapshots_periodDate_idx`(`periodDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `entity` ENUM('KOPERASI', 'TOKO', 'SRI_NETHERLAND') NOT NULL,
    `type` ENUM('IN', 'OUT') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `description` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cash_transactions_date_idx`(`date`),
    INDEX `cash_transactions_entity_idx`(`entity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shu_distributions` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `shuSimpanan` DECIMAL(15, 2) NOT NULL,
    `shuPinjaman` DECIMAL(15, 2) NOT NULL,
    `totalShu` DECIMAL(15, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `shu_distributions_memberId_idx`(`memberId`),
    UNIQUE INDEX `shu_distributions_memberId_year_key`(`memberId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_reports` (
    `id` VARCHAR(191) NOT NULL,
    `periodDate` DATETIME(3) NOT NULL,
    `entity` ENUM('KSP', 'TOKO', 'KONSOLIDASI') NOT NULL,
    `reportType` ENUM('NERACA', 'RUGI_LABA', 'PAJAK') NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `financial_reports_periodDate_idx`(`periodDate`),
    INDEX `financial_reports_entity_idx`(`entity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shu_distributions` ADD CONSTRAINT `shu_distributions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
