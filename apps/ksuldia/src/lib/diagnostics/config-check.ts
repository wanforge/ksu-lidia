import path from "node:path";
import fs from "node:fs";
import { appConfig, supportEmail } from "@/config/app";

export type CheckStatus = "ok" | "warn" | "error" | "info";

export type ConfigCheck = {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
  group: string;
};

const has = (key: string): boolean => {
  const v = process.env[key];
  return typeof v === "string" && v.trim().length > 0;
};

const val = (key: string): string => process.env[key]?.trim() ?? "";

export function runConfigChecks(): ConfigCheck[] {
  const checks: ConfigCheck[] = [];

  // ── Database ─────────────────────────────────────────────────────────────
  checks.push({
    key: "DATABASE_URL",
    label: "Koneksi Database",
    group: "Database",
    status: has("DATABASE_URL") ? "ok" : "error",
    detail: has("DATABASE_URL")
      ? "DATABASE_URL terpasang."
      : "DATABASE_URL belum diatur — aplikasi tidak bisa konek database.",
  });

  // ── Autentikasi ───────────────────────────────────────────────────────────
  checks.push({
    key: "NEXTAUTH_SECRET",
    label: "Kunci Sesi (NEXTAUTH_SECRET)",
    group: "Autentikasi",
    status: has("NEXTAUTH_SECRET") ? "ok" : "error",
    detail: has("NEXTAUTH_SECRET")
      ? "NEXTAUTH_SECRET terpasang."
      : "NEXTAUTH_SECRET belum diatur — sesi login tidak aman.",
  });

  checks.push({
    key: "NEXTAUTH_URL",
    label: "Base URL (NEXTAUTH_URL)",
    group: "Autentikasi",
    status: has("NEXTAUTH_URL") ? "ok" : "warn",
    detail: has("NEXTAUTH_URL")
      ? `${val("NEXTAUTH_URL")}`
      : "Belum diatur — wajib di produksi.",
  });

  // ── Penyimpanan ───────────────────────────────────────────────────────────
  const disk = val("FILESYSTEM_DISK") || "local";
  if (disk === "s3") {
    const keyOk = has("AWS_ACCESS_KEY_ID");
    const secretOk = has("AWS_SECRET_ACCESS_KEY");
    const bucketOk = has("AWS_BUCKET");
    const allOk = keyOk && secretOk && bucketOk;
    checks.push({
      key: "FILESYSTEM_DISK",
      label: "Penyimpanan (S3/Object Storage)",
      group: "Penyimpanan",
      status: allOk ? "ok" : "error",
      detail: allOk
        ? `Bucket: ${val("AWS_BUCKET")} · Region: ${val("AWS_DEFAULT_REGION") || "us-east-1"}${val("AWS_ENDPOINT") ? ` · Endpoint: ${val("AWS_ENDPOINT")}` : ""}`
        : `Konfigurasi S3 tidak lengkap: ${[!keyOk && "AWS_ACCESS_KEY_ID", !secretOk && "AWS_SECRET_ACCESS_KEY", !bucketOk && "AWS_BUCKET"].filter(Boolean).join(", ")} belum diatur.`,
    });
    checks.push({
      key: "AWS_USE_PATH_STYLE_ENDPOINT",
      label: "Path-style Endpoint",
      group: "Penyimpanan",
      status: "info",
      detail:
        val("AWS_USE_PATH_STYLE_ENDPOINT") === "true"
          ? "Aktif (MinIO/rustfs)."
          : "Tidak aktif (default AWS).",
    });
  } else {
    const storagePath = path.resolve("storage");
    const storageExists = fs.existsSync(storagePath);
    checks.push({
      key: "FILESYSTEM_DISK",
      label: "Penyimpanan (Lokal)",
      group: "Penyimpanan",
      status: storageExists ? "ok" : "warn",
      detail: storageExists
        ? `Direktori ./storage ditemukan (${storagePath}).`
        : `Direktori ./storage belum ada — akan dibuat saat file pertama diupload.`,
    });
  }

  // ── Branding / Instansi ───────────────────────────────────────────────────
  checks.push({
    key: "NEXT_PUBLIC_APP_NAME",
    label: "Nama Aplikasi",
    group: "Identitas Instansi",
    status: "info",
    detail: appConfig.name,
  });

  checks.push({
    key: "NEXT_PUBLIC_ORG_NAME",
    label: "Nama Instansi",
    group: "Identitas Instansi",
    status: appConfig.orgName ? "ok" : "warn",
    detail: appConfig.orgName
      ? appConfig.orgName
      : "Belum diatur — memakai default netral.",
  });

  checks.push({
    key: "NEXT_PUBLIC_ORG_EMAIL_DOMAIN",
    label: "Domain Email",
    group: "Identitas Instansi",
    status: "info",
    detail: appConfig.emailDomain,
  });

  checks.push({
    key: "SUPPORT_EMAIL",
    label: "Email Dukungan",
    group: "Identitas Instansi",
    status: "info",
    detail: supportEmail,
  });

  // ── Waktu & Locale ────────────────────────────────────────────────────────
  let tzValid = true;
  try {
    Intl.DateTimeFormat("id-ID", { timeZone: appConfig.timezone });
  } catch {
    tzValid = false;
  }

  checks.push({
    key: "NEXT_PUBLIC_APP_TIMEZONE",
    label: "Zona Waktu Aplikasi",
    group: "Waktu & Locale",
    status: tzValid ? "ok" : "error",
    detail: tzValid
      ? appConfig.timezone
      : `"${appConfig.timezone}" tidak valid — periksa nilai NEXT_PUBLIC_APP_TIMEZONE.`,
  });

  checks.push({
    key: "NEXT_PUBLIC_APP_LOCALE",
    label: "Locale",
    group: "Waktu & Locale",
    status: "info",
    detail: appConfig.locale,
  });

  checks.push({
    key: "NTP_SERVER",
    label: "NTP Server",
    group: "Waktu & Locale",
    status: "info",
    detail: val("NTP_SERVER") || "id.pool.ntp.org (default)",
  });

  // ── Runtime ───────────────────────────────────────────────────────────────
  const nodeEnv = val("NODE_ENV") || "tidak diatur";
  checks.push({
    key: "NODE_ENV",
    label: "NODE_ENV",
    group: "Runtime",
    status:
      nodeEnv === "production"
        ? "ok"
        : nodeEnv === "development"
          ? "info"
          : "warn",
    detail: nodeEnv,
  });

  checks.push({
    key: "NODE_VERSION",
    label: "Versi Node.js",
    group: "Runtime",
    status: "info",
    detail: process.version,
  });

  // ── Seed / Development ────────────────────────────────────────────────────
  const seedCount = val("SEED_EMPLOYEE_COUNT") || "2000 (default)";
  const seedPreset = val("SEED_DOC_PRESET") || "medis (default)";
  checks.push({
    key: "SEED_EMPLOYEE_COUNT",
    label: "Jumlah Pegawai Seed",
    group: "Seed & Development",
    status: "info",
    detail: `${seedCount} pegawai · preset dokumen: ${seedPreset}`,
  });

  checks.push({
    key: "SEED_ADMIN_EMAIL",
    label: "Admin Seed",
    group: "Seed & Development",
    status: "info",
    detail: has("SEED_ADMIN_EMAIL")
      ? `${val("SEED_ADMIN_EMAIL")} (kustom)`
      : `admin@${appConfig.emailDomain} (default)`,
  });

  return checks;
}
