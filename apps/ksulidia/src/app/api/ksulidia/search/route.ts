import { prisma } from "@/lib/prisma";
import { LOAN_STATUS, INSTALLMENT_STATUS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  isDeceased?: boolean;
  activeLoanAmount?: number;
  penaltyAmount?: number;
};

export type SearchResponse = {
  members: SearchHit[];
  products: SearchHit[];
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return Response.json({
      members: [],
      products: [],
    } satisfies SearchResponse);
  }

  const query = q.trim();

  // Find members by name or no
  const isNo = /^\d+$/.test(query);
  const memberNo = isNo ? parseInt(query, 10) : undefined;

  const members = await prisma.member.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        ...(memberNo !== undefined ? [{ no: memberNo }] : []),
      ],
      deletedAt: null,
    },
    include: {
      loans: {
        include: {
          installments: true,
        },
      },
    },
    take: 5,
  });

  // Find products by name or code
  const products = await prisma.product.findMany({
    where: {
      OR: [{ name: { contains: query } }, { code: { contains: query } }],
      isActive: true,
    },
    take: 5,
  });

  const memberHits: SearchHit[] = members.map((m) => {
    const activeLoans = m.loans.filter((l) => l.status === LOAN_STATUS.ACTIVE);
    const activeLoanAmount = activeLoans.reduce(
      (sum, l) => sum + Number(l.amount),
      0
    );

    const penaltyAmount = activeLoans.reduce((sum, l) => {
      const lateCount = l.installments.filter((inst) => {
        return (
          inst.status === INSTALLMENT_STATUS.UNPAID &&
          new Date(inst.dueDate) < new Date()
        );
      }).length;
      const principalInstallment = Number(l.amount) / l.tenor;
      const latePenaltyTotal = lateCount * principalInstallment * 0.05;
      return sum + latePenaltyTotal;
    }, 0);

    // Build rich status badges in subtitle
    const statusParts: string[] = [];
    if (m.isDeceased) {
      statusParts.push("Status: Wafat");
    } else {
      statusParts.push("Status: Aktif");
    }
    if (activeLoanAmount > 0) {
      statusParts.push(
        `Pinjaman Aktif: Rp ${activeLoanAmount.toLocaleString("id-ID")}`
      );
    }
    if (penaltyAmount > 0) {
      statusParts.push(
        `Denda Keterlambatan: Rp ${penaltyAmount.toLocaleString("id-ID")}`
      );
    }

    return {
      id: `member-${m.id}`,
      title: `${m.name} (No: ${m.no})`,
      subtitle:
        statusParts.join(" | ") + (m.phone ? ` | Telp: ${m.phone}` : ""),
      href: `/simpan-pinjam/anggota?search=${encodeURIComponent(m.name)}`,
      isDeceased: m.isDeceased,
      activeLoanAmount,
      penaltyAmount,
    };
  });

  const productHits: SearchHit[] = products.map((p) => ({
    id: `product-${p.id}`,
    title: p.name,
    subtitle: `Kode: ${p.code} | Kategori: ${p.category || "Umum"} | Stok: ${p.stock}`,
    href: `/toko/produk?search=${encodeURIComponent(p.name)}`,
  }));

  return Response.json({
    members: memberHits,
    products: productHits,
  } satisfies SearchResponse);
}
