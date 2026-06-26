"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  encryptCredential,
  generateCredentialSalt,
} from "@/lib/credential-crypto";
import { recordAuditLog } from "@/lib/audit";
import { AuditAction, AttachmentSource } from "@prisma/client";
import { routes } from "@/config/routes";

const credentialSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  category: z.string().min(1).max(50),
  loginUrl: z
    .string()
    .url("URL tidak valid")
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "URL harus menggunakan protokol http atau https")
    .or(z.literal(""))
    .optional(),
  username: z.string().max(200).optional(),
  password: z.string().min(1, "Password wajib diisi"),
  notes: z.string().max(1000).optional(),
});

export type VaultActionState = {
  error?: string;
  success?: string;
};

async function ensureUserSalt(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credentialSalt: true },
  });
  if (user?.credentialSalt) return user.credentialSalt;

  const salt = generateCredentialSalt();
  await prisma.user.update({
    where: { id: userId },
    data: { credentialSalt: salt },
  });
  return salt;
}

export async function createCredentialAction(
  _prev: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Sesi tidak valid." };

  const raw = {
    name: formData.get("name"),
    category: formData.get("category") ?? "lainnya",
    loginUrl: formData.get("loginUrl") ?? "",
    username: formData.get("username") ?? "",
    password: formData.get("password"),
    notes: formData.get("notes") ?? "",
  };

  const parsed = credentialSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Input tidak valid." };
  }

  const { name, category, loginUrl, username, password, notes } = parsed.data;
  const userId = session.user.id;

  const salt = await ensureUserSalt(userId);
  const passwordEnc = encryptCredential(password, userId, salt);
  const notesEnc = notes ? encryptCredential(notes, userId, salt) : null;

  await prisma.accountCredential.create({
    data: {
      userId,
      name,
      category,
      loginUrl: loginUrl || null,
      username: username || null,
      passwordEnc,
      notesEnc,
    },
  });

  await recordAuditLog(prisma, {
    actorId: userId,
    actorRole: session.user.role,
    action: AuditAction.CREATE,
    entityType: "AccountCredential",
    entityId: userId,
    source: AttachmentSource.BACK_OFFICE,
    summary: `Menambah akun aplikasi: ${name}`,
  });

  revalidatePath(routes.me.vault);
  return { success: "Akun berhasil disimpan." };
}

export async function updateCredentialAction(
  _prev: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Sesi tidak valid." };

  const credentialId = formData.get("credentialId") as string;
  if (!credentialId) return { error: "ID akun tidak ditemukan." };

  const existing = await prisma.accountCredential.findFirst({
    where: { id: credentialId, userId: session.user.id, deletedAt: null },
  });
  if (!existing) return { error: "Akun tidak ditemukan." };

  const raw = {
    name: formData.get("name"),
    category: formData.get("category") ?? "lainnya",
    loginUrl: formData.get("loginUrl") ?? "",
    username: formData.get("username") ?? "",
    password: formData.get("password"),
    notes: formData.get("notes") ?? "",
  };

  const parsed = credentialSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Input tidak valid." };
  }

  const { name, category, loginUrl, username, password, notes } = parsed.data;
  const userId = session.user.id;

  const salt = await ensureUserSalt(userId);
  const passwordEnc = encryptCredential(password, userId, salt);
  const notesEnc = notes ? encryptCredential(notes, userId, salt) : null;

  await prisma.accountCredential.update({
    where: { id: credentialId },
    data: {
      name,
      category,
      loginUrl: loginUrl || null,
      username: username || null,
      passwordEnc,
      notesEnc,
    },
  });

  await recordAuditLog(prisma, {
    actorId: userId,
    actorRole: session.user.role,
    action: AuditAction.UPDATE,
    entityType: "AccountCredential",
    entityId: credentialId,
    source: AttachmentSource.BACK_OFFICE,
    summary: `Mengubah akun aplikasi: ${name}`,
  });

  revalidatePath(routes.me.vault);
  return { success: "Akun berhasil diperbarui." };
}

export async function deleteCredentialAction(
  _prev: VaultActionState,
  formData: FormData
): Promise<VaultActionState> {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Sesi tidak valid." };

  const credentialId = formData.get("credentialId") as string;
  if (!credentialId) return { error: "ID akun tidak ditemukan." };

  const existing = await prisma.accountCredential.findFirst({
    where: { id: credentialId, userId: session.user.id, deletedAt: null },
  });
  if (!existing) return { error: "Akun tidak ditemukan." };

  await prisma.accountCredential.update({
    where: { id: credentialId },
    data: { deletedAt: new Date() },
  });

  await recordAuditLog(prisma, {
    actorId: session.user.id,
    actorRole: session.user.role,
    action: AuditAction.DELETE,
    entityType: "AccountCredential",
    entityId: credentialId,
    source: AttachmentSource.BACK_OFFICE,
    summary: `Menghapus akun aplikasi: ${existing.name}`,
  });

  revalidatePath(routes.me.vault);
  return { success: "Akun berhasil dihapus." };
}
