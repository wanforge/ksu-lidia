import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
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

  const memberHits: SearchHit[] = members.map((m) => ({
    id: `member-${m.id}`,
    title: `${m.name} (No: ${m.no})`,
    subtitle: m.phone || "Tidak ada nomor telp",
    href: `/simpan-pinjam/anggota?search=${encodeURIComponent(m.name)}`,
  }));

  const productHits: SearchHit[] = products.map((p) => ({
    id: `product-${p.id}`,
    title: p.name,
    subtitle: `Kode: ${p.code} | Stok: ${p.stock}`,
    href: `/toko/produk?search=${encodeURIComponent(p.name)}`,
  }));

  return Response.json({
    members: memberHits,
    products: productHits,
  } satisfies SearchResponse);
}
