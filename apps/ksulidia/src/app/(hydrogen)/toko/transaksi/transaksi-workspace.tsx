"use client";

import { useActionState, useMemo, useState } from "react";
import {
  PiShoppingCartDuotone,
  PiPackageDuotone,
  PiCalendarBlankDuotone,
  PiTrashDuotone,
  PiCaretDownBold,
  PiCaretUpBold,
  PiPrinterDuotone,
  PiXBold,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { formatNumber } from "@/lib/format";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import { recordTransactionAction, TxActionState } from "./actions";
import { ProductTxType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useCustomTable, ColumnFilterConfig } from "@/lib/use-custom-table";
import { Table } from "@/components/ui/table";
import { Can } from "@/components/rbac/can";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";
import { DataTableFilters } from "@/components/ui/table/DataTableFilters";
import { Tabs } from "@/components/ui/Tabs";
import { PrintStrukModal } from "./print-struk-modal";

type TxItem = {
  id: string;
  quantity: number;
  unitPrice: any;
  totalPrice: any;
  product: { code: string; name: string };
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

type TxFormType = "sale" | "purchase";

function TxFormModal({
  type,
  products,
  onClose,
  dispatch,
}: {
  type: TxFormType;
  products: ProductOption[];
  onClose: () => void;
  dispatch: (payload: FormData) => void;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQty, setInputQty] = useState(1);
  const [inputPrice, setInputPrice] = useState(0);
  const [txNotes, setTxNotes] = useState("");

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart]
  );

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setInputPrice(type === "sale" ? Number(prod.sellingPrice) : Number(prod.purchasePrice));
      setInputQty(1);
    }
  };

  const addToCart = () => {
    if (!currentProduct || inputQty <= 0) return;
    if (type === "sale" && currentProduct.stock < inputQty) {
      alert(`Stok tidak cukup! Sisa stok "${currentProduct.name}" adalah ${currentProduct.stock}`);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === currentProduct.id);
      if (idx > -1) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + inputQty;
        if (type === "sale" && currentProduct.stock < newQty) {
          alert(`Stok tidak cukup! Sisa stok adalah ${currentProduct.stock}`);
          return prev;
        }
        updated[idx] = { ...updated[idx], quantity: newQty, unitPrice: inputPrice };
        return updated;
      }
      return [...prev, { productId: currentProduct.id, code: currentProduct.code, name: currentProduct.name, quantity: inputQty, unitPrice: inputPrice }];
    });
    setSelectedProductId("");
    setInputQty(1);
    setInputPrice(0);
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((item) => item.productId !== productId));

  const updateCartQty = (productId: string, newQty: number) => {
    if (isNaN(newQty) || newQty <= 0) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        if (type === "sale") {
          const prod = products.find((p) => p.id === productId);
          if (prod && prod.stock < newQty) {
            alert(`Stok tidak cukup! Sisa stok adalah ${prod.stock}`);
            return item;
          }
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const title = type === "sale" ? "Pencatatan Penjualan Produk" : "Pembelian Barang Supplier";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-6">
      <div className="relative w-full max-w-5xl rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Form {title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_380px]">
          {/* Basket builder */}
          <div className="space-y-6">
            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tambah Item ke Keranjang</p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Pilih Produk</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700"
                  >
                    <option value="">-- Pilih --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}){type === "sale" ? ` · sisa ${p.stock}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Pilih barang retail yang akan dimasukkan ke keranjang.</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Jumlah</label>
                  <input type="number" min={1} value={inputQty} onChange={(e) => setInputQty(Number(e.target.value))}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">Jumlah kuantitas barang.</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Harga Satuan (Rp)</label>
                  <input type="number" value={inputPrice} onChange={(e) => setInputPrice(Number(e.target.value))}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">Harga per unit barang.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={addToCart} disabled={!selectedProductId}>
                  Tambahkan ke Keranjang
                </Button>
              </div>
            </div>

            {/* Cart table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700">Keranjang Item</h3>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <Table.Header>
                    <Table.Row className="bg-gray-50">
                      {["Kode", "Nama Produk", "Harga", "Qty", "Subtotal", "Aksi"].map((h) => (
                        <Table.Head key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</Table.Head>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {cart.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          Keranjang kosong. Tambahkan item di atas.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      cart.map((item) => (
                        <Table.Row key={item.productId} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <Table.Cell className="px-4 py-3 font-semibold text-gray-950">{item.code}</Table.Cell>
                          <Table.Cell className="px-4 py-3 font-medium text-gray-900">{item.name}</Table.Cell>
                          <Table.Cell className="px-4 py-3 text-right text-sm text-gray-900">Rp {formatNumber(item.unitPrice)}</Table.Cell>
                          <Table.Cell className="px-4 py-3 text-center">
                            <input type="number" min={1} value={item.quantity}
                              onChange={(e) => updateCartQty(item.productId, parseInt(e.target.value) || 1)}
                              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-center text-sm font-semibold outline-none focus:border-red-700"
                            />
                          </Table.Cell>
                          <Table.Cell className="px-4 py-3 text-right text-sm font-bold text-red-800">
                            Rp {formatNumber(item.quantity * item.unitPrice)}
                          </Table.Cell>
                          <Table.Cell className="px-4 py-3 text-center">
                            <button type="button" onClick={() => removeFromCart(item.productId)} className="text-rose-600 hover:text-rose-800">
                              <PiTrashDuotone className="mx-auto h-4 w-4" />
                            </button>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </div>

          {/* Checkout panel */}
          <div className="h-fit space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="border-b border-gray-200 pb-2 font-bold text-gray-800">Ringkasan Transaksi</h3>
            <form action={dispatch} className="space-y-4">
              <input type="hidden" name="type" value={type === "sale" ? ProductTxType.SALE : ProductTxType.PURCHASE} />
              <input type="hidden" name="items" value={JSON.stringify(cart)} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {type === "sale" ? "Nama Pembeli / Keterangan" : "Nama Supplier / Keterangan"}
                </label>
                <input type="text" name="notes" value={txNotes} onChange={(e) => setTxNotes(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {type === "sale" ? "Nama pembeli, customer, atau catatan penjualan." : "Nama pihak supplier penyedia barang grosir."}
                </p>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Jumlah Item:</span>
                  <span className="font-semibold">{cart.length} produk</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2 text-sm text-gray-600">
                  <span>Total Kuantitas:</span>
                  <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)} unit</span>
                </div>
                <div className="flex items-center justify-between pt-2 font-bold text-gray-900">
                  <span>Grand Total:</span>
                  <span className="text-xl font-extrabold text-red-700">Rp {formatNumber(cartTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={cart.length === 0} className="w-full">
                  Catat &amp; Simpan Transaksi
                </Button>
                <Button type="button" variant="neutral" className="w-full" onClick={onClose}>
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransaksiWorkspace({ transactions, products }: TransaksiWorkspaceProps) {
  const [txModalType, setTxModalType] = useState<TxFormType | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const [strukModal, setStrukModal] = useState<{ isOpen: boolean; transaction: any | null }>({
    isOpen: false,
    transaction: null,
  });

  const [actionState, dispatchAction] = useActionState<TxActionState, FormData>(
    recordTransactionAction,
    { success: false, message: "" }
  );

  useActionFeedback(actionState, () => {
    setTxModalType(null);
  });

  const filterConfig: ColumnFilterConfig[] = useMemo(() => [
    { key: "typeLabel", label: "Jenis Transaksi", type: "select", options: [
      { label: "Penjualan", value: "PENJUALAN" },
      { label: "Pembelian", value: "PEMBELIAN" },
      { label: "Penyesuaian", value: "PENYESUAIAN" },
    ]},
    { key: "notes", label: "Keterangan / Partner", type: "text", placeholder: "Cari keterangan atau pembeli..." },
    { key: "totalAmountVal", label: "Total Transaksi", type: "numberRange" },
    { key: "dateVal", label: "Tanggal", type: "dateRange" },
  ], []);

  const mappedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      const itemsCount = tx.items.reduce((sum, item) => sum + item.quantity, 0);
      const dateObj = new Date(tx.date);
      const dateFormatted = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      }).format(dateObj);
      const typeLabel =
        tx.type === ProductTxType.SALE ? "PENJUALAN"
        : tx.type === ProductTxType.PURCHASE ? "PEMBELIAN"
        : "PENYESUAIAN";

      return {
        ...tx,
        dateVal: dateObj.getTime(),
        dateFormatted,
        typeLabel,
        totalAmountVal: Number(tx.totalAmount),
        itemsCount,
      };
    });
  }, [transactions]);

  const table = useCustomTable({
    items: mappedTransactions,
    initialSort: { key: "dateVal", direction: "desc" },
    initialPageSize: 10,
    advancedFilterConfig: filterConfig,
  });

  const exportColumns = [
    { label: "Tanggal Transaksi", key: "dateFormatted" },
    { label: "Jenis Transaksi", key: "typeLabel" },
    { label: "Keterangan", key: "notes" },
    { label: "Total Transaksi", key: "totalAmountVal" },
    { label: "Total Kuantitas", key: "itemsCount" },
  ];

  const navTabs = [
    { id: "list", label: "Riwayat Transaksi", icon: PiCalendarBlankDuotone, badge: formatNumber(transactions.length) },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <Can permission={PERMISSIONS.TOKO_MANAGE}>
        <div className="flex justify-end gap-2">
          <Button size="md" onClick={() => setTxModalType("sale")}>
            <PiShoppingCartDuotone className="h-4 w-4" />
            Catat Penjualan
          </Button>
          <Button size="md" variant="neutral" onClick={() => setTxModalType("purchase")}>
            <PiPackageDuotone className="h-4 w-4" />
            Catat Pembelian
          </Button>
        </div>
      </Can>

      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Tab nav */}
      <Tabs tabs={navTabs} activeTab="list" onChange={() => {}} />

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <DataTableFilters
          filterConfig={filterConfig}
          onFilterChange={table.setAdvancedFilters}
          currentFilters={table.advancedFilters}
        />
      </div>

      {/* Transaction list */}
      {table.paginatedItems.length === 0 ? (
        <EmptyState
          icon={PiCalendarBlankDuotone}
          title="Tidak ada riwayat transaksi"
          description="Mutasi transaksi toko Anda kosong atau filter tidak ada kecocokan."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <Table.Header>
                <Table.Row className="bg-gray-50">
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Tanggal" sortKey="dateVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Jenis" sortKey="typeLabel" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Keterangan / Partner" sortKey="notes" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Total Transaksi" sortKey="totalAmountVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-end" />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Jumlah Barang" sortKey="itemsCount" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-center" />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Detail</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {table.paginatedItems.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  return (
                    <Table.Row key={tx.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <Table.Cell className="px-4 py-3 text-sm text-gray-900">{tx.dateFormatted}</Table.Cell>
                      <Table.Cell className="px-4 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                          tx.type === ProductTxType.SALE ? "border-red-200 bg-red-50 text-red-800"
                          : tx.type === ProductTxType.PURCHASE ? "border-orange-200 bg-orange-50 text-orange-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}>
                          {tx.typeLabel}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-3 font-medium text-gray-900">{tx.notes || "-"}</Table.Cell>
                      <Table.Cell className="px-4 py-3 text-right text-sm font-bold text-red-800">
                        {tx.type === ProductTxType.ADJUSTMENT ? "-" : `Rp ${formatNumber(tx.totalAmountVal)}`}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-3 text-center text-sm font-medium text-gray-600">{tx.itemsCount} unit</Table.Cell>
                      <Table.Cell className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900"
                        >
                          {isExpanded ? <>Tutup <PiCaretUpBold className="h-3 w-3" /></> : <>Lihat <PiCaretDownBold className="h-3 w-3" /></>}
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>

          {expandedTxId && (() => {
            const tx = table.paginatedItems.find((t) => t.id === expandedTxId);
            if (!tx) return null;
            return (
              <div className="m-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Rincian Item — {tx.notes || "Umum"} ({tx.dateFormatted})
                  </h4>
                  <Button size="sm" variant="neutral" onClick={() => setStrukModal({ isOpen: true, transaction: tx })}>
                    <PiPrinterDuotone className="mr-2 h-4 w-4" />
                    Cetak Struk
                  </Button>
                </div>
                <div className="space-y-2">
                  {tx.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                      <div>
                        <p className="font-semibold text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-400">Kode: {item.product.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.quantity} x Rp {formatNumber(Number(item.unitPrice))}</p>
                        {tx.type !== ProductTxType.ADJUSTMENT && (
                          <p className="text-xs font-bold text-red-700">Subtotal: Rp {formatNumber(Number(item.totalPrice))}</p>
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
            onExport={() => table.exportToCsv("Riwayat_Transaksi_Toko", exportColumns)}
            onExportExcel={() => table.exportToExcel("Riwayat_Transaksi_Toko", exportColumns)}
            onExportPdf={() => table.exportToPdf("Riwayat_Transaksi_Toko", exportColumns, "Riwayat Transaksi Toko Koperasi")}
            exportLabel="Export"
          />
        </>
      )}
      </div>

      {/* Transaction form modals */}
      {txModalType && (
        <TxFormModal
          type={txModalType}
          products={products}
          onClose={() => setTxModalType(null)}
          dispatch={dispatchAction}
        />
      )}

      {/* Print Struk Modal */}
      <PrintStrukModal
        isOpen={strukModal.isOpen}
        transaction={strukModal.transaction}
        onClose={() => setStrukModal({ isOpen: false, transaction: null })}
      />
    </div>
  );
}
