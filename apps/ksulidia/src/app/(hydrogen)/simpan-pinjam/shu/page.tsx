import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import { serializePrisma } from "@/lib/serialize";
import ShuWorkspace from "./shu-workspace";

export const dynamic = "force-dynamic";

export default async function ShuPage() {
  const session = await getSession();

  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_VIEW)
  ) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya pengguna berwenang yang dapat melihat data SHU.
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // Semua distribusi SHU yang sudah tersimpan, join member
  const rawDistributions = await prisma.shuDistribution.findMany({
    include: { member: { select: { id: true, no: true, name: true } } },
    orderBy: [{ year: "desc" }, { member: { no: "asc" } }],
  });

  const distributions = serializePrisma(rawDistributions).map((d: any) => ({
    id: d.id,
    no: d.member.no,
    name: d.member.name,
    year: d.year,
    shuSimpanan: d.shuSimpanan,
    shuPinjaman: d.shuPinjaman,
    totalShu: d.totalShu,
  }));

  const yearSet = new Set<number>(distributions.map((d: any) => d.year as number));
  const existingYears: number[] = Array.from(yearSet).sort((a, b) => b - a);

  // Agregat untuk preview kalkulasi baru
  const members = await prisma.member.findMany({
    where: { deletedAt: null, isActive: true },
    include: { savingsAccounts: true },
  });

  const totalSimpanan = members.reduce(
    (s, m) => s + m.savingsAccounts.reduce((a, acc) => a + Number(acc.balance), 0),
    0
  );

  const loansThisYear = await prisma.loan.findMany({
    where: {
      dateDisbursed: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    },
    include: { installments: true },
  });

  const totalPinjaman = loansThisYear.reduce(
    (s, l) =>
      s +
      l.installments
        .filter((i) => i.status === "PAID")
        .reduce((a, i) => a + Number(i.principalPaid), 0),
    0
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Distribusi SHU (Sisa Hasil Usaha)
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Hitung dan distribusikan SHU tahunan secara proporsional ke seluruh anggota aktif.
        </p>
      </div>
      <ShuWorkspace
        currentYear={currentYear}
        existingYears={existingYears}
        distributions={distributions}
        selectedYear={(existingYears[0] as number | undefined) ?? currentYear}
        totalSimpanan={totalSimpanan}
        totalPinjaman={totalPinjaman}
      />
    </div>
  );
}
