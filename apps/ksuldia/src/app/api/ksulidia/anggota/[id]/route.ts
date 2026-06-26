import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user || !hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_VIEW)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        savingsAccounts: true,
        savingsTransactions: {
          orderBy: { date: "desc" },
        },
        loans: {
          orderBy: { dateDisbursed: "desc" },
          include: {
            installments: {
              orderBy: { monthNumber: "asc" },
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch member details" }, { status: 500 });
  }
}
