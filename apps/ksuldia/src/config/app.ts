/**
 * Central, zero-config application/branding configuration.
 *
 * Everything here is driven by `NEXT_PUBLIC_*` environment variables so the
 * same build can be deployed for any institution (instansi) without code
 * changes. With NO env set, sensible neutral defaults apply ("Persona", no
 * organisation name), so the app runs out of the box.
 *
 * Copyright Wanforge (wanforge.asia) — Sugeng Sulistiyawan.
 */

const env = (key: string): string | undefined => {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : undefined;
};

export const appConfig = {
  /** The software/product name. */
  name: env("NEXT_PUBLIC_APP_NAME") ?? "KSU Lidia",
  /** Full organisation name (e.g. "RSUD dr. Soedomo Trenggalek"). Empty = none. */
  orgName: env("NEXT_PUBLIC_ORG_NAME") ?? "",
  /** Short organisation name for tight spots (sidebar, banner). */
  orgShortName:
    env("NEXT_PUBLIC_ORG_SHORT_NAME") ?? env("NEXT_PUBLIC_ORG_NAME") ?? "",
  /** Email domain used for placeholders and the seeded admin account. */
  emailDomain: env("NEXT_PUBLIC_ORG_EMAIL_DOMAIN") ?? "instansi.go.id",
  /** Product tagline / description. */
  tagline:
    env("NEXT_PUBLIC_APP_TAGLINE") ??
    "Sistem Informasi KSU Lidia",
  /** Copyright holder shown in footers and metadata. */
  copyrightHolder:
    env("NEXT_PUBLIC_COPYRIGHT_HOLDER") ??
    "Wanforge (wanforge.asia) — Sugeng Sulistiyawan",
  /** IANA timezone used for all date/time display. Default Asia/Jakarta (WIB). */
  timezone: env("NEXT_PUBLIC_APP_TIMEZONE") ?? env("TZ") ?? "Asia/Jakarta",
  /** BCP-47 locale for date/number formatting. */
  locale: env("NEXT_PUBLIC_APP_LOCALE") ?? "id-ID",
} as const;

/** Support contact email (placeholder + "contact IT" links). */
export const supportEmail =
  env("NEXT_PUBLIC_SUPPORT_EMAIL") ?? `it@${appConfig.emailDomain}`;

/** Email input placeholder, e.g. "nama@instansi.go.id". */
export const emailPlaceholder = `nama@${appConfig.emailDomain}`;

/** "Persona — RSUD ..." when an org is set, otherwise just "Persona". */
export const brandLine = appConfig.orgName
  ? `${appConfig.name} — ${appConfig.orgName}`
  : appConfig.name;

/** Short brand for the sidebar/banner subtitle. */
export const brandSubtitle = appConfig.orgShortName || appConfig.tagline;

/** Page title helper: "Masuk — Persona — RSUD ...". */
export function pageTitle(page: string): string {
  return `${page} — ${brandLine}`;
}

/** Default document/site title. */
export const defaultTitle = appConfig.orgName
  ? `${appConfig.name} — ${appConfig.tagline} ${appConfig.orgName}`
  : `${appConfig.name} — ${appConfig.tagline}`;

/** Default meta description. */
export const appDescription = appConfig.orgName
  ? `${appConfig.tagline} ${appConfig.orgName}.`
  : `${appConfig.tagline}.`;

/** Copyright line, e.g. "© 2026 Wanforge (wanforge.asia) — Sugeng Sulistiyawan". */
export function copyrightLine(year: number): string {
  return `© ${year} ${appConfig.copyrightHolder}`;
}
