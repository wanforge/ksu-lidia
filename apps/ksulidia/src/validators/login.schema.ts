import { z } from "zod";

// Form zod validation schema
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean().optional(),
});

// Generate form types from zod validation schema
export type LoginSchema = z.infer<typeof loginSchema>;
