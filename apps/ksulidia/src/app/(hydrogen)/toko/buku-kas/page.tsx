import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BukuKasView from "@/app/(hydrogen)/_components/buku-kas/buku-kas-view";
import { CashEntity } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function BukuKasTokoPage() {
  const session = await getSession();
  if (!session?.user) return <div>Unauthorized</div>;

  const transactionsRaw = await prisma.cashTransaction.findMany({
    where: { entity: CashEntity.TOKO },
    orderBy: [{ date: "asc" }, { id: "asc" }],
    take: 1000,
  });

  let currentBalance = 0;
  const transactions = transactionsRaw
    .map((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === "IN") {
        currentBalance += amt;
      } else {
        currentBalance -= amt;
      }
      return {
        id: tx.id,
        date: tx.date,
        description: tx.description || "",
        amount: amt,
        transactionType:
          tx.type === "IN" ? "DEBIT" : ("CREDIT" as "DEBIT" | "CREDIT"),
        balance: currentBalance,
        referenceNo: tx.referenceId,
      };
    })
    .reverse();

  return <BukuKasView entity={CashEntity.TOKO} transactions={transactions} />;
}
