import { prisma } from "./prisma";

export const DEFAULT_AUDIT_RETENTION_DAYS = 365;

/**
 * Compute the cutoff date: audit entries created before this are prunable.
 * Pure function so the retention boundary can be unit tested.
 */
export function getAuditCutoffDate(now: Date, retentionDays: number): Date {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff;
}

/**
 * Delete audit logs older than the retention window. Returns the number of
 * deleted rows. Intended to be run from a scheduled job (cron) or manually
 * via `pnpm audit:prune`.
 */
export async function pruneAuditLogs(
  retentionDays = DEFAULT_AUDIT_RETENTION_DAYS,
  now = new Date()
): Promise<number> {
  const cutoff = getAuditCutoffDate(now, retentionDays);
  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return result.count;
}
