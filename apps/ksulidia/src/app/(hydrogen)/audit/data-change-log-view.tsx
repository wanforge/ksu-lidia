import { getSession } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Prisma, UserRole } from "@prisma/client";
import { routes } from "@/config/routes";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/datetime";
import { parseSort, dateRangeWhere } from "@/lib/table-query";
import { clampPage, getPageCount, getSkip, parsePage } from "@/lib/pagination";
import Pagination from "@/app/(hydrogen)/_components/pagination";
import SortableHeader from "@/app/(hydrogen)/_components/sortable-header";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { PiClockCounterClockwiseDuotone } from "react-icons/pi";
import {
  FilterBar,
  FilterField,
  FilterActions,
  filterControlClass,
  filterSubmitClass,
  filterResetClass,
} from "@/app/(hydrogen)/_components/filters";
import DateField from "@/app/(hydrogen)/_components/date-field";
import { formatNumber } from "@/lib/format";
import LogRow from "./log-row";
import { Table } from "rizzui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const SORT_FIELDS = ["createdAt", "model", "operation"] as const;

type SearchParams = {
  model?: string;
  operation?: string;
  correlationId?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
  page?: string;
};

const auditActionLabels: Record<string, string> = {
  CREATE: "Tambah",
  UPDATE: "Ubah",
  DELETE: "Hapus",
  RESTORE: "Pulihkan",
  UPLOAD: "Unggah",
  DOWNLOAD: "Unduh",
  VERIFY: "Verifikasi",
  REJECT: "Tolak",
  REQUEST_REVISION: "Minta Revisi",
  LOGIN: "Masuk",
  LOGOUT: "Keluar",
  PASSWORD_RESET_ISSUED: "Terbitkan Atur Ulang Kata Sandi",
  PASSWORD_RESET_USED: "Gunakan Atur Ulang Kata Sandi",
  PASSWORD_CHANGED: "Ubah Kata Sandi",
};

const operationLabels: Record<string, string> = {
  create: "Tambah",
  createMany: "Tambah Massal",
  update: "Ubah",
  updateMany: "Ubah Massal",
  upsert: "Tambah/Ubah",
  delete: "Hapus",
  deleteMany: "Hapus Massal",
};

function operationTone(operation: string) {
  if (operation.startsWith("create") || operation === "upsert")
    return "border-red-200 bg-red-50 text-red-800";
  if (operation.startsWith("delete"))
    return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

/**
 * Label/warna semantik untuk satu baris. Soft-delete/restore dilakukan via
 * `update` pada kolom `deletedAt`, jadi tanpa ini semua tampil sebagai "Ubah".
 * Kita deteksi perubahan `deletedAt` dari diff dan beri tag "Hapus"/"Pulihkan".
 */
function semanticOperation(
  operation: string,
  diff: unknown
): { label: string; tone: string } {
  const d =
    diff && typeof diff === "object"
      ? (diff as Record<string, { from?: unknown; to?: unknown }>)
      : null;
  const deletedAt = d?.deletedAt;
  if ((operation === "update" || operation === "upsert") && deletedAt) {
    const becameDeleted = !deletedAt.from && !!deletedAt.to;
    const wasRestored = !!deletedAt.from && !deletedAt.to;
    if (becameDeleted) {
      return {
        label: "Hapus (soft)",
        tone: "border-rose-200 bg-rose-50 text-rose-800",
      };
    }
    if (wasRestored) {
      return {
        label: "Pulihkan",
        tone: "border-red-200 bg-red-50 text-red-800",
      };
    }
  }
  return {
    label: operationLabels[operation] ?? operation,
    tone: operationTone(operation),
  };
}

export default async function DataChangeLogView({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="w-full rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya admin yang dapat melihat log perubahan data.
      </div>
    );
  }

  const params = (await searchParams) ?? {};
  const correlationId = params.correlationId?.trim() || undefined;

  let result: Awaited<ReturnType<typeof getRows>> = {
    rows: [],
    total: 0,
    page: 1,
    pageCount: 1,
  };
  let models: string[] = [];
  let relatedAudit: Awaited<ReturnType<typeof getRelatedAudit>> = [];
  let databaseReady = true;
  try {
    [result, models, relatedAudit] = await Promise.all([
      getRows(params),
      prisma.dataChangeLog
        .findMany({
          distinct: ["model"],
          select: { model: true },
          orderBy: { model: "asc" },
        })
        .then((list) => list.map((item) => item.model)),
      getRelatedAudit(correlationId),
    ]);
  } catch {
    databaseReady = false;
  }
  const rows = result.rows;

  // Tampilkan nama aktor (actorId tidak ber-FK supaya log tetap awet).
  const actorIds = Array.from(
    new Set(
      [
        ...rows.map((row) => row.actorId),
        ...relatedAudit.map((entry) => entry.actorId),
      ].filter((id): id is string => !!id)
    )
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      })
    : [];
  const actorName = new Map(actors.map((actor) => [actor.id, actor.name]));

  return (
    <div className="flex w-full flex-col gap-6">

      {!databaseReady ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Data belum bisa dimuat saat ini.
        </div>
      ) : null}

      {correlationId ? (
        <section className="rounded-md border border-red-200 bg-red-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-red-900">
              Menampilkan satu aksi · {formatNumber(rows.length)} perubahan
              baris
              <span className="ms-2 font-mono text-xs font-normal text-red-700">
                {correlationId.slice(0, 8)}
              </span>
            </p>
            <a
              href={`${routes.audit.list}?tab=perubahan`}
              className="text-xs font-semibold text-red-800 underline hover:text-red-950"
            >
              Hapus filter
            </a>
          </div>
          {relatedAudit.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {relatedAudit.map((entry) => (
                <li key={entry.id} className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {auditActionLabels[entry.action] ?? entry.action}
                  </span>{" "}
                  {entry.summary ?? `${entry.entityType} ${entry.entityId}`}
                  <span className="ms-2 text-xs text-gray-500">
                    oleh{" "}
                    {entry.actorId
                      ? (actorName.get(entry.actorId) ?? entry.actorId)
                      : "Sistem"}{" "}
                    · {formatDateTime(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-red-800">
              Tidak ada entri audit log untuk aksi ini (mungkin aksi
              non-bisnis).
            </p>
          )}
        </section>
      ) : null}

      <section className="rounded-md border border-gray-200 bg-white">
        <FilterBar>
          {params.sort ? (
            <input type="hidden" name="sort" value={params.sort} />
          ) : null}
          {params.dir ? (
            <input type="hidden" name="dir" value={params.dir} />
          ) : null}
          {correlationId ? (
            <input type="hidden" name="correlationId" value={correlationId} />
          ) : null}
          <FilterField label="Tabel" htmlFor="log-model" grow>
            <select
              id="log-model"
              name="model"
              defaultValue={params.model ?? ""}
              className={filterControlClass}
            >
              <option value="">Semua tabel</option>
              {models.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Operasi" htmlFor="log-operation">
            <select
              id="log-operation"
              name="operation"
              defaultValue={params.operation ?? ""}
              className={filterControlClass}
            >
              <option value="">Semua operasi</option>
              {Object.entries(operationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Dari tanggal">
            <DateField name="from" defaultValue={params.from} />
          </FilterField>
          <FilterField label="Sampai tanggal">
            <DateField name="to" defaultValue={params.to} />
          </FilterField>
          <FilterActions>
            <button type="submit" className={filterSubmitClass}>
              Filter
            </button>
            <a href={`${routes.audit.list}?tab=perubahan`} className={filterResetClass}>
              Reset
            </a>
          </FilterActions>
        </FilterBar>

        {rows.length === 0 ? (
          <EmptyState
            icon={PiClockCounterClockwiseDuotone}
            title="Belum ada perubahan tercatat"
            description="Operasi tambah, ubah, dan hapus pada data akan muncul di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table
              variant="modern"
              className="min-w-full divide-y divide-gray-200 text-sm"
            >
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader
                    field="createdAt"
                    label="Waktu"
                    className="whitespace-nowrap !px-4"
                  />
                  <SortableHeader
                    field="model"
                    label="Tabel"
                    className="!px-4"
                  />
                  <SortableHeader
                    field="operation"
                    label="Operasi"
                    className="!px-4"
                  />
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Aktor
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <LogRow
                    key={row.id}
                    row={{
                      id: row.id,
                      createdAtLabel: formatDateTime(row.createdAt),
                      model: row.model,
                      recordId: row.recordId,
                      rowCountLabel:
                        row.rowCount != null
                          ? `${formatNumber(row.rowCount)} baris`
                          : null,
                      operation: row.operation,
                      operationLabel: semanticOperation(row.operation, row.diff)
                        .label,
                      operationToneClass: semanticOperation(
                        row.operation,
                        row.diff
                      ).tone,
                      actorLabel: row.actorId
                        ? (actorName.get(row.actorId) ?? row.actorId)
                        : "Sistem",
                      diff: row.diff,
                      before: row.before,
                      after: row.after,
                      payload: row.payload,
                      correlationId: row.correlationId,
                      correlationHref: row.correlationId
                        ? `${routes.audit.list}?tab=perubahan&correlationId=${row.correlationId}`
                        : null,
                    }}
                  />
                ))}
              </tbody>
            </Table>
            <Pagination
              basePath={routes.audit.list}
              currentPage={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={PAGE_SIZE}
              params={{
                tab: "perubahan",
                model: params.model,
                operation: params.operation,
                correlationId: params.correlationId,
                from: params.from,
                to: params.to,
                sort: params.sort,
                dir: params.dir,
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

async function getRelatedAudit(correlationId?: string) {
  if (!correlationId) return [];
  return prisma.auditLog.findMany({
    where: { correlationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      summary: true,
      actorId: true,
      createdAt: true,
    },
  });
}

async function getRows(params: SearchParams) {
  const model = params.model?.trim() || undefined;
  const operation = params.operation?.trim() || undefined;
  const correlationId = params.correlationId?.trim() || undefined;
  const createdAt = dateRangeWhere(params.from, params.to);
  const { field, dir } = parseSort(
    params.sort,
    params.dir,
    SORT_FIELDS,
    "createdAt",
    "desc"
  );
  const orderBy: Prisma.DataChangeLogOrderByWithRelationInput = {
    [field]: dir,
  };

  const where: Prisma.DataChangeLogWhereInput = {
    ...(model ? { model } : {}),
    ...(operation ? { operation } : {}),
    ...(correlationId ? { correlationId } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  const total = await prisma.dataChangeLog.count({ where });
  const pageCount = getPageCount(total, PAGE_SIZE);
  const page = clampPage(parsePage(params.page), pageCount);

  const rows = await prisma.dataChangeLog.findMany({
    where,
    orderBy,
    skip: getSkip(page, PAGE_SIZE),
    take: PAGE_SIZE,
    select: {
      id: true,
      model: true,
      operation: true,
      recordId: true,
      rowCount: true,
      actorId: true,
      correlationId: true,
      payload: true,
      before: true,
      after: true,
      diff: true,
      createdAt: true,
    },
  });

  return { rows, total, page, pageCount };
}
