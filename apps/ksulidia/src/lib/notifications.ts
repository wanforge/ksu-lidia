import { prisma } from "@/lib/prisma";
import { NotificationTone } from "@prisma/client";

export async function createNotification(data: {
  title: string;
  description?: string;
  href?: string;
  tone?: NotificationTone;
}) {
  return await prisma.notification.create({
    data: {
      title: data.title,
      description: data.description,
      href: data.href,
      tone: data.tone ?? "info",
    },
  });
}
