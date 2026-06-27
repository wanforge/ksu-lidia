import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });

    // Maps the database schema back to what the UI expects (items)
    const items = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description ?? "",
      href: n.href ?? "#",
      tone: n.tone,
    }));

    return Response.json({ items, unreadCount });
  } catch (error) {
    return Response.json({ items: [], unreadCount: 0 });
  }
}
