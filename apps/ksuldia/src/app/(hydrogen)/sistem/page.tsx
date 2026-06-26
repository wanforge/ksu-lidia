import { getSession } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { runConfigChecks } from "@/lib/diagnostics/config-check";
import SystemDashboard from "./system-dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SystemDiagnosticsPage() {
  const session = await getSession();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya administrator yang dapat membuka diagnostik sistem.
      </div>
    );
  }

  const checks = runConfigChecks();

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-b border-gray-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          Administrasi
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
          Diagnostik Sistem
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Monitoring realtime: runtime, CPU, memori, disk, waktu database, NTP,
          dan konfigurasi environment.
        </p>
      </section>

      <SystemDashboard checks={checks} />
    </div>
  );
}
