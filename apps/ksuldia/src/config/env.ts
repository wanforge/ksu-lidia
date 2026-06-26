/**
 * Konfigurasi environment SERVER yang tervalidasi & dibaca sekali.
 *
 * - `import "server-only"`: modul ini TIDAK boleh masuk bundle client (berisi
 *   rahasia). Mengimpornya dari komponen client akan menggagalkan build.
 * - Di-parse SEKALI saat modul dimuat (singleton ESM = otomatis ter-cache).
 *   Komponen/lib mengimpor `env` dari sini, bukan membaca `process.env` mentah.
 * - Tidak pernah meng-crash build: tiap field punya default/coerce/`.catch`,
 *   sehingga `parse` selalu sukses. Kelengkapan "wajib di produksi" dilaporkan
 *   lewat `getServerEnvIssues()` (dipakai halaman diagnostics).
 *
 * Variabel publik (`NEXT_PUBLIC_*`) ada di `env.client.ts`, bukan di sini.
 */
import { z } from "zod";

// Guard: cegah modul ini ikut ter-bundle/terpakai di sisi client (berisi
// rahasia). Bila terimpor di browser, gagal keras agar ketahuan saat dev.
if (typeof window !== "undefined") {
  throw new Error(
    "config/env.ts hanya untuk server — jangan diimpor dari kode client. " +
      "Gunakan config/env.client.ts untuk variabel publik (NEXT_PUBLIC_*)."
  );
}

// Anggap string kosong/whitespace sebagai "tidak diset".
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optStr = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional()
);
const optUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional().catch(undefined)
);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).catch("development"),

  // Database & auth
  DATABASE_URL: optStr,
  NEXTAUTH_SECRET: optStr,
  NEXTAUTH_URL: optUrl,
  APP_PUBLIC_URL: optUrl,

  // Penyimpanan file
  FILESYSTEM_DISK: z.enum(["local", "s3"]).catch("local"),
  AWS_ACCESS_KEY_ID: optStr,
  AWS_SECRET_ACCESS_KEY: optStr,
  AWS_BUCKET: optStr,
  AWS_DEFAULT_REGION: optStr,
  AWS_REGION: optStr,
  AWS_ENDPOINT: optStr,
  AWS_USE_PATH_STYLE_ENDPOINT: z
    .preprocess((v) => String(v).toLowerCase() === "true", z.boolean())
    .catch(false),

  // CAPTCHA (server)
  RECAPTCHA_SECRET_KEY: optStr,
  TURNSTILE_SECRET_KEY: optStr,
  RECAPTCHA_SCORE_THRESHOLD: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1).catch(0.5).default(0.5)
  ),

  // Lain-lain
  NTP_SERVER: optStr,
});

export type ServerEnv = z.infer<typeof schema>;

/** Env server tervalidasi (dibaca sekali). Impor ini, jangan `process.env`. */
export const env: ServerEnv = schema.parse(process.env);

/** Base URL kanonik dari sumber server tepercaya — untuk membangun link absolut. */
export const appBaseUrl = (
  env.NEXTAUTH_URL ??
  env.APP_PUBLIC_URL ??
  ""
).replace(/\/+$/, "");

/**
 * Daftar masalah konfigurasi "wajib"/produksi (untuk halaman diagnostics atau
 * pengecekan startup). Kosong = sehat.
 */
export function getServerEnvIssues(): string[] {
  const issues: string[] = [];
  if (!env.DATABASE_URL) issues.push("DATABASE_URL belum diatur.");
  if (!env.NEXTAUTH_SECRET) issues.push("NEXTAUTH_SECRET belum diatur.");
  if (env.NODE_ENV === "production") {
    if (!appBaseUrl)
      issues.push("NEXTAUTH_URL atau APP_PUBLIC_URL wajib diatur di produksi.");
    if (
      env.FILESYSTEM_DISK === "s3" &&
      (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_BUCKET)
    ) {
      issues.push(
        "Kredensial S3 (AWS_ACCESS_KEY_ID/SECRET/BUCKET) belum lengkap."
      );
    }
  }
  return issues;
}
