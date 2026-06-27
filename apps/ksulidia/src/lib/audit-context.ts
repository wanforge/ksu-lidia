import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/**
 * Konteks aktor + correlationId per-aksi. Dipakai agar setiap baris DataChangeLog
 * (otomatis dari extension Prisma) dan AuditLog (via recordAuditLog) yang lahir
 * dari satu aksi server bisa direlasikan lewat correlationId yang sama, plus
 * mencatat siapa pelakunya.
 *
 * Dua cara memasang konteks:
 *  - `runWithAuditActor(actor, fn)` — membungkus callback (scoped, auto-bersih).
 *  - `ensureAuditContext(actor)`    — satu baris di awal action; memakai
 *    enterWith() sehingga berlaku untuk sisa eksekusi action tanpa membungkus.
 */
export type AuditActor = {
  actorId?: string | null;
  actorRole?: string | null;
};

type AuditContext = AuditActor & { correlationId: string };

export const auditContextStorage = new AsyncLocalStorage<AuditContext>();

export function runWithAuditActor<T>(
  actor: AuditActor,
  fn: () => Promise<T>
): Promise<T> {
  return auditContextStorage.run(
    {
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      correlationId: randomUUID(),
    },
    fn
  );
}

/**
 * Pasang konteks untuk sisa eksekusi action saat ini (tanpa callback). Bila
 * konteks sudah ada, hanya melengkapi aktornya. Aman dipanggil sekali di awal
 * tiap server action / route handler.
 */
export function ensureAuditContext(actor?: AuditActor): void {
  let store = auditContextStorage.getStore();
  if (!store) {
    store = { correlationId: randomUUID() };
    auditContextStorage.enterWith(store);
  }
  if (actor) {
    if (actor.actorId != null) store.actorId = actor.actorId;
    if (actor.actorRole != null) store.actorRole = actor.actorRole;
  }
}

export function getAuditActor(): AuditActor {
  const store = auditContextStorage.getStore();
  return store ? { actorId: store.actorId, actorRole: store.actorRole } : {};
}

/** id korelasi aksi saat ini (untuk merelasikan AuditLog ↔ DataChangeLog). */
export function getAuditCorrelationId(): string | null {
  return auditContextStorage.getStore()?.correlationId ?? null;
}
