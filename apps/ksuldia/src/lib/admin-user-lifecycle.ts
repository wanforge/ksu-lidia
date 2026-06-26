import { createHash, randomBytes } from "crypto";
import {
  AttachmentSource,
  AuditAction,
  Prisma,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/password";
import {
  generateCredentialSalt,
  reEncryptUserCredentials,
} from "@/lib/credential-crypto";

const DEFAULT_RESET_TOKEN_TTL_HOURS = 24;

type CreateUserByAdminInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

async function assertAdmin(adminId: string): Promise<void> {
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { role: true, isActive: true, deletedAt: true },
  });

  if (
    !admin ||
    !admin.isActive ||
    admin.deletedAt ||
    admin.role !== UserRole.ADMIN
  ) {
    throw new Error("ADMIN_REQUIRED");
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserByAdmin(
  input: CreateUserByAdminInput,
  adminId: string
) {
  await assertAdmin(adminId);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: await hashPassword(input.password),
        role: input.role,
        createdById: adminId,
        passwordChangedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        source: AttachmentSource.BACK_OFFICE,
        action: AuditAction.CREATE,
        entityType: "User",
        entityId: user.id,
        summary: `Created user ${user.email}`,
      },
    });

    return user;
  });
}

type UpdateUserByAdminInput = {
  name: string;
  role: UserRole;
  isActive: boolean;
};

/** Count active, non-deleted admins other than the given user. */
async function countOtherActiveAdmins(
  client: Prisma.TransactionClient,
  userId: string
): Promise<number> {
  return client.user.count({
    where: {
      id: { not: userId },
      role: UserRole.ADMIN,
      isActive: true,
      deletedAt: null,
    },
  });
}

export async function updateUserByAdmin(
  userId: string,
  input: UpdateUserByAdminInput,
  adminId: string
) {
  await assertAdmin(adminId);

  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, role: true, email: true },
    });

    if (!target) {
      throw new Error("USER_NOT_FOUND");
    }

    const losingAdmin =
      target.role === UserRole.ADMIN &&
      (input.role !== UserRole.ADMIN || !input.isActive);

    // Never lock out the last administrator, and never let an admin demote or
    // deactivate their own account (which would lock themselves out).
    if (losingAdmin) {
      if (userId === adminId) {
        throw new Error("CANNOT_DEMOTE_SELF");
      }
      const otherAdmins = await countOtherActiveAdmins(tx, userId);
      if (otherAdmins === 0) {
        throw new Error("LAST_ADMIN");
      }
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        role: input.role,
        isActive: input.isActive,
      },
    });

    await recordAuditLog(tx, {
      actorId: adminId,
      actorRole: UserRole.ADMIN,
      action: AuditAction.UPDATE,
      entityType: "User",
      entityId: user.id,
      source: AttachmentSource.BACK_OFFICE,
      summary: `Updated user ${user.email}`,
      metadata: {
        role: input.role,
        isActive: input.isActive,
      },
    });

    return user;
  });
}

export async function softDeleteUserByAdmin(userId: string, adminId: string) {
  await assertAdmin(adminId);

  if (userId === adminId) {
    throw new Error("CANNOT_DELETE_SELF");
  }

  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, role: true, email: true },
    });

    if (!target) {
      throw new Error("USER_NOT_FOUND");
    }

    if (target.role === UserRole.ADMIN) {
      const otherAdmins = await countOtherActiveAdmins(tx, userId);
      if (otherAdmins === 0) {
        throw new Error("LAST_ADMIN");
      }
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });

    await tx.passwordResetToken.updateMany({
      where: { userId, usedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await recordAuditLog(tx, {
      actorId: adminId,
      actorRole: UserRole.ADMIN,
      action: AuditAction.DELETE,
      entityType: "User",
      entityId: user.id,
      source: AttachmentSource.BACK_OFFICE,
      summary: `Soft-deleted user ${user.email}`,
    });

    return user;
  });
}

/** Pulihkan user yang ter-soft-delete: kosongkan deletedAt, aktifkan kembali. */
export async function restoreUserByAdmin(userId: string, adminId: string) {
  await assertAdmin(adminId);

  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findFirst({
      where: { id: userId, deletedAt: { not: null } },
      select: { id: true, email: true },
    });

    if (!target) {
      throw new Error("USER_NOT_FOUND");
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: { deletedAt: null, isActive: true },
    });

    await recordAuditLog(tx, {
      actorId: adminId,
      actorRole: UserRole.ADMIN,
      action: AuditAction.RESTORE,
      entityType: "User",
      entityId: user.id,
      source: AttachmentSource.BACK_OFFICE,
      summary: `Restored user ${user.email}`,
    });

    return user;
  });
}

export async function resetUserPasswordByAdmin(
  userId: string,
  newPassword: string,
  adminId: string
) {
  await assertAdmin(adminId);

  return prisma.$transaction(async (tx) => {
    const current = await tx.user.findFirst({
      where: { id: userId },
      select: { credentialSalt: true, email: true },
    });

    const oldSalt = current?.credentialSalt ?? null;
    const newSalt = generateCredentialSalt();

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        password: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
        credentialSalt: newSalt,
      },
    });

    // Re-encrypt vault credentials with new derived key
    if (oldSalt) {
      await reEncryptUserCredentials(tx, userId, oldSalt, newSalt);
    }

    await tx.passwordResetToken.updateMany({
      where: { userId, usedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        source: AttachmentSource.BACK_OFFICE,
        action: AuditAction.PASSWORD_CHANGED,
        entityType: "User",
        entityId: user.id,
        summary: `Admin reset password for ${user.email}`,
      },
    });

    return user;
  });
}

export async function issuePasswordResetTokenByAdmin(
  userId: string,
  adminId: string,
  ttlHours = DEFAULT_RESET_TOKEN_TTL_HOURS
): Promise<{ token: string; expiresAt: Date }> {
  await assertAdmin(adminId);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await tx.passwordResetToken.create({
      data: {
        userId,
        issuedById: adminId,
        tokenHash: hashToken(token),
        expiresAt,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        source: AttachmentSource.BACK_OFFICE,
        action: AuditAction.PASSWORD_RESET_ISSUED,
        entityType: "User",
        entityId: userId,
        summary: "Issued one-time password reset token",
      },
    });
  });

  return { token, expiresAt };
}

export async function consumePasswordResetToken(
  token: string,
  newPassword: string
) {
  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          isActive: true,
          deletedAt: true,
          credentialSalt: true,
        },
      },
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.revokedAt ||
    resetToken.expiresAt <= new Date() ||
    !resetToken.user.isActive ||
    resetToken.user.deletedAt
  ) {
    throw new Error("INVALID_RESET_TOKEN");
  }

  return prisma.$transaction(async (tx) => {
    const oldSalt = resetToken.user.credentialSalt ?? null;
    const newSalt = generateCredentialSalt();

    const user = await tx.user.update({
      where: { id: resetToken.userId },
      data: {
        password: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
        credentialSalt: newSalt,
      },
    });

    if (oldSalt) {
      await reEncryptUserCredentials(tx, resetToken.userId, oldSalt, newSalt);
    }

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: AuditAction.PASSWORD_RESET_USED,
        entityType: "User",
        entityId: user.id,
        summary: "Used one-time password reset token",
      },
    });

    return user;
  });
}
