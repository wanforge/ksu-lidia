export const DEFAULT_PAGE_SIZE = 25;

/**
 * Parse a raw page query value into a 1-based page number. Invalid, zero, or
 * negative values fall back to page 1.
 */
export function parsePage(value: string | undefined | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

/** Total number of pages for a row count, never less than 1. */
export function getPageCount(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) {
    return 1;
  }
  return Math.ceil(total / pageSize);
}

/** Clamp a requested page into the valid [1, pageCount] range. */
export function clampPage(page: number, pageCount: number): number {
  if (page < 1) return 1;
  if (page > pageCount) return pageCount;
  return page;
}

/** Prisma `skip` offset for a clamped page. */
export function getSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
