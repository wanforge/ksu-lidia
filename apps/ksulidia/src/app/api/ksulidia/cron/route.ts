import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();

    // 1. Check for Late Loan Installments
    const lateInstallments = await prisma.loanInstallment.findMany({
      where: {
        status: "UNPAID",
        dueDate: {
          lt: today,
        },
      },
      include: {
        loan: {
          include: {
            member: true,
          },
        },
      },
    });

    for (const installment of lateInstallments) {
      // Avoid duplicate notifications for the same installment on the same day
      // (a real system would have a more robust mechanism)
      const title = `Angsuran Telat: ${installment.loan.member.name}`;

      const existing = await prisma.notification.findFirst({
        where: { title, isRead: false },
      });

      if (!existing) {
        await createNotification({
          title,
          description: `Bulan ke-${installment.monthNumber} senilai Rp ${installment.totalPaid.toString()} jatuh tempo pada ${installment.dueDate.toLocaleDateString("id-ID")}`,
          href: `/simpan-pinjam/pinjaman`,
          tone: "danger",
        });
      }
    }

    // 2. Check for Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 10,
        },
      },
    });

    for (const product of lowStockProducts) {
      const title = `Stok Menipis: ${product.name}`;

      const existing = await prisma.notification.findFirst({
        where: { title, isRead: false },
      });

      if (!existing) {
        await createNotification({
          title,
          description: `Sisa stok produk ${product.code} hanya ${product.stock} unit.`,
          href: `/toko/produk`,
          tone: "warning",
        });
      }
    }

    return Response.json({ success: true, message: "Cron checks completed" });
  } catch (error) {
    console.error("Cron Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
