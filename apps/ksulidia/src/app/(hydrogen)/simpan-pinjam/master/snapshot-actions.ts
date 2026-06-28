"use server";

import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { DB_ROLES, CASH_ENTITIES, CASH_TX_TYPES } from "@/lib/constants";
import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createSnapshotAction() {
  const session = await getSession();
  if (!session?.user || session.user.role !== DB_ROLES.ADMIN) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    // 1. Gather all financial states

    // Simpanan balances
    const members = await prisma.member.findMany({
      include: { savingsAccounts: true, loans: true },
    });

    const memberBalances = members.map((m) => ({
      memberId: m.id,
      no: m.no,
      name: m.name,
      savings: m.savingsAccounts.map((s) => ({
        type: s.type,
        balance: Number(s.balance),
      })),
      loans: m.loans.map((l) => ({
        id: l.id,
        status: l.status,
        amount: Number(l.amount),
      })),
    }));

    // Kas Koperasi
    const kasTransactions = await prisma.cashTransaction.findMany({
      where: { entity: CASH_ENTITIES.KOPERASI },
    });
    let kasBalance = 0;
    kasTransactions.forEach((tx) => {
      if (tx.type === CASH_TX_TYPES.IN) kasBalance += Number(tx.amount);
      else kasBalance -= Number(tx.amount);
    });

    // 2. Prepare Snapshot Data JSON
    const snapshotData = {
      timestamp: new Date().toISOString(),
      memberBalances,
      kasBalance,
    };

    // 3. Create the snapshot record
    const periodDate = new Date();
    // Normalize to first day of current month for period date
    periodDate.setDate(1);
    periodDate.setHours(0, 0, 0, 0);

    await prisma.snapshot.create({
      data: {
        periodDate,
        snapshotType: "MONTHLY",
        description: `Snapshot Bulanan - ${periodDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
        data: snapshotData,
        createdBy: session.user.id,
      },
    });

    // Audit Log
    await recordAuditLog(prisma, {
      action: AuditAction.CREATE,
      entityType: "SNAPSHOT",
      entityId: "MONTHLY",
      summary: `Created monthly snapshot for ${periodDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
      actorId: session.user.id,
    });

    revalidatePath("/simpan-pinjam/master");

    return { success: true, message: "Snapshot berhasil dibuat." };
  } catch (error: any) {
    console.error("Failed to create snapshot:", error);
    return { success: false, message: "Gagal membuat snapshot. Coba lagi." };
  }
}
