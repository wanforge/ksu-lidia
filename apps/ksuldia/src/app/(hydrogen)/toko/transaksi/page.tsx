import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import { serializePrisma } from "@/lib/serialize";
import TransaksiWorkspace from "./transaksi-workspace";

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
  const session = await getSession();

  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.TOKO_VIEW)
  ) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya pengguna berwenang yang dapat mengelola Transaksi Toko Lidia.
      </div>
    );
  }

  // Fetch all transactions with items and product details
  const transactions = await prisma.productTransaction.findMany({
    orderBy: { date: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Fetch all products (for the add transaction forms)
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
            KSU Lidia GKJ Manahan
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Transaksi & Mutasi Toko
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Catat dan pantau transaksi pembelian stok (pasokan dari pemasok)
            serta rekap transaksi penjualan produk. Sistem otomatis memperbarui
            stok inventaris barang secara waktu nyata.
          </p>
        </div>
      </section>

      <TransaksiWorkspace transactions={serializePrisma(transactions)} products={serializePrisma(products)} />
    </div>
  );
}
