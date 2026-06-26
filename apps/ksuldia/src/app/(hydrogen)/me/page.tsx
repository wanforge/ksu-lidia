import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import {
  PiUserCircleDuotone,
  PiShieldCheckDuotone,
  PiClockCountdownDuotone,
} from "react-icons/pi";

export const dynamic = "force-dynamic";

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900">
        {value || "-"}
      </span>
    </div>
  );
}

function formatDate(date?: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function MePage() {
  const session = await getSession();

  if (!session?.user) {
    return (
      <EmptyState
        tone="error"
        title="Anda harus login"
        description="Masuk terlebih dahulu untuk melihat data pribadi."
      />
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return (
      <EmptyState
        tone="error"
        title="Pengguna tidak ditemukan"
        description="Data pengguna Anda tidak ditemukan di sistem."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            Portal Pengguna
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Profil Saya
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Informasi akun Anda yang terdaftar pada sistem.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
              user.isActive
                ? "border-teal-200 bg-teal-50 text-teal-800"
                : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
          >
            {user.isActive ? "Aktif" : "Tidak Aktif"}
          </span>
          <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">
            Role: {user.role}
          </span>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        {/* Profile Card */}
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-teal-100 bg-teal-50 text-teal-600">
            <PiUserCircleDuotone className="h-16 w-16" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-950">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400">
            <PiShieldCheckDuotone className="h-4 w-4" />
            ID: {user.id.slice(0, 8)}...
          </p>
        </div>

        {/* Details Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-base font-bold text-gray-950">
            Detail Informasi Akun
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem label="Nama Lengkap" value={user.name} />
            <InfoItem label="Alamat Email" value={user.email} />
            <InfoItem label="Hak Akses (Role)" value={user.role} />
            <InfoItem
              label="Status Akun"
              value={user.isActive ? "Aktif" : "Tidak Aktif"}
            />
            <InfoItem
              label="Login Terakhir"
              value={formatDate(user.lastLoginAt)}
            />
            <InfoItem
              label="Tanggal Registrasi"
              value={formatDate(user.createdAt)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
