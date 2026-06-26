import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { getAuditActor, getAuditCorrelationId } from "./audit-context";
import { logError } from "./log";
import { env } from "@/config/env";

const adapter = new PrismaMariaDb(env.DATABASE_URL ?? "");

// Tabel yang TIDAK dicatat ke data_change_logs:
// - DataChangeLog: tabel log itu sendiri (mencegah rekursi tak terbatas).
// - AuditLog: jejak audit bisnis sudah punya fitur sendiri (halaman Audit);
//   ikut mencatatnya di sini hanya menggandakan data & memenuhi database.
const UNTRACKED_MODELS = new Set(["DataChangeLog", "AuditLog"]);

// Operasi tulis yang dicatat ke data_change_logs. Operasi baca diabaikan.
const WRITE_OPERATIONS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "upsert",
  "delete",
  "deleteMany",
]);

// Field sensitif disamarkan agar tidak ikut tersimpan di log perubahan.
const REDACT_KEYS = new Set([
  "password",
  "newpassword",
  "oldpassword",
  "currentpassword",
  "token",
  "tokenhash",
  "hashedtoken",
  "resettoken",
  "secret",
]);

function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined || depth > 6) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = REDACT_KEYS.has(key.toLowerCase())
        ? "[redacted]"
        : redact(val, depth + 1);
    }
    return out;
  }
  if (typeof value === "bigint") return value.toString();
  return value;
}

function createBaseClient() {
  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Base (un-extended) client. Dipakai khusus untuk menulis baris log agar tidak
// memicu ekstensi secara rekursif.
const globalForBase = globalThis as unknown as {
  basePrisma?: PrismaClient;
};
const basePrisma = globalForBase.basePrisma ?? createBaseClient();
if (env.NODE_ENV !== "production")
  globalForBase.basePrisma = basePrisma;

function modelDelegateName(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (a == null || b == null) return false;
  if (typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

// Diff field-level { field: { from, to } } untuk update; abaikan timestamp yang
// selalu berubah (updatedAt).
function computeDiff(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): Record<string, { from: unknown; to: unknown }> | null {
  if (!before || !after) return null;
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const keys = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  );
  for (const key of keys) {
    if (key === "updatedAt") continue;
    if (!valuesEqual(before[key], after[key])) {
      diff[key] = { from: before[key] ?? null, to: after[key] ?? null };
    }
  }
  return Object.keys(diff).length ? diff : null;
}

// Ambil keadaan SEBELUM operasi (untuk update/upsert) lewat client dasar.
async function fetchBefore(
  model: string,
  where: unknown
): Promise<Record<string, unknown> | null> {
  if (!where || typeof where !== "object") return null;
  try {
    const delegate = (
      basePrisma as unknown as Record<
        string,
        {
          findFirst?: (
            args: unknown
          ) => Promise<Record<string, unknown> | null>;
        }
      >
    )[modelDelegateName(model)];
    if (!delegate?.findFirst) return null;
    return await delegate.findFirst({ where });
  } catch {
    return null;
  }
}

const asJson = (value: unknown): Prisma.InputJsonValue | undefined =>
  value == null ? undefined : (redact(value) as Prisma.InputJsonValue);

async function recordDataChange(input: {
  model?: string;
  operation: string;
  args: unknown;
  result: unknown;
  before?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const result = input.result as Record<string, unknown> | null;
    const recordId =
      result && typeof result === "object" && "id" in result
        ? String(result.id)
        : null;
    const rowCount =
      result && typeof result === "object" && "count" in result
        ? Number(result.count)
        : null;

    // before/after sesuai operasi: create -> after saja; update/upsert -> before
    // (di-fetch) + after; delete -> before (baris yang dihapus dikembalikan).
    let before = input.before ?? null;
    let after: Record<string, unknown> | null = null;
    if (input.operation === "create") {
      after = result;
    } else if (input.operation === "update" || input.operation === "upsert") {
      after = result;
    } else if (input.operation === "delete") {
      before = before ?? result;
    }
    const diff = computeDiff(before, after);

    const actor = getAuditActor();

    await basePrisma.dataChangeLog.create({
      data: {
        model: input.model ?? "(unknown)",
        operation: input.operation,
        recordId,
        rowCount,
        actorId: actor.actorId ?? null,
        actorRole: actor.actorRole ?? null,
        correlationId: getAuditCorrelationId(),
        payload: redact(input.args) as Prisma.InputJsonValue,
        before: asJson(before),
        after: asJson(after),
        diff: asJson(diff),
      },
    });
  } catch (error) {
    // Pencatatan perubahan tidak boleh menggagalkan operasi utama, tapi tetap
    // dicatat ke log server agar tidak hilang diam-diam.
    logError("dataChangeLog.create", error, {
      model: input.model,
      operation: input.operation,
    });
  }
}

// Error DB yang merupakan bagian alur normal (sudah ditangani caller sebagai
// pesan ke user) — tidak perlu mengotori log error.
const EXPECTED_DB_CODES = new Set(["P2002", "P2025"]);

function createExtendedClient() {
  return basePrisma.$extends({
    name: "data-change-log",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const trackable =
            !!model &&
            !UNTRACKED_MODELS.has(model) &&
            WRITE_OPERATIONS.has(operation);
          // Ambil keadaan sebelum untuk update/upsert (delete mengembalikan
          // barisnya sendiri; create tidak punya "sebelum").
          let before: Record<string, unknown> | null = null;
          if (trackable && (operation === "update" || operation === "upsert")) {
            before = await fetchBefore(
              model ?? "",
              (args as { where?: unknown })?.where
            );
          }
          try {
            const result = await query(args);
            if (trackable) {
              await recordDataChange({
                model,
                operation,
                args,
                result,
                before,
              });
            }
            return result;
          } catch (error) {
            // Catat setiap kegagalan DB di sumbernya (read maupun write), kecuali
            // error yang memang ditangani caller (unik/not-found). Tetap di-throw
            // ulang supaya caller menampilkan pesan generik ke user.
            const expected =
              error instanceof Prisma.PrismaClientKnownRequestError &&
              EXPECTED_DB_CODES.has(error.code);
            if (!expected) {
              logError(`prisma:${model ?? "raw"}.${operation}`, error);
            }
            throw error;
          }
        },
      },
    },
  });
}

// Runtime-nya adalah client yang sudah di-extend (punya hook pencatatan), tetapi
// tipenya dipertahankan sebagai PrismaClient agar seluruh kode lama — termasuk
// yang memakai Prisma.TransactionClient — tetap kompatibel.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (createExtendedClient() as unknown as PrismaClient);
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
