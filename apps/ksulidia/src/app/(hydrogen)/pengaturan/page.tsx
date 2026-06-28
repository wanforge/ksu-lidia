import { getSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getSettings } from "@/lib/settings";
import PengaturanWorkspace from "./pengaturan-workspace";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const session = await getSession();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya administrator yang dapat membuka pengaturan sistem.
      </div>
    );
  }

  const settings = getSettings();

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-b border-gray-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
          Administrasi
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
          Pengaturan Sistem
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Kelola profil koperasi, parameter finansial dasar, dan konfigurasi umum lainnya.
        </p>
      </section>

      <PengaturanWorkspace initialSettings={settings} />
    </div>
  );
}
