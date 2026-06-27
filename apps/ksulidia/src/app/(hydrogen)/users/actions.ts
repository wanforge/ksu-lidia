"use server";
import { getSession } from "@/lib/auth";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { Prisma, UserRole } from "@prisma/client";
import { ensureAuditContext } from "@/lib/audit-context";
import { appBaseUrl } from "@/config/env";
import { routes } from "@/config/routes";
import {
  createUserByAdmin,
  issuePasswordResetTokenByAdmin,
  resetUserPasswordByAdmin,
  restoreUserByAdmin,
  softDeleteUserByAdmin,
  updateUserByAdmin,
} from "@/lib/admin-user-lifecycle";
import {
  createUserSchema,
  deleteUserSchema,
  issuePasswordResetLinkSchema,
  resetUserPasswordSchema,
  updateUserSchema,
} from "@/validators/user.schema";

const lifecycleErrorMessages: Record<string, string> = {
  LAST_ADMIN: "Tidak bisa menonaktifkan/menghapus admin aktif terakhir.",
  CANNOT_DEMOTE_SELF:
    "Anda tidak bisa menurunkan role atau menonaktifkan akun sendiri.",
  CANNOT_DELETE_SELF: "Anda tidak bisa menghapus akun sendiri.",
  USER_NOT_FOUND: "User tidak ditemukan.",
  // Thrown when the session user ID no longer exists in the DB (e.g. after a
  // DB reset). Prompt a fresh login rather than showing a generic error.
  ADMIN_REQUIRED:
    "Sesi tidak valid atau hak akses berubah. Silakan sign out lalu sign in ulang.",
};

function lifecycleError(error: unknown, fallback: string): string {
  if (error instanceof Error && lifecycleErrorMessages[error.message]) {
    return lifecycleErrorMessages[error.message];
  }
  return fallback;
}

import type { UserActionState } from "./action-state";
export type { UserActionState };

function requireAdminSession(sessionUser?: { id: string; role: string }) {
  if (!sessionUser || sessionUser.role !== UserRole.ADMIN) {
    throw new Error("ADMIN_REQUIRED");
  }
}

function createUserFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };
}

function resetPasswordFormData(formData: FormData) {
  return {
    userId: formData.get("userId"),
    password: formData.get("password"),
  };
}

function issueLinkFormData(formData: FormData) {
  return {
    userId: formData.get("userId"),
    ttlHours: formData.get("ttlHours") ?? 24,
  };
}

export async function createUserAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  try {
    requireAdminSession(session?.user);
  } catch {
    return {
      success: false,
      message: "Hanya admin yang bisa membuat user.",
    };
  }

  const parsed = createUserSchema.safeParse(createUserFormData(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali isian user.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createUserByAdmin(
      {
        ...parsed.data,
      },
      session!.user.id
    );

    revalidatePath(routes.users.list);

    return {
      success: true,
      message: "User berhasil dibuat.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Email sudah terdaftar untuk user lain.",
      };
    }

    return {
      success: false,
      message: lifecycleError(error, "Gagal membuat user. Silakan coba lagi."),
    };
  }
}

export async function resetUserPasswordAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  try {
    requireAdminSession(session?.user);
  } catch {
    return {
      success: false,
      message: "Hanya admin yang bisa reset password.",
    };
  }

  const parsed = resetUserPasswordSchema.safeParse(
    resetPasswordFormData(formData)
  );

  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali password baru.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await resetUserPasswordByAdmin(
      parsed.data.userId,
      parsed.data.password,
      session!.user.id
    );

    revalidatePath(routes.users.list);

    return {
      success: true,
      message: "Password user berhasil diganti.",
    };
  } catch {
    return {
      success: false,
      message: "Gagal reset password. Pastikan user masih tersedia.",
    };
  }
}

export async function issuePasswordResetLinkAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  try {
    requireAdminSession(session?.user);
  } catch {
    return {
      success: false,
      message: "Hanya admin yang bisa menerbitkan link reset.",
    };
  }

  const parsed = issuePasswordResetLinkSchema.safeParse(
    issueLinkFormData(formData)
  );

  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali masa berlaku link.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const issued = await issuePasswordResetTokenByAdmin(
      parsed.data.userId,
      session!.user.id,
      parsed.data.ttlHours
    );

    revalidatePath(routes.users.list);

    return {
      success: true,
      message: "Link reset sekali pakai berhasil dibuat.",
      resetLink: `${appBaseUrl}/reset-password/${issued.token}`,
      expiresAt: issued.expiresAt.toISOString(),
    };
  } catch {
    return {
      success: false,
      message: "Gagal menerbitkan link reset. Pastikan user masih tersedia.",
    };
  }
}

function updateUserFormData(formData: FormData) {
  return {
    userId: formData.get("userId"),
    name: formData.get("name"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
  };
}

export async function updateUserAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  try {
    requireAdminSession(session?.user);
  } catch {
    return { success: false, message: "Hanya admin yang bisa mengubah user." };
  }

  const parsed = updateUserSchema.safeParse(updateUserFormData(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali isian user.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateUserByAdmin(
      parsed.data.userId,
      {
        name: parsed.data.name,
        role: parsed.data.role,
        isActive: parsed.data.isActive,
      },
      session!.user.id
    );

    revalidatePath(routes.users.list);

    return { success: true, message: "User berhasil diperbarui." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Email sudah terdaftar untuk user lain.",
      };
    }

    return {
      success: false,
      message: lifecycleError(error, "Gagal memperbarui user."),
    };
  }
}

export async function deleteUserAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  try {
    requireAdminSession(session?.user);
  } catch {
    return { success: false, message: "Hanya admin yang bisa menghapus user." };
  }

  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) {
    return { success: false, message: "User wajib dipilih." };
  }

  try {
    await softDeleteUserByAdmin(parsed.data.userId, session!.user.id);

    revalidatePath(routes.users.list);

    return { success: true, message: "User berhasil dihapus (soft-delete)." };
  } catch (error) {
    return {
      success: false,
      message: lifecycleError(error, "Gagal menghapus user."),
    };
  }
}

export async function restoreUserAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  try {
    requireAdminSession(session?.user);
  } catch {
    return {
      success: false,
      message: "Hanya admin yang bisa memulihkan user.",
    };
  }

  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) {
    return { success: false, message: "User wajib dipilih." };
  }

  try {
    await restoreUserByAdmin(parsed.data.userId, session!.user.id);

    revalidatePath(routes.users.list);

    return { success: true, message: "User berhasil dipulihkan." };
  } catch (error) {
    return {
      success: false,
      message: lifecycleError(error, "Gagal memulihkan user."),
    };
  }
}
