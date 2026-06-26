import { getSession } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { getSystemSnapshot } from "@/lib/diagnostics/system-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only live system snapshot endpoint — polled by the diagnostics page. */
export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (session.user.role !== UserRole.ADMIN) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const snapshot = await getSystemSnapshot();
    return Response.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Snapshot failed", { status: 500 });
  }
}
