"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuditContext } from "@/lib/audit-context";
import { routes } from "@/config/routes";
import { createLoanSchema, payInstallmentSchema } from "@/validators/ksulidia.schema";
import { LoanStatus, InstallmentStatus } from "@prisma/client";

export type LoanActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createLoanAction(
  _prevState: LoanActionState,
  formData: FormData
): Promise<LoanActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user ? { actorId: session.user.id, actorRole: session.user.role } : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa. Silakan sign in kembali." };
  }

  const memberId = formData.get("memberId");
  const amount = formData.get("amount");
  const interestRate = formData.get("interestRate") ?? 1.0; // default 1% flat
  const tenor = formData.get("tenor") ?? 10; // default 10 months

  const parsed = createLoanSchema.safeParse({ memberId, amount, interestRate, tenor });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data pengajuan pinjaman.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const activeLoan = await prisma.loan.findFirst({
      where: {
        memberId: parsed.data.memberId,
        status: LoanStatus.ACTIVE,
      },
    });

    if (activeLoan) {
      return {
        success: false,
        message: "Anggota masih memiliki pinjaman aktif yang belum lunas.",
      };
    }

    const loanAmount = parsed.data.amount;
    const rate = parsed.data.interestRate;
    const months = parsed.data.tenor;

    // provision = 1x flat monthly interest
    const provision = loanAmount * (rate / 100);
    // crk = 1x monthly principal installment
    const crk = loanAmount / months;
    // receivedAmount = loanAmount - provision - crk
    const receivedAmount = loanAmount - provision - crk;
    // monthly installment amount = monthly principal + monthly interest
    const installmentAmount = (loanAmount / months) + (loanAmount * (rate / 100));

    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          memberId: parsed.data.memberId,
          amount: loanAmount,
          interestRate: rate,
          tenor: months,
          provision,
          crk,
          receivedAmount,
          installmentAmount,
          status: LoanStatus.ACTIVE,
          dateDisbursed: new Date(),
        },
      });

      // Generate all installments
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);

        await tx.loanInstallment.create({
          data: {
            loanId: loan.id,
            monthNumber: i,
            principalPaid: 0,
            interestPaid: 0,
            penaltyPaid: 0,
            totalPaid: 0,
            dueDate,
            status: InstallmentStatus.UNPAID,
          },
        });
      }
    });

    revalidatePath(routes.simpanPinjam.pinjaman);
    return { success: true, message: "Pinjaman baru berhasil dicairkan." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencairkan pinjaman.",
    };
  }
}

export async function payInstallmentAction(
  _prevState: LoanActionState,
  formData: FormData
): Promise<LoanActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user ? { actorId: session.user.id, actorRole: session.user.role } : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }

  const installmentId = formData.get("installmentId");
  const principalPaid = formData.get("principalPaid");
  const interestPaid = formData.get("interestPaid");
  const penaltyPaid = formData.get("penaltyPaid") ?? 0;

  const parsed = payInstallmentSchema.safeParse({ installmentId, principalPaid, interestPaid, penaltyPaid });
  if (!parsed.success) {
    return {
      success: false,
      message: "Data pembayaran tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const inst = await tx.loanInstallment.findUnique({
        where: { id: parsed.data.installmentId },
        include: { loan: true },
      });

      if (!inst) {
        throw new Error("Data angsuran tidak ditemukan.");
      }

      if (inst.status === InstallmentStatus.PAID) {
        throw new Error("Angsuran ini sudah lunas dibayar.");
      }

      const totalPaid = parsed.data.principalPaid + parsed.data.interestPaid + parsed.data.penaltyPaid;

      // Update installment
      await tx.loanInstallment.update({
        where: { id: inst.id },
        data: {
          principalPaid: parsed.data.principalPaid,
          interestPaid: parsed.data.interestPaid,
          penaltyPaid: parsed.data.penaltyPaid,
          totalPaid,
          paidAt: new Date(),
          status: InstallmentStatus.PAID,
        },
      });

      // Check if all installments for this loan are now PAID
      const remainingUnpaid = await tx.loanInstallment.count({
        where: {
          loanId: inst.loanId,
          status: { not: InstallmentStatus.PAID },
        },
      });

      if (remainingUnpaid === 0) {
        await tx.loan.update({
          where: { id: inst.loanId },
          data: { status: LoanStatus.PAID },
        });
      }
    });

    revalidatePath(routes.simpanPinjam.pinjaman);
    return { success: true, message: "Pembayaran angsuran berhasil dicatat." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencatat pembayaran angsuran.",
    };
  }
}
