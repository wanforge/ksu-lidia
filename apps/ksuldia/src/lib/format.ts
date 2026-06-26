import { appConfig } from "@/config/app";

/**
 * Locale-aware number formatting with a thousand separator (id-ID → "1.234").
 * Use for EVERY number shown in the UI (counts, totals, sizes, etc.).
 */
export function formatNumber(
  value: number | bigint | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat(appConfig.locale, options).format(value);
}

/**
 * Title-case a human-readable label for display in dropdowns and badges.
 * Words that are already ALL-UPPERCASE (acronyms/codes like NIP, PNS, STR)
 * are left untouched; everything else gets its first letter capitalised.
 * Underscores and multiple spaces are normalised to single spaces first, so
 * "nomor_ijazah" → "Nomor Ijazah" and "PNS aktif" → "PNS Aktif".
 */
export function ucwords(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      word.length > 1 && word === word.toUpperCase()
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}
