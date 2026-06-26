import assert from "node:assert/strict";
import { test } from "node:test";
import { getAuditCutoffDate } from "../src/lib/audit-retention";

test("getAuditCutoffDate subtracts the retention window", () => {
  const now = new Date("2026-05-29T00:00:00.000Z");
  const cutoff = getAuditCutoffDate(now, 30);
  assert.equal(cutoff.toISOString(), "2026-04-29T00:00:00.000Z");
});

test("getAuditCutoffDate handles a one-year window", () => {
  const now = new Date("2026-05-29T00:00:00.000Z");
  const cutoff = getAuditCutoffDate(now, 365);
  assert.equal(cutoff.toISOString(), "2025-05-29T00:00:00.000Z");
});

test("getAuditCutoffDate does not mutate the input date", () => {
  const now = new Date("2026-05-29T00:00:00.000Z");
  getAuditCutoffDate(now, 10);
  assert.equal(now.toISOString(), "2026-05-29T00:00:00.000Z");
});
