/**
 * Konfigurasi environment CLIENT (publik) yang tervalidasi.
 *
 * PENTING: Next.js hanya meng-inline `process.env.NEXT_PUBLIC_*` bila dirujuk
 * SECARA LITERAL (analisis statik). Karena itu setiap variabel ditulis eksplisit
 * di bawah — JANGAN mem-parse `process.env` secara dinamis untuk var client.
 *
 * Aman diimpor dari komponen client maupun server (hanya berisi nilai publik).
 * Untuk branding (`NEXT_PUBLIC_APP_*`, `NEXT_PUBLIC_ORG_*`) lihat `config/app.ts`.
 */
import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;
const optStr = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional()
);

const schema = z.object({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: optStr,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optStr,
});

export const clientEnv = schema.parse({
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});
