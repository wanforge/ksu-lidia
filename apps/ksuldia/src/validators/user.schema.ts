import { z } from "zod";
import { UserRole } from "@prisma/client";

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(128, "Password terlalu panjang.");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama user wajib diisi."),
  email: z.string().trim().email("Email tidak valid.").toLowerCase(),
  password: passwordSchema,
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = z.object({
  userId: z.string().trim().min(1, "User wajib dipilih."),
  name: z.string().trim().min(2, "Nama user wajib diisi."),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
});

export const deleteUserSchema = z.object({
  userId: z.string().trim().min(1, "User wajib dipilih."),
});

export const resetUserPasswordSchema = z.object({
  userId: z.string().trim().min(1, "User wajib dipilih."),
  password: passwordSchema,
});

export const issuePasswordResetLinkSchema = z.object({
  userId: z.string().trim().min(1, "User wajib dipilih."),
  ttlHours: z.coerce
    .number()
    .int("TTL harus berupa jam.")
    .min(1, "TTL minimal 1 jam.")
    .max(168, "TTL maksimal 168 jam."),
});

export const consumePasswordResetTokenSchema = z
  .object({
    token: z.string().trim().min(16, "Token reset tidak valid."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });
