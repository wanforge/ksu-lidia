import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import { serializePrisma } from "@/lib/serialize";
import PinjamanWorkspace from "./pinjaman-workspace";
import { LOAN_STATUS } from "@/lib/constants";

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
          status: LOAN_STATUS.ACTIVE,
        },
      },
    },
    orderBy: { no: "asc" },
  });

  // Fetch AppSettings for defaults
  const settings = await prisma.appSetting.findMany();
  let defaultRates = {
    interestRate: 1.5,
    provisionRate: 100.0,
    crkRate: 10.0,
    penaltyRate: 5.0,
  };

  for (const s of settings) {
    if (s.key === "DEFAULT_INTEREST_RATE")
      defaultRates.interestRate = parseFloat(s.value) || 1.5;
    if (s.key === "DEFAULT_PENALTY_RATE")
      defaultRates.penaltyRate = parseFloat(s.value) || 5.0;
    if (s.key === "PROVISION_RATE")
      defaultRates.provisionRate = parseFloat(s.value) || 100.0;
    if (s.key === "CRK_RATE")
      defaultRates.crkRate = parseFloat(s.value) || 10.0;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Perkreditan Anggota
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Pinjaman & Kredit
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Kelola pencairan pinjaman baru. Nilai bunga, denda, provisi, dan CRK
            dapat diatur berdasarkan nilai default atau di-override per
            pinjaman.
          </p>
        </div>
      </section>

      <PinjamanWorkspace
        loans={serializePrisma(loans)}
        eligibleMembers={serializePrisma(eligibleMembers)}
        defaultRates={defaultRates}
      />
    </div>
  );
}
