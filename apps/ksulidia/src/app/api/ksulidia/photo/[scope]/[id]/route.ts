import { getSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";

import { consumeFileAccess } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { readPhoto } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ scope: string; id: string }>;
};

function contentTypeFromKey(key: string): string {
  const ext = key.toLowerCase().split(".").pop() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export async function GET(request: Request, { params }: RouteContext) {
  const { scope, id } = await params;
  const session = await getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rate = consumeFileAccess(`${session.user.id}:${ip}`);
  if (!rate.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) },
    });
  }

  let storageKey: string;

  if (scope === "user") {
    // Hanya pemilik akun atau admin yang boleh melihat foto profil akun.
    if (session.user.id !== id && session.user.role !== UserRole.ADMIN) {
      return new Response("Forbidden", { status: 403 });
    }
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { image: true },
    });
    if (!user?.image) return new Response("Not found", { status: 404 });
    storageKey = user.image;
  } else {
    return new Response("Bad request", { status: 400 });
  }

  try {
    const stored = await readPhoto(storageKey);
    const headers = new Headers({
      "Content-Type": contentTypeFromKey(storageKey),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=60",
    });
    if (stored.contentLength !== undefined) {
      headers.set("Content-Length", String(stored.contentLength));
    }
    return new Response(stored.body, { headers });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}
