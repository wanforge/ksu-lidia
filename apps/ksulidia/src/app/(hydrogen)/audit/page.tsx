import { getSession } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { AuditAction, type Prisma } from "@prisma/client";
import { PiClockCountdownDuotone, PiShieldCheckDuotone } from "react-icons/pi";
import { canViewAuditLog } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/datetime";
import { parseSort, dateRangeWhere } from "@/lib/table-query";
import { clampPage, getPageCount, getSkip, parsePage } from "@/lib/pagination";
import { routes } from "@/config/routes";
import Pagination from "@/app/(hydrogen)/_components/pagination";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import SortableHeader from "@/app/(hydrogen)/_components/sortable-header";
import StatCard from "@/app/(hydrogen)/_components/stat-card";
import {
  FilterBar,
  FilterField,
  FilterActions,
  SearchInput,
  filterControlClass,
  filterSubmitClass,
  filterResetClass,
} from "@/app/(hydrogen)/_components/filters";
import DateField from "@/app/(hydrogen)/_components/date-field";
import { formatNumber } from "@/lib/format";
import { Table } from "rizzui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const SORT_FIELDS = ["createdAt", "action", "entityType"] as const;

type SearchParams = {
  q?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
  page?: string;
};

type AuditData = {
  rows: {
    id: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    summary: string | null;
    actorId: string | null;
    actorRole: string | null;
    actorName: string | null;
    actorEmail: string | null;
    source: string | null;
    createdAt: Date;
  }[];
  total: number;
  uploadCount: number;
  verifyCount: number;
  deleteCount: number;
  passwordCount: number;
  entities: string[];
  page: number;
  pageCount: number;
  databaseReady: boolean;
};

const actionOptions: AuditAction[] = [
  AuditAction.CREATE,
  AuditAction.UPDATE,
  AuditAction.DELETE,
  AuditAction.RESTORE,
  AuditAction.UPLOAD,
  AuditAction.DOWNLOAD,
  AuditAction.EXPORT,
  AuditAction.VERIFY,
  AuditAction.REJECT,
  AuditAction.REQUEST_REVISION,
  AuditAction.LOGIN,
  AuditAction.LOGOUT,
  AuditAction.PASSWORD_RESET_ISSUED,
  AuditAction.PASSWORD_RESET_USED,
  AuditAction.PASSWORD_CHANGED,
];

const actionLabels: Record<AuditAction, string> = {
  CREATE: "Tambah",
  UPDATE: "Ubah",
  DELETE: "Hapus",
  RESTORE: "Pulihkan",
  UPLOAD: "Unggah",
  DOWNLOAD: "Unduh",
  EXPORT: "Ekspor",
  VERIFY: "Verifikasi",
  REJECT: "Tolak",
  REQUEST_REVISION: "Minta Revisi",
  LOGIN: "Masuk",
  LOGOUT: "Keluar",
  PASSWORD_RESET_ISSUED: "Terbitkan Atur Ulang Kata Sandi",
  PASSWORD_RESET_USED: "Gunakan Atur Ulang Kata Sandi",
  PASSWORD_CHANGED: "Ubah Kata Sandi",
};

function normalizeSearchParams(params: SearchParams) {
  const q = params.q?.trim() || undefined;
  const action = actionOptions.includes(params.action as AuditAction)
    ? (params.action as AuditAction)
    : undefined;
  const entity = params.entity?.trim() || undefined;

  return { q, action, entity };
}

async function getAuditData(params: SearchParams): Promise<AuditData> {
  const { q, action, entity } = normalizeSearchParams(params);

  // Actor FK is removed — resolve name/email search via a separate user lookup.
  let actorIdFilter: string[] | undefined;
  if (q) {
    try {
      const matchingUsers = await prisma.user.findMany({
        where: {
          OR: [{ name: { contains: q } }, { email: { contains: q } }],
        },
        select: { id: true },
        take: 50,
      });
      actorIdFilter = matchingUsers.map((u) => u.id);
    } catch {
      actorIdFilter = [];
    }
  }

  const createdAt = dateRangeWhere(params.from, params.to);
  const { field, dir } = parseSort(
    params.sort,
    params.dir,
    SORT_FIELDS,
    "createdAt",
    "desc"
  );
  const orderBy: Prisma.AuditLogOrderByWithRelationInput = { [field]: dir };

  const where: Prisma.AuditLogWhereInput = {
    ...(action ? { action } : {}),
    ...(entity ? { entityType: entity } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(q
      ? {
          OR: [
            { summary: { contains: q } },
            { entityType: { contains: q } },
            { entityId: { contains: q } },
            ...(actorIdFilter && actorIdFilter.length > 0
              ? [{ actorId: { in: actorIdFilter } }]
              : []),
          ],
        }
      : {}),
  };

  try {
    const total = await prisma.auditLog.count({ where });
    const pageCount = getPageCount(total, PAGE_SIZE);
    const page = clampPage(parsePage(params.page), pageCount);

    const [
      rawRows,
      uploadCount,
      verifyCount,
      deleteCount,
      passwordCount,
      entityRows,
    ] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip: getSkip(page, PAGE_SIZE),
        take: PAGE_SIZE,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          summary: true,
          actorId: true,
          actorRole: true,
          source: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.count({ where: { action: AuditAction.UPLOAD } }),
      prisma.auditLog.count({
        where: {
          action: {
            in: [
              AuditAction.VERIFY,
              AuditAction.REJECT,
              AuditAction.REQUEST_REVISION,
            ],
          },
        },
      }),
      prisma.auditLog.count({ where: { action: AuditAction.DELETE } }),
      prisma.auditLog.count({
        where: {
          action: {
            in: [
              AuditAction.PASSWORD_CHANGED,
              AuditAction.PASSWORD_RESET_ISSUED,
              AuditAction.PASSWORD_RESET_USED,
            ],
          },
        },
      }),
      prisma.auditLog.findMany({
        distinct: ["entityType"],
        orderBy: { entityType: "asc" },
        select: { entityType: true },
      }),
    ]);

    // Manual join: look up actor details for the fetched rows.
    const uniqueActorIds = Array.from(
      new Set(rawRows.map((r) => r.actorId).filter(Boolean) as string[])
    );
    const actorMap = new Map<string, { name: string; email: string }>();
    if (uniqueActorIds.length > 0) {
      const actors = await prisma.user.findMany({
        where: { id: { in: uniqueActorIds } },
        select: { id: true, name: true, email: true },
      });
      for (const a of actors) actorMap.set(a.id, a);
    }

    const rows = rawRows.map((row) => ({
      ...row,
      actorName: row.actorId ? (actorMap.get(row.actorId)?.name ?? null) : null,
      actorEmail: row.actorId
        ? (actorMap.get(row.actorId)?.email ?? null)
        : null,
    }));

    return {
      rows,
      total,
      uploadCount,
      verifyCount,
      deleteCount,
      passwordCount,
      entities: entityRows.map((row) => row.entityType),
      page,
      pageCount,
      databaseReady: true,
    };
  } catch {
    return {
      rows: [],
      total: 0,
      uploadCount: 0,
      verifyCount: 0,
      deleteCount: 0,
      passwordCount: 0,
      entities: [],
      page: 1,
      pageCount: 1,
      databaseReady: false,
    };
  }
}

function ActionPill({ action }: { action: AuditAction }) {
  const tone =
    action === AuditAction.DELETE || action === AuditAction.REJECT
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : action === AuditAction.VERIFY || action === AuditAction.CREATE
        ? "border-red-200 bg-red-50 text-red-800"
        : action === AuditAction.UPLOAD
          ? "border-cyan-200 bg-cyan-50 text-cyan-800"
          : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${tone}`}
    >
      {actionLabels[action]}
    </span>
  );
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await getSession();

  if (!session?.user || !canViewAuditLog(session.user.role)) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Anda tidak memiliki izin untuk melihat audit log.
      </div>
    );
  }

  const params = (await searchParams) ?? {};
  const data = await getAuditData(params);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Audit Sistem
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Audit Log
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Jejak aksi penting untuk simpan pinjam, anggota, transaksi toko, dan
            lifecycle akun.
          </p>
        </div>
      </section>

      {!data.databaseReady ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Data belum bisa dimuat saat ini. Audit log akan tampil setelah
          migration berjalan.
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard
          tone="slate"
          label="Total Terfilter"
          value={formatNumber(data.total)}
        />
        <StatCard
          tone="blue"
          label="Unggah"
          value={formatNumber(data.uploadCount)}
        />
        <StatCard
          tone="teal"
          label="Verifikasi"
          value={formatNumber(data.verifyCount)}
        />
        <StatCard
          tone="rose"
          label="Hapus"
          value={formatNumber(data.deleteCount)}
        />
        <StatCard
          tone="violet"
          label="Kata Sandi"
          value={formatNumber(data.passwordCount)}
        />
      </section>

      <section className="rounded-md border border-gray-200 bg-white">
        <FilterBar>
          {/* Preserve current sort across filter submits */}
          {params.sort ? (
            <input type="hidden" name="sort" value={params.sort} />
          ) : null}
          {params.dir ? (
            <input type="hidden" name="dir" value={params.dir} />
          ) : null}
          <FilterField label="Cari" htmlFor="audit-q" grow>
            <SearchInput
              id="audit-q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Cari ringkasan, entitas, aktor, ID"
            />
          </FilterField>
          <FilterField label="Aksi" htmlFor="audit-action">
            <select
              id="audit-action"
              name="action"
              defaultValue={params.action ?? ""}
              className={filterControlClass}
            >
              <option value="">Semua Aksi</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {actionLabels[action]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Entitas" htmlFor="audit-entity">
            <select
              id="audit-entity"
              name="entity"
              defaultValue={params.entity ?? ""}
              className={filterControlClass}
            >
              <option value="">Semua Entitas</option>
              {data.entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
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
            <a href={routes.audit.list} className={filterResetClass}>
              Reset
            </a>
          </FilterActions>
        </FilterBar>

        {data.rows.length === 0 ? (
          <EmptyState
            icon={PiClockCountdownDuotone}
            title="Belum ada audit log"
            description="Aksi create, update, upload, verify, delete, dan password akan tercatat di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table
              variant="modern"
              className="min-w-full divide-y divide-gray-200 text-[13px]"
            >
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader
                    field="createdAt"
                    label="Waktu"
                    className="min-w-[170px]"
                  />
                  <SortableHeader
                    field="action"
                    label="Aksi"
                    className="whitespace-nowrap"
                  />
                  <SortableHeader
                    field="entityType"
                    label="Entitas"
                    className="min-w-[220px]"
                  />
                  <th className="min-w-[300px] px-3 py-2 text-left font-semibold text-gray-600">
                    Ringkasan
                  </th>
                  <th className="min-w-[220px] px-3 py-2 text-left font-semibold text-gray-600">
                    Aktor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">
                      {formatDateTime(row.createdAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-3 py-2.5">
                      <ActionPill action={row.action} />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-gray-950">
                        {row.entityType}
                      </p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                        {row.entityId}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">
                      <p>{row.summary ?? "-"}</p>
                      {row.source ? (
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          Sumber: {row.source}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-start gap-3">
                        <PiShieldCheckDuotone className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                        <div>
                          <p className="font-semibold text-gray-950">
                            {row.actorName ?? "Sistem"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {row.actorRole ?? row.actorEmail ?? "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination
              basePath={routes.audit.list}
              currentPage={data.page}
              pageCount={data.pageCount}
              total={data.total}
              pageSize={PAGE_SIZE}
              params={{
                q: params.q,
                action: params.action,
                entity: params.entity,
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
