/**
 * Personal-data display helpers. Sensitive identifiers like NIK (16-digit KTP
 * number) and NIP (18-digit civil-servant number) must not be shown in full by
 * default — only the first and last few digits. Full values are limited to
 * admins (via an audited reveal) and the data subject themselves on `/me`.
 */

/**
 * Mask an identifier to `3503••••••••1234` (first 4 + last 4 visible). Returns
 * "-" for empty values. Short/invalid values are fully masked to avoid leaks.
 */
function maskIdentifier(value: string | null | undefined): string {
  if (!value) return "-";
  const trimmed = value.trim();
  if (trimmed.length === 0) return "-";
  if (trimmed.length <= 8) return "•".repeat(trimmed.length || 4);
  return `${trimmed.slice(0, 4)}${"•".repeat(trimmed.length - 8)}${trimmed.slice(-4)}`;
}

/** Mask a NIK (16-digit KTP number). */
export function maskNik(nik: string | null | undefined): string {
  return maskIdentifier(nik);
}

/** Mask a NIP (18-digit civil-servant number). */
export function maskNip(nip: string | null | undefined): string {
  return maskIdentifier(nip);
}
