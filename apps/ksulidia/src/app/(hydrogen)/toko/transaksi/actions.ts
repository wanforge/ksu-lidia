"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuditContext } from "@/lib/audit-context";
import { routes } from "@/config/routes";
import { createProductTransactionSchema } from "@/validators/ksulidia.schema";
import { ProductTxType, AuditAction, AttachmentSource } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";

export type TxActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function recordTransactionAction(
  _prevState: TxActionState,
  formData: FormData
): Promise<TxActionState> {
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

  const type = formData.get("type"); // PURCHASE | SALE
  const notes = formData.get("notes") || undefined;
  const itemsJson = formData.get("items") as string; // JSON string representing array of items

  let items: any[] = [];
  try {
    items = JSON.parse(itemsJson || "[]");
  } catch {
    return { success: false, message: "Format item transaksi tidak valid." };
  }

  const parsed = createProductTransactionSchema.safeParse({
    type,
    notes,
    items,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data transaksi Anda.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Calculate total amount
      let totalAmount = 0;
      for (const item of parsed.data.items) {
        totalAmount += item.quantity * item.unitPrice;
      }

      // Create transaction header
      const trans = await tx.productTransaction.create({
        data: {
          type: parsed.data.type,
          totalAmount,
          notes: parsed.data.notes,
          date: new Date(),
        },
      });

      // Process each item and adjust stock
      for (const item of parsed.data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(
            `Produk dengan ID ${item.productId} tidak ditemukan.`
          );
        }

        if (parsed.data.type === ProductTxType.SALE) {
          if (product.stock < item.quantity) {
            throw new Error(
              `Stok produk "${product.name}" tidak mencukupi. Sisa: ${product.stock}, diminta: ${item.quantity}`
            );
          }

          // Decrease stock
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity },
          });
        } else if (parsed.data.type === ProductTxType.PURCHASE) {
          // Increase stock and optionally update purchase price
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: product.stock + item.quantity,
              purchasePrice: item.unitPrice, // update with latest purchase price
            },
          });
        }

        // Create transaction item
        await tx.productTransactionItem.create({
          data: {
            transactionId: trans.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          },
        });
      }

      // Write Audit Log
      await recordAuditLog(tx, {
        actorId: session.user.id,
        actorRole: session.user.role,
        action: AuditAction.CREATE,
        entityType: "ProductTransaction",
        entityId: trans.id,
        summary: `Mencatat transaksi ${parsed.data.type === ProductTxType.SALE ? "Penjualan" : "Pembelian"} toko: Total Rp ${totalAmount.toLocaleString("id-ID")}`,
        source: AttachmentSource.SYSTEM,
      });
    });

    revalidatePath(routes.toko.transaksi);
    revalidatePath(routes.toko.produk);
    return {
      success: true,
      message: `Transaksi ${parsed.data.type === ProductTxType.SALE ? "Penjualan" : "Pembelian"} berhasil dicatat.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencatat transaksi.",
    };
  }
}
