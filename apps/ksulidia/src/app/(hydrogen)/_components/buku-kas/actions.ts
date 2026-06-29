"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuditContext } from "@/lib/audit-context";
import { routes } from "@/config/routes";
import { cashTransactionSchema } from "@/validators/ksulidia.schema";
import {
  CashEntity,
  CashTxType,
  AuditAction,
  AttachmentSource,
} from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";

export type CashActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createCashTransactionAction(
  _prevState: CashActionState,
  formData: FormData
): Promise<CashActionState> {
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

  const entity = formData.get("entity");
  const type = formData.get("type");
  const amount = formData.get("amount");
  const description = formData.get("description");
  const referenceNo = formData.get("referenceNo") || undefined;

  const parsed = cashTransactionSchema.safeParse({
    entity,
    type,
    amount,
    description,
    referenceNo,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali input data mutasi kas.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const tx = await prisma.cashTransaction.create({
      data: {
        entity: parsed.data.entity,
        type: parsed.data.type,
        amount: parsed.data.amount,
        description: parsed.data.description,
        referenceId: parsed.data.referenceNo,
        date: new Date(),
      },
    });

    await recordAuditLog(prisma, {
      actorId: session.user.id,
      actorRole: session.user.role,
      action: AuditAction.CREATE,
      entityType: "CashTransaction",
      entityId: tx.id,
      summary: `Mencatat mutasi kas manual (${parsed.data.type}) untuk ${parsed.data.entity}: Rp ${Number(parsed.data.amount).toLocaleString("id-ID")}`,
      source: AttachmentSource.BACK_OFFICE,
    });

    if (parsed.data.entity === CashEntity.KOPERASI) {
      revalidatePath(routes.simpanPinjam.kas);
    } else {
      revalidatePath(routes.toko.kas);
    }

    return { success: true, message: "Transaksi mutasi kas berhasil dicatat." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencatat mutasi kas. Silakan coba lagi.",
    };
  }
}
