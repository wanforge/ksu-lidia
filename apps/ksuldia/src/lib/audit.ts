import {
  type AttachmentSource,
  type AuditAction,
  type Prisma,
  type UserRole,
} from "@prisma/client";
import { prisma } from "./prisma";
import { getAuditCorrelationId } from "./audit-context";

type AuditClient = typeof prisma | Prisma.TransactionClient;

export type AuditLogInput = {
  actorId?: string | null;
  actorRole?: UserRole | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  summary?: string;
  source?: AttachmentSource;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Single entry point for writing audit log rows so every event is recorded
 * with a consistent shape (actor, role, source, summary, structured metadata).
 * Pass a transaction client to keep the log atomic with its mutation.
 * Never throws — audit logging must not break the primary operation.
 */
export async function recordAuditLog(
  client: AuditClient,
  input: AuditLogInput
): Promise<void> {
  try {
    await client.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorRole: input.actorRole ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        source: input.source ?? null,
        summary: input.summary ?? null,
        metadata: input.metadata ?? undefined,
        correlationId: getAuditCorrelationId(),
      },
    });
  } catch {
    // swallow — a failed audit write should never abort the caller
  }
}
