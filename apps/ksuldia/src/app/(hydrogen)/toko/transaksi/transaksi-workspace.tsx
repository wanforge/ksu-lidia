"use client";

import { useActionState, useMemo, useState } from "react";
import {
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiCalendarBlankDuotone,
  PiShoppingCartDuotone,
  PiPackageDuotone,
  PiTrashDuotone,
  PiCaretDownBold,
  PiCaretUpBold,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { formatNumber } from "@/lib/format";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { recordTransactionAction, TxActionState } from "./actions";
import { ProductTxType } from "@prisma/client";
import { Button } from "@/components/ui/button";

type TxItem = {
  id: string;
  quantity: number;
  unitPrice: any;
  totalPrice: any;
  product: {
    code: string;
    name: string;
  };
};

type ProductTransaction = {
  id: string;
  type: ProductTxType;
  totalAmount: any;
  notes: string | null;
  date: any;
  items: TxItem[];
};

type ProductOption = {
  id: string;
  code: string;
  name: string;
  stock: number;
  purchasePrice: any;
  sellingPrice: any;
};

type TransaksiWorkspaceProps = {
  transactions: ProductTransaction[];
  products: ProductOption[];
};

type CartItem = {
  productId: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function TransaksiWorkspace({
  transactions,
  products,
}: TransaksiWorkspaceProps) {
  const [tab, setTab] = useState<"list" | "sale" | "purchase">("list");
  const [query, setQuery] = useState("");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Cart/Basket State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQty, setInputQty] = useState(1);
  const [inputPrice, setInputPrice] = useState(0);
  const [txNotes, setTxNotes] = useState("");

  const [actionState, dispatchAction] = useActionState<TxActionState, FormData>(
    recordTransactionAction,
    { success: false, message: "" }
  );

  useActionFeedback(actionState, () => {
    setTab("list");
    setCart([]);
    setTxNotes("");
    setSelectedProductId("");
    setInputQty(1);
    setInputPrice(0);
  });

  // Calculate cart grand total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  // Selected product option
  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Handle selected product change (set defaults for price)
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      // If we are in "sale" tab, default to sellingPrice, else default to purchasePrice
      const price =
        tab === "sale" ? Number(prod.sellingPrice) : Number(prod.purchasePrice);
      setInputPrice(price);
      setInputQty(1);
    }
  };

  // Add item to cart
  const addToCart = () => {
    if (!currentProduct) return;
    if (inputQty <= 0) return;

    // Check stock if doing a sale
    if (tab === "sale" && currentProduct.stock < inputQty) {
      alert(
        `Stok tidak cukup! Sisa stok untuk "${currentProduct.name}" adalah ${currentProduct.stock}`
      );
      return;
    }

    // Add or merge into cart
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === currentProduct.id
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + inputQty;
        // Verify stock limits on merge
        if (tab === "sale" && currentProduct.stock < newQty) {
          alert(`Stok tidak cukup! Sisa stok adalah ${currentProduct.stock}`);
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        updated[existingIdx].unitPrice = inputPrice; // update with latest inputted price
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: currentProduct.id,
            code: currentProduct.code,
            name: currentProduct.name,
            quantity: inputQty,
            unitPrice: inputPrice,
          },
        ];
      }
    });

    // Reset selection
    setSelectedProductId("");
    setInputQty(1);
    setInputPrice(0);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Filters for Transactions history
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (!q) return true;
      return (
        tx.notes?.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.items.some((item) => item.product.name.toLowerCase().includes(q))
      );
    });
  }, [transactions, query]);

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-3">
        <button
          type="button"
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "list"
              ? "border-teal-700 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => {
            setTab("list");
            setCart([]);
          }}
        >
          <PiCalendarBlankDuotone className="h-4 w-4" />
          Riwayat Transaksi
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatNumber(transactions.length)}
          </span>
        </button>

        <button
          type="button"
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "sale"
              ? "border-teal-700 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => {
            setTab("sale");
            setCart([]);
          }}
        >
          <PiShoppingCartDuotone className="h-4 w-4" />
          Catat Penjualan
        </button>

        <button
          type="button"
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "purchase"
              ? "border-teal-700 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => {
            setTab("purchase");
            setCart([]);
          }}
        >
          <PiPackageDuotone className="h-4 w-4" />
          Catat Pembelian (Supplier)
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "sale" || tab === "purchase" ? (
        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_420px]">
          {/* Basket builder */}
          <div className="space-y-6">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              Form{" "}
              {tab === "sale"
                ? "Pencatatan Penjualan Produk"
                : "Pembelian Barang Supplier"}
            </h2>

            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Tambah Item ke Keranjang
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Pilih Produk
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  >
                    <option value="">-- Pilih --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}){" "}
                        {tab === "sale" ? `· sisa ${p.stock}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={inputQty}
                    onChange={(e) => setInputQty(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={addToCart}
                  disabled={!selectedProductId}
                  className="bg-teal-700 text-xs text-white hover:bg-teal-800"
                >
                  Tambahkan ke Keranjang
                </Button>
              </div>
            </div>

            {/* Cart list table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700">
                Keranjang Item
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Kode</th>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3 text-right">Harga</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cart.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          Keranjang kosong. Tambahkan item di atas.
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr
                          key={item.productId}
                          className="hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-950">
                            {item.code}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right">
                            Rp {formatNumber(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-teal-800">
                            Rp {formatNumber(item.quantity * item.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-rose-600 hover:text-rose-800"
                            >
                              <PiTrashDuotone className="mx-auto h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="h-fit space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="border-b border-gray-200 pb-2 font-bold text-gray-800">
              Ringkasan Transaksi
            </h3>

            <form action={dispatchAction} className="space-y-4">
              <input
                type="hidden"
                name="type"
                value={
                  tab === "sale" ? ProductTxType.SALE : ProductTxType.PURCHASE
                }
              />
              <input type="hidden" name="items" value={JSON.stringify(cart)} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {tab === "sale"
                    ? "Nama Pembeli / Keterangan"
                    : "Nama Supplier / Keterangan"}
                </label>
                <input
                  type="text"
                  name="notes"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder={
                    tab === "sale"
                      ? "Contoh: Bp. Joko, Umum"
                      : "Contoh: Supplier Sembako Jaya"
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Jumlah Item:</span>
                  <span className="font-semibold">{cart.length} produk</span>
                </div>
                <div className="border-gray-250 flex justify-between border-b pb-2 text-sm text-gray-600">
                  <span>Total Kuantitas:</span>
                  <span className="font-semibold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} unit
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 font-bold text-gray-900">
                  <span>Grand Total:</span>
                  <span className="text-xl font-extrabold text-teal-700">
                    Rp {formatNumber(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full bg-teal-700 text-white hover:bg-teal-800"
                >
                  Catat & Simpan Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="flex border-b border-gray-200 p-4">
            <label className="relative max-w-md flex-1">
              <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari keterangan, pembeli, nama produk..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-700"
              />
            </label>
          </div>

          {/* Transactions list */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={PiCalendarBlankDuotone}
              title="Tidak ada riwayat transaksi"
              description="Mutasi transaksi toko Anda kosong."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Keterangan / Partner</th>
                    <th className="px-4 py-3 text-right">Total Transaksi</th>
                    <th className="px-4 py-3 text-center">Jumlah Barang</th>
                    <th className="px-4 py-3 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    const itemsCount = tx.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    return (
                      <>
                        <tr key={tx.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            {new Intl.DateTimeFormat("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(tx.date))}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                                tx.type === ProductTxType.SALE
                                  ? "border-green-200 bg-green-50 text-green-800"
                                  : tx.type === ProductTxType.PURCHASE
                                    ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                              }`}
                            >
                              {tx.type === ProductTxType.SALE
                                ? "PENJUALAN"
                                : tx.type === ProductTxType.PURCHASE
                                  ? "PEMBELIAN"
                                  : "PENYESUAIAN"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {tx.notes || "-"}
                          </td>
                          <td className="text-teal-850 px-4 py-3 text-right font-bold">
                            {tx.type === ProductTxType.ADJUSTMENT
                              ? "-"
                              : `Rp ${formatNumber(Number(tx.totalAmount))}`}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-gray-600">
                            {itemsCount} unit
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedTxId(isExpanded ? null : tx.id)
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                            >
                              {isExpanded ? (
                                <>
                                  Tutup <PiCaretUpBold className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  Lihat <PiCaretDownBold className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="rounded-md border border-gray-200 bg-white p-4">
                                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                  Rincian Item Transaksi
                                </h4>
                                <div className="space-y-2">
                                  {tx.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between border-b border-gray-100 py-1.5 text-sm last:border-0"
                                    >
                                      <div>
                                        <p className="font-semibold text-gray-900">
                                          {item.product.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          Kode: {item.product.code}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                          {item.quantity} x Rp{" "}
                                          {formatNumber(Number(item.unitPrice))}
                                        </p>
                                        {tx.type !==
                                          ProductTxType.ADJUSTMENT && (
                                          <p className="text-xs font-bold text-teal-700">
                                            Subtotal: Rp{" "}
                                            {formatNumber(
                                              Number(item.totalPrice)
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
