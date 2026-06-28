import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is a placeholder for actual Email (Nodemailer) or WhatsApp (Baileys/Twilio) integration
async function sendNotification(
  member: { name: string; phone?: string | null },
  message: string
) {
  // In a real application, you would invoke the email service or WA gateway here
  console.log(
    `[NOTIF-MOCK] Mengirim pesan ke ${member.name} (${member.phone || "No Phone"}): ${message}`
  );
  // return await nodemailer.sendMail(...) or waGateway.sendMessage(...)
  return true;
}

export async function GET(request: Request) {
  // Verify cron secret if needed
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const now = new Date();
    // Cari angsuran yang jatuh tempo dalam 3 hari atau sudah lewat (UNPAID)
    const dueInstallments = await prisma.loanInstallment.findMany({
      where: {
        status: "UNPAID",
        dueDate: {
          lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        loan: {
          include: { member: true },
        },
      },
    });

    if (dueInstallments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada tagihan yang mendekati jatuh tempo.",
      });
    }

    const notificationsSent = [];
    for (const inst of dueInstallments) {
      const isOverdue = new Date(inst.dueDate) < now;
      const amount = Number(inst.principalPaid) + Number(inst.interestPaid); // Initial expected payment
      const message = isOverdue
        ? `Yth. ${inst.loan.member.name}, Angsuran pinjaman Anda sebesar Rp ${amount.toLocaleString("id-ID")} telah MELEWATI jatuh tempo (${inst.dueDate.toLocaleDateString("id-ID")}). Mohon segera melakukan pembayaran.`
        : `Yth. ${inst.loan.member.name}, Mengingatkan bahwa angsuran pinjaman Anda sebesar Rp ${amount.toLocaleString("id-ID")} akan jatuh tempo pada ${inst.dueDate.toLocaleDateString("id-ID")}.`;

      await sendNotification(inst.loan.member, message);
      notificationsSent.push({ member: inst.loan.member.name, isOverdue });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses ${notificationsSent.length} notifikasi.`,
      data: notificationsSent,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
