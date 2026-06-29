import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import { serializePrisma } from "@/lib/serialize";
import LaporanWorkspace from "./laporan-workspace";
import { LOAN_STATUS } from "@/lib/constants";
import { CashEntity } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const session = await getSession();

  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_VIEW)
  ) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya pengguna berwenang yang dapat melihat laporan keuangan KSU Lidia.
      </div>
    );
  }

  // 1. Fetch members and their savings accounts balances
  const members = await prisma.member.findMany({
    where: { deletedAt: null },
    include: {
      savingsAccounts: true,
    },
    orderBy: { no: "asc" },
  });

  // 2. Fetch active loans with installments and member info
  const loans = await prisma.loan.findMany({
    where: { status: LOAN_STATUS.ACTIVE },
    include: {
      member: true,
      installments: true,
    },
    orderBy: { dateDisbursed: "desc" },
  });

  // 3. Fetch savings transactions to act as General Cash Book (Buku Kas)
  const cashBookTxs = await prisma.savingsTransaction.findMany({
    include: {
      member: true,
    },
    orderBy: { date: "desc" },
    take: 100, // Limit to recent 100 for readability
  });

  // 4. Fetch store product transactions to calculate monthly aggregates
  const storeTxs = await prisma.productTransaction.findMany({
    include: {
      items: true,
    },
    orderBy: { date: "asc" },
  });

  // 5. All loans (all statuses) + installments — for monthly report
  const allLoans = await prisma.loan.findMany({
    include: {
      member: { select: { id: true, no: true, name: true } },
      installments: true,
    },
    orderBy: { dateDisbursed: "asc" },
  });

  // 6. Cash transactions (KOPERASI) — for neraca kas on hand
  const cashKoperasi = await prisma.cashTransaction.findMany({
    where: { entity: CashEntity.KOPERASI },
    orderBy: { date: "asc" },
  });

  return (
    <LaporanWorkspace
      members={serializePrisma(members)}
      loans={serializePrisma(loans)}
      cashBookTxs={serializePrisma(cashBookTxs)}
      storeTxs={serializePrisma(storeTxs)}
      allLoans={serializePrisma(allLoans)}
      cashKoperasi={serializePrisma(cashKoperasi)}
    />
  );
}
