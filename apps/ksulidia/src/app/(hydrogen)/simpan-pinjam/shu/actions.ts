"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuditContext } from "@/lib/audit-context";
import { routes } from "@/config/routes";
import { AuditAction, AttachmentSource } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";
import { hasPermission, PERMISSIONS } from "@/lib/rbac/permissions";
import { z } from "zod";

export type ShuActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const shuInputSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  totalShuSimpanan: z.coerce.number().nonnegative(),
  totalShuPinjaman: z.coerce.number().nonnegative(),
});

export async function calculateAndSaveShuAction(
  _prevState: ShuActionState,
  formData: FormData
): Promise<ShuActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }
  if (!hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_MANAGE)) {
    return { success: false, message: "Anda tidak memiliki akses untuk aksi ini." };
  }

  const parsed = shuInputSchema.safeParse({
    year: formData.get("year"),
    totalShuSimpanan: formData.get("totalShuSimpanan"),
    totalShuPinjaman: formData.get("totalShuPinjaman"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Data input tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { year, totalShuSimpanan, totalShuPinjaman } = parsed.data;

  try {
    // Fetch all active members with savings accounts
    const members = await prisma.member.findMany({
      where: { deletedAt: null, isActive: true },
      include: { savingsAccounts: true },
    });

    // Total simpanan seluruh anggota
    const totalAllSimpanan = members.reduce((sum, m) => {
      return sum + m.savingsAccounts.reduce((s, a) => s + Number(a.balance), 0);
    }, 0);

    // Total pinjaman yang sudah dibayar oleh seluruh anggota dalam tahun ini
    const loansThisYear = await prisma.loan.findMany({
      where: {
        member: { deletedAt: null },
        dateDisbursed: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      include: { installments: true },
    });

    const memberLoanMap = new Map<string, number>();
    for (const loan of loansThisYear) {
      const paid = loan.installments
        .filter((i) => i.status === "PAID")
        .reduce((s, i) => s + Number(i.principalPaid), 0);
      memberLoanMap.set(
        loan.memberId,
        (memberLoanMap.get(loan.memberId) ?? 0) + paid
      );
    }
    const totalAllPinjaman = Array.from(memberLoanMap.values()).reduce(
      (s, v) => s + v,
      0
    );

    // Hitung SHU per anggota
    const distributions = members.map((m) => {
      const mSimpanan = m.savingsAccounts.reduce(
        (s, a) => s + Number(a.balance),
        0
      );
      const mPinjaman = memberLoanMap.get(m.id) ?? 0;

      const shuSimpanan =
        totalAllSimpanan > 0
          ? (mSimpanan / totalAllSimpanan) * totalShuSimpanan
          : 0;
      const shuPinjaman =
        totalAllPinjaman > 0
          ? (mPinjaman / totalAllPinjaman) * totalShuPinjaman
          : 0;
      const totalShu = shuSimpanan + shuPinjaman;

      return { memberId: m.id, year, shuSimpanan, shuPinjaman, totalShu };
    });

    // Upsert semua distribusi dalam satu transaksi
    await prisma.$transaction(async (tx) => {
      for (const d of distributions) {
        await tx.shuDistribution.upsert({
          where: { memberId_year: { memberId: d.memberId, year: d.year } },
          create: d,
          update: {
            shuSimpanan: d.shuSimpanan,
            shuPinjaman: d.shuPinjaman,
            totalShu: d.totalShu,
          },
        });
      }

      await recordAuditLog(tx, {
        actorId: session.user.id,
        actorRole: session.user.role,
        action: AuditAction.CREATE,
        entityType: "ShuDistribution",
        entityId: `year-${year}`,
        summary: `Kalkulasi SHU ${year}: Rp${totalShuSimpanan.toLocaleString("id-ID")} (simpanan) + Rp${totalShuPinjaman.toLocaleString("id-ID")} (pinjaman) untuk ${distributions.length} anggota`,
        source: AttachmentSource.BACK_OFFICE,
      });
    });

    revalidatePath(routes.simpanPinjam.shu);
    return {
      success: true,
      message: `SHU ${year} berhasil dihitung dan disimpan untuk ${distributions.length} anggota.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghitung SHU.",
    };
  }
}
