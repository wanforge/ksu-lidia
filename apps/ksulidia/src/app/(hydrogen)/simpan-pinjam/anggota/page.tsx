import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import { serializePrisma } from "@/lib/serialize";
import AnggotaWorkspace from "./anggota-workspace";

export const dynamic = "force-dynamic";

export default async function AnggotaPage() {
  const session = await getSession();

  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_VIEW)
  ) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya pengguna berwenang yang dapat melihat data Simpan Pinjam.
      </div>
    );
  }

  // Fetch all members with their savings accounts and loans
  const members = await prisma.member.findMany({
    orderBy: { no: "asc" },
    include: {
      savingsAccounts: true,
      loans: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          amount: true,
          installmentAmount: true,
          status: true,
        },
      },
    },
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Administrasi Simpanan
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Simpanan Anggota
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Kelola data simpanan pokok, wajib, dan sukarela anggota. Lakukan
            setoran, penarikan, serta pantau buku tabungan mutasi kas secara
            waktu nyata.
          </p>
        </div>
      </section>

      <AnggotaWorkspace members={serializePrisma(members)} />
    </div>
  );
}
