"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureAuditContext } from "@/lib/audit-context";
import { routes } from "@/config/routes";
import {
  createProductSchema,
  updateProductSchema,
  stockAdjustmentSchema,
} from "@/validators/ksulidia.schema";
import { ProductTxType, AuditAction, AttachmentSource } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";

export type ProductActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
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

  const code = formData.get("code");
  const name = formData.get("name");
  const category = formData.get("category") || undefined;
  const stock = formData.get("stock") ?? 0;
  const purchasePrice = formData.get("purchasePrice") ?? 0;
  const sellingPrice = formData.get("sellingPrice") ?? 0;

  const parsed = createProductSchema.safeParse({
    code,
    name,
    category,
    stock,
    purchasePrice,
    sellingPrice,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data produk.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return {
        success: false,
        message: `Produk dengan kode ${parsed.data.code} sudah terdaftar.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          code: parsed.data.code,
          name: parsed.data.name,
          category: parsed.data.category,
          stock: parsed.data.stock,
          purchasePrice: parsed.data.purchasePrice,
          sellingPrice: parsed.data.sellingPrice,
        },
      });

      // If initial stock > 0, create a transaction for it
      if (parsed.data.stock > 0) {
        const trans = await tx.productTransaction.create({
          data: {
            type: ProductTxType.PURCHASE,
            totalAmount: parsed.data.stock * parsed.data.purchasePrice,
            notes: "Stok awal saat pendaftaran produk",
            date: new Date(),
          },
        });

        await tx.productTransactionItem.create({
          data: {
            transactionId: trans.id,
            productId: product.id,
            quantity: parsed.data.stock,
            unitPrice: parsed.data.purchasePrice,
            totalPrice: parsed.data.stock * parsed.data.purchasePrice,
          },
        });
      }

      // Write Audit Log
      await recordAuditLog(tx, {
        actorId: session.user.id,
        actorRole: session.user.role,
        action: AuditAction.CREATE,
        entityType: "Product",
        entityId: product.id,
        summary: `Menambahkan produk baru ke katalog: ${product.code} - ${product.name} (Stok awal: ${product.stock})`,
        source: AttachmentSource.BACK_OFFICE,
      });
    });

    revalidatePath(routes.toko.produk);
    return {
      success: true,
      message: "Produk berhasil ditambahkan ke katalog.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan produk.",
    };
  }
}

export async function updateProductAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }

  const productId = formData.get("productId");
  const code = formData.get("code");
  const name = formData.get("name");
  const category = formData.get("category") || undefined;
  const purchasePrice = formData.get("purchasePrice") ?? 0;
  const sellingPrice = formData.get("sellingPrice") ?? 0;

  const parsed = updateProductSchema.safeParse({
    productId,
    code,
    name,
    category,
    purchasePrice,
    sellingPrice,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data produk.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await prisma.product.findFirst({
      where: {
        code: parsed.data.code,
        id: { not: parsed.data.productId },
      },
    });

    if (existing) {
      return {
        success: false,
        message: `Kode produk ${parsed.data.code} sudah terdaftar untuk produk lain.`,
      };
    }

    const product = await prisma.product.update({
      where: { id: parsed.data.productId },
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        category: parsed.data.category,
        purchasePrice: parsed.data.purchasePrice,
        sellingPrice: parsed.data.sellingPrice,
      },
    });

    await recordAuditLog(prisma, {
      actorId: session.user.id,
      actorRole: session.user.role,
      action: AuditAction.UPDATE,
      entityType: "Product",
      entityId: product.id,
      summary: `Memperbarui katalog produk: ${product.code} - ${product.name}`,
      source: AttachmentSource.BACK_OFFICE,
    });

    revalidatePath(routes.toko.produk);
    return { success: true, message: "Katalog produk berhasil diperbarui." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui produk.",
    };
  }
}

export async function adjustProductStockAction(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }

  const productId = formData.get("productId");
  const quantity = formData.get("quantity");
  const reason = formData.get("reason");

  const parsed = stockAdjustmentSchema.safeParse({
    productId,
    quantity,
    reason,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Data penyesuaian tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: parsed.data.productId },
      });

      if (!product) {
        throw new Error("Produk tidak ditemukan.");
      }

      const currentStock = product.stock;
      const newStock = currentStock + parsed.data.quantity;

      if (newStock < 0) {
        throw new Error(
          `Stok akhir tidak boleh negatif. Stok saat ini: ${currentStock}`
        );
      }

      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: newStock },
      });

      // Create transaction record
      const trans = await tx.productTransaction.create({
        data: {
          type: ProductTxType.ADJUSTMENT,
          totalAmount: 0,
          notes: parsed.data.reason || "Penyesuaian stok manual",
          date: new Date(),
        },
      });

      await tx.productTransactionItem.create({
        data: {
          transactionId: trans.id,
          productId: product.id,
          quantity: parsed.data.quantity,
          unitPrice:
            parsed.data.quantity >= 0
              ? product.purchasePrice
              : product.sellingPrice,
          totalPrice: 0,
        },
      });

      // Write Audit Log
      await recordAuditLog(tx, {
        actorId: session.user.id,
        actorRole: session.user.role,
        action: AuditAction.UPDATE,
        entityType: "Product",
        entityId: product.id,
        summary: `Menyesuaikan stok produk ${product.code} - ${product.name}: ${parsed.data.quantity >= 0 ? "+" : ""}${parsed.data.quantity} (Stok baru: ${newStock})`,
        source: AttachmentSource.BACK_OFFICE,
      });
    });

    revalidatePath(routes.toko.produk);
    return { success: true, message: "Stok produk berhasil disesuaikan." };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menyesuaikan stok produk.",
    };
  }
}

export async function bulkDeleteProductsAction(
  productIds: string[]
): Promise<ProductActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user) {
    return { success: false, message: "Sesi Anda telah kedaluwarsa." };
  }

  try {
    // Check if any product is used in transactions
    const usedProducts = await prisma.productTransactionItem.findFirst({
      where: {
        productId: { in: productIds },
      },
    });

    if (usedProducts) {
      return {
        success: false,
        message:
          "Beberapa produk tidak bisa dihapus karena sudah dipakai dalam transaksi. Gunakan fitur nonaktifkan produk saja.",
      };
    }

    await prisma.product.deleteMany({
      where: {
        id: { in: productIds },
      },
    });

    revalidatePath("/toko/produk");
    return {
      success: true,
      message: `Berhasil menghapus ${productIds.length} produk.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Terjadi kesalahan sistem.",
    };
  }
}
