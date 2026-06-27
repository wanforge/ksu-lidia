import {
  DEFAULT_AUDIT_RETENTION_DAYS,
  pruneAuditLogs,
} from "../src/lib/audit-retention";

async function main() {
  const arg = process.argv[2];
  const retentionDays = arg
    ? Number.parseInt(arg, 10)
    : DEFAULT_AUDIT_RETENTION_DAYS;

  if (!Number.isFinite(retentionDays) || retentionDays < 1) {
    console.error("Usage: pnpm audit:prune [retentionDays>=1]");
    process.exit(1);
  }

  const deleted = await pruneAuditLogs(retentionDays);
  console.log(
    `Pruned ${deleted} audit log entries older than ${retentionDays} days.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to prune audit logs:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
