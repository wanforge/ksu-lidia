"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuditContext } from "@/lib/audit-context";
import { routes } from "@/config/routes";
import {
  createMemberSchema,
  updateMemberSchema,
  savingsTransactionSchema,
} from "@/validators/ksulidia.schema";
import { SavingsType, SavingsTxType } from "@prisma/client";

export type MemberActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createMemberAction(
  _prevState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return {
      success: false,
      message: "Sesi Anda telah kedaluwarsa. Silakan sign in kembali.",
    };
  }

  const no = formData.get("no");
  const name = formData.get("name");
  const phone = formData.get("phone") || undefined;
  const address = formData.get("address") || undefined;

  const parsed = createMemberSchema.safeParse({ no, name, phone, address });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data anggota.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await prisma.member.findUnique({
      where: { no: parsed.data.no },
    });

    if (existing) {
      return {
        success: false,
        message: `Nomor anggota ${parsed.data.no} sudah terdaftar.`,
      };
    }

    // Create member along with default savings accounts
    await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          no: parsed.data.no,
          name: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
        },
      });

      // Default Pokok Simpanan (100k)
      await tx.savingsAccount.create({
        data: {
          memberId: member.id,
          type: SavingsType.POKOK,
          balance: 100000,
        },
      });

      // Default Wajib Simpanan (0)
      await tx.savingsAccount.create({
        data: {
          memberId: member.id,
          type: SavingsType.WAJIB,
          balance: 0,
        },
      });

      // Default Sukarela Simpanan (0)
      await tx.savingsAccount.create({
        data: {
          memberId: member.id,
          type: SavingsType.SUKARELA,
          balance: 0,
        },
      });
    });

    revalidatePath(routes.simpanPinjam.anggota);
    return { success: true, message: "Anggota baru berhasil ditambahkan." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan anggota. Silakan coba lagi.",
    };
  }
}

export async function updateMemberAction(
  _prevState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }

  const memberId = formData.get("memberId");
  const name = formData.get("name");
  const phone = formData.get("phone") || undefined;
  const address = formData.get("address") || undefined;

  const parsed = updateMemberSchema.safeParse({
    memberId,
    name,
    phone,
    address,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali input data anggota.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.member.update({
      where: { id: parsed.data.memberId },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address,
      },
    });

    revalidatePath(routes.simpanPinjam.anggota);
    return { success: true, message: "Data anggota berhasil diperbarui." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui data anggota.",
    };
  }
}

export async function postSavingsTransactionAction(
  _prevState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }

  const memberId = formData.get("memberId");
  const type = formData.get("type"); // DEPOSIT | WITHDRAWAL
  const savingsType = formData.get("savingsType"); // POKOK | WAJIB | SUKARELA
  const amount = formData.get("amount");
  const description = formData.get("description") || undefined;

  const parsed = savingsTransactionSchema.safeParse({
    memberId,
    type,
    savingsType,
    amount,
    description,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Data transaksi tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Find the savings account
      const account = await tx.savingsAccount.findUnique({
        where: {
          memberId_type: {
            memberId: parsed.data.memberId,
            type: parsed.data.savingsType,
          },
        },
      });

      if (!account) {
        throw new Error("Akun simpanan untuk jenis ini tidak ditemukan.");
      }

      const currentBalance = Number(account.balance);

      if (
        parsed.data.type === SavingsTxType.WITHDRAWAL &&
        currentBalance < parsed.data.amount
      ) {
        throw new Error(
          `Saldo tidak cukup. Saldo saat ini: Rp ${currentBalance.toLocaleString("id-ID")}`
        );
      }

      // Update savings account balance
      const balanceChange =
        parsed.data.type === SavingsTxType.DEPOSIT
          ? parsed.data.amount
          : -parsed.data.amount;
      const newBalance = currentBalance + balanceChange;

      await tx.savingsAccount.update({
        where: { id: account.id },
        data: { balance: newBalance },
      });

      // Create transaction log
      await tx.savingsTransaction.create({
        data: {
          memberId: parsed.data.memberId,
          type: parsed.data.type,
          savingsType: parsed.data.savingsType,
          amount: parsed.data.amount,
          description:
            parsed.data.description ||
            (parsed.data.type === SavingsTxType.DEPOSIT
              ? "Setoran tunai"
              : "Penarikan tunai"),
          date: new Date(),
        },
      });
    });

    revalidatePath(routes.simpanPinjam.anggota);
    return { success: true, message: "Transaksi simpanan berhasil dicatat." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencatat transaksi simpanan.",
    };
  }
}
