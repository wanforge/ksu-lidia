/**
 * Shared helpers for list pages: column sorting (?sort/?dir) and a date-range
 * filter (?from/?to) → Prisma where clause. Pure functions, server-safe.
 */

export type SortDir = "asc" | "desc";

/**
 * Validate a `sort`/`dir` pair against an allow-list. Falls back to a default
 * field/direction when the params are missing or invalid (prevents arbitrary
 * orderBy injection from the URL).
 */
export function parseSort<T extends string>(
  rawSort: string | undefined,
  rawDir: string | undefined,
  allowed: readonly T[],
  fallbackField: T,
  fallbackDir: SortDir = "desc"
): { field: T; dir: SortDir } {
  const field = (allowed as readonly string[]).includes(rawSort ?? "")
    ? (rawSort as T)
    : fallbackField;
  const dir: SortDir =
    rawDir === "asc" || rawDir === "desc" ? rawDir : fallbackDir;
  return { field, dir };
}

/**
 * Build a `{ gte, lte }` range from `from`/`to` (YYYY-MM-DD) for a date column.
 * `to` is inclusive to end-of-day. Returns undefined when neither is set.
 */
export function dateRangeWhere(
  from: string | undefined,
  to: string | undefined
): { gte?: Date; lte?: Date } | undefined {
  const out: { gte?: Date; lte?: Date } = {};

  if (from?.trim()) {
    const gte = new Date(`${from.trim()}T00:00:00`);
    if (!Number.isNaN(gte.getTime())) out.gte = gte;
  }
  if (to?.trim()) {
    const lte = new Date(`${to.trim()}T23:59:59.999`);
    if (!Number.isNaN(lte.getTime())) out.lte = lte;
  }

  return out.gte || out.lte ? out : undefined;
}
