"use client";

import { useActionState, useMemo, useState } from "react";
import {
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiBarcodeDuotone,
  PiCoinsDuotone,
  PiWrenchDuotone,
  PiPencilSimpleBold,
  PiXBold,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { formatNumber } from "@/lib/format";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import {
  createProductAction,
  updateProductAction,
  adjustProductStockAction,
  ProductActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { useCustomTable } from "@/lib/use-custom-table";
import { Table } from "rizzui";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";

type Product = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  stock: number;
  purchasePrice: any; // Decimal
  sellingPrice: any; // Decimal
};

type ProdukWorkspaceProps = {
  products: Product[];
};

export default function ProdukWorkspace({ products }: ProdukWorkspaceProps) {
  const [tab, setTab] = useState<"list" | "create">("list");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Edit Product Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Adjust Stock Modal State
  const [adjModal, setAdjModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Actions
  const [createState, dispatchCreate] = useActionState<
    ProductActionState,
    FormData
  >(createProductAction, { success: false, message: "" });

  const [updateState, dispatchUpdate] = useActionState<
    ProductActionState,
    FormData
  >(updateProductAction, { success: false, message: "" });

  const [adjState, dispatchAdj] = useActionState<ProductActionState, FormData>(
    adjustProductStockAction,
    { success: false, message: "" }
  );

  // Action Feedbacks
  useActionFeedback(createState, () => {
    setTab("list");
  });

  useActionFeedback(updateState, () => {
    setEditModal({ isOpen: false, product: null });
  });

  useActionFeedback(adjState, () => {
    setAdjModal({ isOpen: false, product: null });
  });

  // Categories list for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredByCategory = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, categoryFilter]);

  const mappedProducts = useMemo(() => {
    return filteredByCategory.map((p) => {
      const marginVal = Number(p.sellingPrice) - Number(p.purchasePrice);
      const markupPct =
        Number(p.purchasePrice) > 0
          ? (marginVal / Number(p.purchasePrice)) * 100
          : 0;
      return {
        ...p,
        categoryText: p.category || "-",
        purchasePriceVal: Number(p.purchasePrice),
        sellingPriceVal: Number(p.sellingPrice),
        marginVal,
        markupPct,
      };
    });
  }, [filteredByCategory]);

  const table = useCustomTable({
    items: mappedProducts,
    initialSort: { key: "name", direction: "asc" },
    initialPageSize: 10,
    searchFields: ["name", "code", "categoryText"],
  });

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-3">
        <button
          type="button"
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "list"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => setTab("list")}
        >
          <PiBarcodeDuotone className="h-4 w-4" />
          Katalog Produk
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatNumber(products.length)}
          </span>
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "create"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => setTab("create")}
        >
          <PiPlusBold className="h-4 w-4" />
          Tambah Produk
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "create" ? (
        <div className="max-w-xl p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Daftarkan Produk Baru
          </h2>
          <form action={dispatchCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kode / Barcode Produk
              </label>
              <input
                type="text"
                name="code"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Kode unik atau barcode pembeda untuk setiap barang.
              </p>
              {createState.errors?.code && (
                <p className="mt-1 text-xs text-red-600">
                  {createState.errors.code[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Produk
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nama lengkap produk retail beserta ukurannya.
              </p>
              {createState.errors?.name && (
                <p className="mt-1 text-xs text-red-600">
                  {createState.errors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kategori Produk (Optional)
              </label>
              <input
                type="text"
                name="category"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Grup penggolongan tipe produk untuk filter katalog.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stok Awal
                </label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">Stok awal fisik.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Harga Beli (Rp)
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  defaultValue={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">Harga modal beli.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  defaultValue={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">Harga jual retail.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="bg-red-700 text-white hover:bg-red-800"
              >
                Simpan Produk
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 p-4">
            <div className="flex min-w-[220px] max-w-md flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">
                Cari Produk
              </span>
              <label className="relative block">
                <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={table.searchQuery}
                  onChange={(e) => table.setSearchQuery(e.target.value)}
                  placeholder="Cari kode atau nama produk..."
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700"
                />
              </label>
            </div>

            <div className="flex min-w-[160px] flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">
                Kategori
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product list table */}
          {table.paginatedItems.length === 0 ? (
            <EmptyState
              icon={PiBarcodeDuotone}
              title="Produk tidak ditemukan"
              description="Katalog produk kosong atau pencarian Anda tidak memiliki kecocokan."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  variant="modern"
                  className="min-w-full divide-y divide-gray-200 text-sm"
                >
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Kode"
                          sortKey="code"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Nama Produk"
                          sortKey="name"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Kategori"
                          sortKey="category"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Stok Fisik"
                          sortKey="stock"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-center"
                        />
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Harga Beli"
                          sortKey="purchasePriceVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Harga Jual"
                          sortKey="sellingPriceVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Margin / Markup"
                          sortKey="marginVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end text-red-800"
                        />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.paginatedItems.map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-950">
                            {p.code}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {p.name}
                          </td>
                          <td className="px-4 py-3">
                            {p.category ? (
                              <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-xs text-red-800">
                                {p.category}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`px-4 py-3 text-center font-bold ${p.stock <= 5 ? "text-rose-600" : "text-gray-900"}`}
                          >
                            {p.stock}
                          </td>
                          <td className="px-4 py-3 text-right">
                            Rp {formatNumber(p.purchasePriceVal)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            Rp {formatNumber(p.sellingPriceVal)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-500">
                            <span className="font-semibold text-green-700">
                              Rp {formatNumber(p.marginVal)}
                            </span>{" "}
                            ({p.markupPct.toFixed(0)}%)
                          </td>
                          <td className="flex items-center justify-center gap-1.5 px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="primary-soft"
                              className="border-red-700 text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setEditModal({
                                  isOpen: true,
                                  product: p as any,
                                })
                              }
                            >
                              <PiPencilSimpleBold className="mr-1 h-3.5 w-3.5" />
                              Ubah
                            </Button>
                            <Button
                              size="sm"
                              variant="neutral"
                              className="border-amber-600 text-amber-700 hover:bg-amber-50"
                              onClick={() =>
                                setAdjModal({ isOpen: true, product: p as any })
                              }
                            >
                              Opname
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <TableControls
                currentPage={table.currentPage}
                totalPages={table.totalPages}
                pageSize={table.pageSize}
                totalItems={table.totalItems}
                startIndex={table.startIndex}
                endIndex={table.endIndex}
                onPageChange={table.setCurrentPage}
                onPageSizeChange={table.setPageSize}
                onExport={() => {
                  table.exportToCsv("Katalog_Produk_Toko", [
                    { label: "Kode", key: "code" },
                    { label: "Nama Produk", key: "name" },
                    { label: "Kategori", key: "categoryText" },
                    { label: "Stok Fisik", key: "stock" },
                    { label: "Harga Beli", key: "purchasePriceVal" },
                    { label: "Harga Jual", key: "sellingPriceVal" },
                    { label: "Margin", key: "marginVal" },
                  ]);
                }}
                exportLabel="Unduh Katalog"
              />
            </>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal.isOpen && editModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setEditModal({ isOpen: false, product: null })}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Ubah Data Produk
            </h3>
            <form action={dispatchUpdate} className="space-y-4">
              <input
                type="hidden"
                name="productId"
                value={editModal.product.id}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kode / Barcode
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={editModal.product.code}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Kode unik atau barcode pembeda barang.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editModal.product.name}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nama lengkap produk retail.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editModal.product.category || ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Grup penggolongan tipe produk.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Harga Beli (Rp)
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    required
                    defaultValue={Number(editModal.product.purchasePrice)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Harga modal beli.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    required
                    defaultValue={Number(editModal.product.sellingPrice)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Harga jual retail.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setEditModal({ isOpen: false, product: null })}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-red-700 text-white hover:bg-red-800"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Opname/Adjustment Modal */}
      {adjModal.isOpen && adjModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setAdjModal({ isOpen: false, product: null })}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Penyesuaian Stok (Opname Fisik)
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Produk:{" "}
              <span className="font-semibold text-gray-900">
                {adjModal.product.name} ({adjModal.product.code})
              </span>{" "}
              <br />
              Stok Sistem Saat Ini:{" "}
              <span className="font-bold text-red-800">
                {adjModal.product.stock} unit
              </span>
            </p>

            <form action={dispatchAdj} className="space-y-4">
              <input
                type="hidden"
                name="productId"
                value={adjModal.product.id}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jumlah Perubahan (Positif / Negatif)
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Masukkan nilai negatif (misal -5) untuk stok susut, atau
                  positif (misal 5) jika stok bertambah.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  name="reason"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Catatan/keterangan penyebab terjadinya perbedaan jumlah stok
                  fisik.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setAdjModal({ isOpen: false, product: null })}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-red-700 text-white hover:bg-red-800"
                >
                  Simpan Penyesuaian
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
