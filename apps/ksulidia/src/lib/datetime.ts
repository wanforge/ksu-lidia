import { appConfig } from "@/config/app";

/**
 * Timezone-aware date/time formatting. All display uses the configured
 * institution timezone (default Asia/Jakarta) and locale (default id-ID), both
 * overridable via env — see src/config/app.ts.
 */

export function formatDateTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (date === null || date === undefined) return "-";
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "-";
  return new Intl.DateTimeFormat(appConfig.locale, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: appConfig.timezone,
    ...options,
  }).format(value);
}

export function formatDate(
  date: Date | string | number | null | undefined
): string {
  return formatDateTime(date, { dateStyle: "medium", timeStyle: undefined });
}

/** Current offset of the configured timezone, e.g. "GMT+7". */
export function timezoneAbbrev(): string {
  const parts = new Intl.DateTimeFormat(appConfig.locale, {
    timeZone: appConfig.timezone,
    timeZoneName: "short",
  }).formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}
