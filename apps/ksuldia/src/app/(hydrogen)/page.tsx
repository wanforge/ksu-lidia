import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/authz";
import { routes } from "@/config/routes";
import QuickAction from "@/app/(hydrogen)/_components/quick-action";
import {
  PiUserCircleDuotone,
  PiUserGearDuotone,
  PiClockCountdownDuotone,
  PiClockCounterClockwiseDuotone,
  PiPulseDuotone,
} from "react-icons/pi";

export const dynamic = "force-dynamic";

function greeting(now: Date) {
  const h = now.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function Home() {
  const session = await getSession();
  const now = new Date();
  const role = session?.user?.role;
  const firstName = (session?.user?.name ?? "").trim().split(/\s+/)[0] || "";

  // Quick actions gated by permission
  const quickActions = [
    {
      label: "Portal Saya",
      hint: "Akses profil dan akun pribadi Anda",
      href: routes.me.dashboard,
      icon: PiUserCircleDuotone,
      tone: "blue" as const,
      show: can(role, PERMISSIONS.PORTAL_VIEW),
    },
    {
      label: "Manajemen Pengguna",
      hint: "Kelola akun pengguna dan hak akses",
      href: routes.users.list,
      icon: PiUserGearDuotone,
      tone: "rose" as const,
      show: can(role, PERMISSIONS.USER_MANAGE),
    },
    {
      label: "Audit Log",
      hint: "Lihat log riwayat aktivitas sistem",
      href: routes.audit.list,
      icon: PiClockCountdownDuotone,
      tone: "slate" as const,
      show: can(role, PERMISSIONS.AUDIT_VIEW),
    },
    {
      label: "Log Perubahan Data",
      hint: "Pantau riwayat perubahan detail data",
      href: routes.dataChangeLog,
      icon: PiClockCounterClockwiseDuotone,
      tone: "amber" as const,
      show: can(role, PERMISSIONS.DATA_CHANGE_LOG_VIEW),
    },
    {
      label: "Diagnostik Sistem",
      hint: "Periksa status kesehatan sistem",
      href: routes.system,
      icon: PiPulseDuotone,
      tone: "teal" as const,
      show: can(role, PERMISSIONS.SYSTEM_VIEW),
    },
  ].filter((a) => a.show);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Greeting header */}
      <section className="flex flex-col gap-1 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6">
        <p className="text-sm font-medium text-teal-700">{greeting(now)},</p>
        <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">
          {firstName ? `${firstName} 👋` : "Selamat datang 👋"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Selamat datang di panel admin utama base project Anda. Silakan pilih menu di bawah untuk memulai.
        </p>
      </section>

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-950">Akses cepat</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {quickActions.map((a) => (
              <QuickAction
                key={a.label}
                label={a.label}
                hint={a.hint}
                href={a.href}
                icon={a.icon}
                tone={a.tone}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
