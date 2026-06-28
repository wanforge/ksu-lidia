import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notificationIds = body.ids;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return Response.json({ success: true, count: 0 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        isRead: true,
      },
    });

    return Response.json({ success: true, count: result.count });
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
