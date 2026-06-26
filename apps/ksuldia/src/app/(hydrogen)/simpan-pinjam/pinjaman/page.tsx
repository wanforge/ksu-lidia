import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import PinjamanWorkspace from "./pinjaman-workspace";

export const dynamic = "force-dynamic";

export default async function PinjamanPage() {
  const session = await getSession();

  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_VIEW)
  ) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya pengguna berwenang yang dapat mengelola Pinjaman & Kredit.
      </div>
    );
  }

  // Fetch all loans with member details and installments
  const loans = await prisma.loan.findMany({
    orderBy: { dateDisbursed: "desc" },
    include: {
      member: true,
      installments: {
        orderBy: { monthNumber: "asc" },
      },
    },
  });

  // Fetch all members without active loans (eligible to apply for new loan)
  const eligibleMembers = await prisma.member.findMany({
    where: {
      isActive: true,
      loans: {
        none: {
          status: "ACTIVE",
        },
      },
    },
    orderBy: { no: "asc" },
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            KSU Lidia GKJ Manahan
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Pinjaman & Kredit
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Kelola pencairan pinjaman baru beserta potongan provisi (1% flat
            dari total bunga) dan Cadangan Resiko Kredit (CRK - 1x angsuran
            pokok). Catat pembayaran angsuran bulanan, dan hitung denda
            keterlambatan (5% dari nominal angsuran) secara otomatis.
          </p>
        </div>
      </section>

      <PinjamanWorkspace loans={loans} eligibleMembers={eligibleMembers} />
    </div>
  );
}
