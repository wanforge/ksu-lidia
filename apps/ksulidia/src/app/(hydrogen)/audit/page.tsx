import Link from "next/link";
import { getSession } from "@/lib/auth";
import { canViewAuditLog } from "@/lib/authz";
import { routes } from "@/config/routes";
import AuditLogView from "./audit-log-view";
import DataChangeLogView from "./data-change-log-view";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams?: Promise<any>;
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
  const currentTab = params.tab === "data" ? "data" : "audit";

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Keamanan &amp; Audit
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Audit Log Terpadu
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Pantau aktivitas sistem (Login, Logout, Ekspor) dan lacak perubahan
            data (Tambah, Ubah, Hapus) pada seluruh entitas di dalam satu
            tampilan.
          </p>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <Link
          href={`${routes.audit.list}?tab=audit`}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            currentTab === "audit"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
          }`}
        >
          Aktivitas Sistem
        </Link>
        <Link
          href={`${routes.audit.list}?tab=data`}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            currentTab === "data"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
          }`}
        >
          Riwayat Perubahan Data
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {currentTab === "audit" ? (
          <div>
            <AuditLogView searchParams={searchParams} />
          </div>
        ) : (
          <div>
            <DataChangeLogView searchParams={searchParams} />
          </div>
        )}
      </div>
    </div>
  );
}
