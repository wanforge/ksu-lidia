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
import { createProductAction, updateProductAction, adjustProductStockAction, ProductActionState } from "./actions";
import { Button } from "@/components/ui/button";

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
  const [createState, dispatchCreate] = useActionState<ProductActionState, FormData>(
    createProductAction,
    { success: false, message: "" }
  );

  const [updateState, dispatchUpdate] = useActionState<ProductActionState, FormData>(
    updateProductAction,
    { success: false, message: "" }
  );

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

  // Filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });
  }, [products, query, categoryFilter]);

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-3">
        <button
          type="button"
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "list" ? "border-teal-700 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"
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
            tab === "create" ? "border-teal-700 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => setTab("create")}
        >
          <PiPlusBold className="h-4 w-4" />
          Tambah Produk
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "create" ? (
        <div className="p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daftarkan Produk Baru</h2>
          <form action={dispatchCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode / Barcode Produk</label>
              <input
                type="text"
                name="code"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="Contoh: IND-001"
              />
              {createState.errors?.code && (
                <p className="text-xs text-red-600 mt-1">{createState.errors.code[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="Contoh: Beras Ramos 5kg"
              />
              {createState.errors?.name && (
                <p className="text-xs text-red-600 mt-1">{createState.errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Produk (Optional)</label>
              <input
                type="text"
                name="category"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="Contoh: Sembako, Minuman, Sabun"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Rp)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  defaultValue={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                <input
                  type="number"
                  name="sellingPrice"
                  defaultValue={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
                Simpan Produk
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 p-4 border-b border-gray-200">
            <label className="relative">
              <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kode atau nama produk..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-700"
              />
            </label>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-teal-700"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Product list table */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={PiBarcodeDuotone}
              title="Produk tidak ditemukan"
              description="Katalog produk kosong atau pencarian Anda tidak memiliki kecocokan."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Nama Produk</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-center">Stok Fisik</th>
                    <th className="px-4 py-3 text-right">Harga Beli</th>
                    <th className="px-4 py-3 text-right">Harga Jual</th>
                    <th className="px-4 py-3 text-right">Margin / Markup</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p) => {
                    const margin = Number(p.sellingPrice) - Number(p.purchasePrice);
                    const markupPct = Number(p.purchasePrice) > 0 ? (margin / Number(p.purchasePrice)) * 100 : 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-950">{p.code}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3">
                          {p.category ? (
                            <span className="inline-flex rounded-full bg-teal-50 border border-teal-100 px-2 py-0.5 text-xs text-teal-800">
                              {p.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center font-bold ${p.stock <= 5 ? "text-rose-600" : "text-gray-900"}`}>
                          {p.stock}
                        </td>
                        <td className="px-4 py-3 text-right">Rp {formatNumber(Number(p.purchasePrice))}</td>
                        <td className="px-4 py-3 text-right font-semibold">Rp {formatNumber(Number(p.sellingPrice))}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">
                          <span className="font-semibold text-green-700">Rp {formatNumber(margin)}</span> ({markupPct.toFixed(0)}%)
                        </td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="primary-soft"
                            className="text-teal-700 border-teal-600 hover:bg-teal-50"
                            onClick={() => setEditModal({ isOpen: true, product: p })}
                          >
                            <PiPencilSimpleBold className="mr-1 h-3.5 w-3.5" />
                            Ubah
                          </Button>
                          <Button
                            size="sm"
                            variant="neutral"
                            className="text-amber-700 border-amber-600 hover:bg-amber-50"
                            onClick={() => setAdjModal({ isOpen: true, product: p })}
                          >
                            Opname
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal.isOpen && editModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setEditModal({ isOpen: false, product: null })}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Ubah Data Produk</h3>
            <form action={dispatchUpdate} className="space-y-4">
              <input type="hidden" name="productId" value={editModal.product.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode / Barcode</label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={editModal.product.code}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editModal.product.name}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editModal.product.category || ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    required
                    defaultValue={Number(editModal.product.purchasePrice)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    required
                    defaultValue={Number(editModal.product.sellingPrice)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setEditModal({ isOpen: false, product: null })}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
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
          <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setAdjModal({ isOpen: false, product: null })}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Penyesuaian Stok (Opname Fisik)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Produk: <span className="font-semibold text-gray-900">{adjModal.product.name} ({adjModal.product.code})</span> <br />
              Stok Sistem Saat Ini: <span className="font-bold text-teal-800">{adjModal.product.stock} unit</span>
            </p>

            <form action={dispatchAdj} className="space-y-4">
              <input type="hidden" name="productId" value={adjModal.product.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Perubahan (Positif / Negatif)
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  placeholder="Contoh: -3 untuk susut, 5 untuk bertambah"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penyesuaian</label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="Contoh: Selisih hitung fisik, kemasan pecah"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setAdjModal({ isOpen: false, product: null })}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
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
