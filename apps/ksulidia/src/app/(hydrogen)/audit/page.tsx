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
  const activeTab = params.tab === "perubahan" ? "perubahan" : "aktivitas";

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
            Pantau aktivitas sistem (Login, Logout, Ekspor) dan lacak perubahan data
            (Tambah, Ubah, Hapus) pada seluruh entitas di dalam satu tampilan.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mt-4">
          <Link
            href={`${routes.audit.list}?tab=aktivitas`}
            className={`border-b-2 py-2 text-sm font-semibold transition-colors ${
              activeTab === "aktivitas"
                ? "border-red-600 text-red-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Aktivitas Sistem
          </Link>
          <Link
            href={`${routes.audit.list}?tab=perubahan`}
            className={`border-b-2 py-2 text-sm font-semibold transition-colors ${
              activeTab === "perubahan"
                ? "border-red-600 text-red-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Log Perubahan Data
          </Link>
        </div>
      </section>

      {/* Content */}
      {activeTab === "aktivitas" ? (
        <AuditLogView searchParams={searchParams} />
      ) : (
        <DataChangeLogView searchParams={searchParams} />
      )}
    </div>
  );
}
