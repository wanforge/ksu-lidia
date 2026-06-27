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
import { useCustomTable } from "@/lib/use-custom-table";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";

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
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          unitPrice: inputPrice,
        };
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

  // Update quantity in cart
  const updateCartQty = (productId: string, newQty: number) => {
    if (isNaN(newQty) || newQty <= 0) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (tab === "sale") {
            const prod = products.find((p) => p.id === productId);
            if (prod && prod.stock < newQty) {
              alert(`Stok tidak cukup! Sisa stok adalah ${prod.stock}`);
              return item;
            }
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Mapped transactions for useCustomTable
  const mappedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      const itemsCount = tx.items.reduce((sum, item) => sum + item.quantity, 0);
      const dateObj = new Date(tx.date);
      const dateFormatted = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);

      const typeLabel =
        tx.type === ProductTxType.SALE
          ? "PENJUALAN"
          : tx.type === ProductTxType.PURCHASE
            ? "PEMBELIAN"
            : "PENYESUAIAN";

      // Flatten items to a string for search query matching
      const itemsSearchStr = tx.items
        .map((item) => `${item.product.name} ${item.product.code}`)
        .join(" ");

      return {
        ...tx,
        dateVal: dateObj.getTime(),
        dateFormatted,
        typeLabel,
        totalAmountVal: Number(tx.totalAmount),
        itemsCount,
        itemsSearchStr,
      };
    });
  }, [transactions]);

  const table = useCustomTable({
    items: mappedTransactions,
    initialSort: { key: "dateVal", direction: "desc" },
    initialPageSize: 10,
    searchFields: ["notes", "typeLabel", "itemsSearchStr"],
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
              ? "border-red-700 text-red-700"
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
              ? "border-red-700 text-red-700"
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
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                  >
                    <option value="">-- Pilih --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}){" "}
                        {tab === "sale" ? `· sisa ${p.stock}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Pilih barang retail yang akan dimasukkan ke keranjang
                    belanja.
                  </p>
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
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Jumlah kuantitas barang.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(Number(e.target.value))}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Harga per unit barang.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={addToCart}
                  disabled={!selectedProductId}
                  className="bg-red-700 text-xs text-white hover:bg-red-800"
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Kode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Nama Produk
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Harga
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Aksi
                      </th>
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
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartQty(
                                  item.productId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-center text-sm font-semibold outline-none focus:border-red-700"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-800">
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
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {tab === "sale"
                    ? "Nama pembeli, customer, atau catatan penjualan."
                    : "Nama pihak supplier penyedia barang grosir."}
                </p>
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
                  <span className="text-xl font-extrabold text-red-700">
                    Rp {formatNumber(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full bg-red-700 text-white hover:bg-red-800"
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
          <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 p-4">
            <div className="flex min-w-[220px] max-w-md flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">
                Cari Transaksi
              </span>
              <label className="relative block">
                <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={table.searchQuery}
                  onChange={(e) => table.setSearchQuery(e.target.value)}
                  placeholder="Cari keterangan, pembeli, nama produk..."
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700"
                />
              </label>
            </div>
          </div>

          {/* Transactions list */}
          {table.paginatedItems.length === 0 ? (
            <EmptyState
              icon={PiCalendarBlankDuotone}
              title="Tidak ada riwayat transaksi"
              description="Mutasi transaksi toko Anda kosong."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Tanggal"
                          sortKey="dateVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Jenis"
                          sortKey="type"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Keterangan / Partner"
                          sortKey="notes"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Total Transaksi"
                          sortKey="totalAmountVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label="Jumlah Barang"
                          sortKey="itemsCount"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-center"
                        />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.paginatedItems.map((tx) => {
                      const isExpanded = expandedTxId === tx.id;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">{tx.dateFormatted}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                                tx.type === ProductTxType.SALE
                                  ? "border-red-200 bg-red-50 text-red-800"
                                  : tx.type === ProductTxType.PURCHASE
                                    ? "border-orange-200 bg-orange-50 text-orange-800"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                              }`}
                            >
                              {tx.typeLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {tx.notes || "-"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-800">
                            {tx.type === ProductTxType.ADJUSTMENT
                              ? "-"
                              : `Rp ${formatNumber(tx.totalAmountVal)}`}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-gray-600">
                            {tx.itemsCount} unit
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedTxId(isExpanded ? null : tx.id)
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900"
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {expandedTxId &&
                (() => {
                  const tx = table.paginatedItems.find(
                    (t) => t.id === expandedTxId
                  );
                  if (!tx) return null;
                  return (
                    <div className="animate-in fade-in slide-in-from-top-1 m-4 rounded-md border border-gray-200 bg-gray-50 p-4 duration-200">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Rincian Item Transaksi - {tx.notes || "Umum"} (
                        {tx.dateFormatted})
                      </h4>
                      <div className="space-y-2">
                        {tx.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-gray-150 flex items-center justify-between border-b py-2 text-sm last:border-0"
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
                              {tx.type !== ProductTxType.ADJUSTMENT && (
                                <p className="text-xs font-bold text-red-700">
                                  Subtotal: Rp{" "}
                                  {formatNumber(Number(item.totalPrice))}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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
                  table.exportToCsv("Riwayat_Transaksi_Toko", [
                    { label: "Tanggal Transaksi", key: "dateFormatted" },
                    { label: "Jenis Transaksi", key: "typeLabel" },
                    { label: "Keterangan", key: "notes" },
                    { label: "Total Transaksi", key: "totalAmountVal" },
                    { label: "Total Kuantitas", key: "itemsCount" },
                  ]);
                }}
                exportLabel="Unduh Transaksi"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
