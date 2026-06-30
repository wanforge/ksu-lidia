"use client";

import { useActionState, useMemo, useState } from "react";
import {
  PiPlusDuotone,
  PiBarcodeDuotone,
  PiPencilSimpleDuotone,
  PiWrenchDuotone,
  PiTrashDuotone,
  PiXBold,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { formatNumber } from "@/lib/format";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import {
  createProductAction,
  updateProductAction,
  adjustProductStockAction,
  bulkDeleteProductsAction,
  ProductActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { useCustomTable, ColumnFilterConfig } from "@/lib/use-custom-table";
import { Table } from "@/components/ui/table";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";
import { DataTableFilters } from "@/components/ui/table/DataTableFilters";
import { Tabs } from "@/components/ui/Tabs";
import { TableActionsMenu, TableAction } from "@/components/ui/table/TableActionsMenu";
import { Can } from "@/components/rbac/can";
import { PERMISSIONS } from "@/lib/rbac/permissions";

type Product = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  stock: number;
  minStock: number;
  purchasePrice: any;
  sellingPrice: any;
};

type ProdukWorkspaceProps = {
  products: Product[];
};

export default function ProdukWorkspace({ products }: ProdukWorkspaceProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editModal, setEditModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
  const [adjModal, setAdjModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });

  const [createState, dispatchCreate] = useActionState<ProductActionState, FormData>(
    createProductAction, { success: false, message: "" }
  );
  const [updateState, dispatchUpdate] = useActionState<ProductActionState, FormData>(
    updateProductAction, { success: false, message: "" }
  );
  const [adjState, dispatchAdj] = useActionState<ProductActionState, FormData>(
    adjustProductStockAction, { success: false, message: "" }
  );

  useActionFeedback(createState, () => setIsCreateModalOpen(false));
  useActionFeedback(updateState, () => setEditModal({ isOpen: false, product: null }));
  useActionFeedback(adjState, () => setAdjModal({ isOpen: false, product: null }));

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set).sort().map((c) => ({ label: c, value: c }));
  }, [products]);

  const mappedProducts = useMemo(() => {
    return products.map((p) => {
      const marginVal = Number(p.sellingPrice) - Number(p.purchasePrice);
      const markupPct = Number(p.purchasePrice) > 0 ? (marginVal / Number(p.purchasePrice)) * 100 : 0;
      return {
        ...p,
        categoryText: p.category || "-",
        purchasePriceVal: Number(p.purchasePrice),
        sellingPriceVal: Number(p.sellingPrice),
        marginVal,
        markupPct,
      };
    });
  }, [products]);

  const filterConfig: ColumnFilterConfig[] = useMemo(() => [
    { key: "name", label: "Nama / Kode Produk", type: "text", placeholder: "Cari nama atau kode..." },
    { key: "categoryText", label: "Kategori", type: "select", options: categoryOptions },
    { key: "stock", label: "Stok Fisik", type: "numberRange" },
    { key: "sellingPriceVal", label: "Harga Jual", type: "numberRange" },
  ], [categoryOptions]);

  const table = useCustomTable({
    items: mappedProducts,
    initialSort: { key: "name", direction: "asc" },
    initialPageSize: 10,
    advancedFilterConfig: filterConfig,
  });

  const exportColumns = [
    { label: "Kode", key: "code" },
    { label: "Nama Produk", key: "name" },
    { label: "Kategori", key: "categoryText" },
    { label: "Stok Fisik", key: "stock" },
    { label: "Harga Beli", key: "purchasePriceVal" },
    { label: "Harga Jual", key: "sellingPriceVal" },
    { label: "Margin", key: "marginVal" },
    { label: "Markup (%)", key: "markupPct" },
  ];

  const navTabs = [
    { id: "list", label: "Katalog Produk", icon: PiBarcodeDuotone, badge: formatNumber(products.length) },
  ];

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Tab navigation */}
      <Tabs tabs={navTabs} activeTab="list" onChange={() => {}} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 p-4">
        <DataTableFilters
          filterConfig={filterConfig}
          onFilterChange={table.setAdvancedFilters}
          currentFilters={table.advancedFilters}
        />
        <Can permission={PERMISSIONS.TOKO_MANAGE}>
          <Button size="md" onClick={() => setIsCreateModalOpen(true)}>
            <PiPlusDuotone className="h-4 w-4" />
            Tambah Produk
          </Button>
        </Can>
      </div>

      {/* Table */}
      {table.paginatedItems.length === 0 ? (
        <EmptyState
          icon={PiBarcodeDuotone}
          title="Produk tidak ditemukan"
          description="Katalog produk kosong atau filter Anda tidak memiliki kecocokan."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <Table.Header>
                <Table.Row className="bg-gray-50">
                  <Table.Head className="w-12 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={table.paginatedItems.length > 0 && table.paginatedItems.every((item) => selectedIds.has(item.id))}
                      onChange={(e) => {
                        const next = new Set(selectedIds);
                        if (e.target.checked) table.paginatedItems.forEach((item) => next.add(item.id));
                        else table.paginatedItems.forEach((item) => next.delete(item.id));
                        setSelectedIds(next);
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                    />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Kode" sortKey="code" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Nama Produk" sortKey="name" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Kategori" sortKey="categoryText" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Stok Fisik" sortKey="stock" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-center" />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Harga Beli" sortKey="purchasePriceVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-end" />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Harga Jual" sortKey="sellingPriceVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-end" />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableHeader label="Margin / Markup" sortKey="marginVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-end" />
                  </Table.Head>
                  <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Aksi</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {table.paginatedItems.map((p) => {
                  const actions: TableAction[] = [
                    { label: "Ubah Data", icon: PiPencilSimpleDuotone, onClick: () => setEditModal({ isOpen: true, product: p as any }) },
                    { label: "Opname Stok", icon: PiWrenchDuotone, onClick: () => setAdjModal({ isOpen: true, product: p as any }) },
                  ];
                  return (
                    <Table.Row key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <Table.Cell className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(p.id);
                            else next.delete(p.id);
                            setSelectedIds(next);
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                        />
                      </Table.Cell>
                      <Table.Cell className="px-4 py-3 font-semibold text-gray-950">{p.code}</Table.Cell>
                      <Table.Cell className="px-4 py-3 font-medium text-gray-900">{p.name}</Table.Cell>
                      <Table.Cell className="px-4 py-3">
                        {p.category ? (
                          <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-xs text-red-800">{p.category}</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className={`px-4 py-3 text-center font-bold ${p.stock <= p.minStock ? "text-rose-600" : "text-gray-900"}`}>
                        {p.stock}
                      </Table.Cell>
                      <Table.Cell className="px-4 py-3 text-right text-sm text-gray-900">Rp {formatNumber(p.purchasePriceVal)}</Table.Cell>
                      <Table.Cell className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rp {formatNumber(p.sellingPriceVal)}</Table.Cell>
                      <Table.Cell className="px-4 py-3 text-right text-xs text-gray-500">
                        <span className="font-semibold text-green-700">Rp {formatNumber(p.marginVal)}</span>{" "}
                        ({p.markupPct.toFixed(0)}%)
                      </Table.Cell>
                      <Table.Cell className="px-4 py-3 text-center">
                        <Can permission={PERMISSIONS.TOKO_MANAGE}>
                          <TableActionsMenu actions={actions} />
                        </Can>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            {selectedIds.size > 0 && (
              <Can permission={PERMISSIONS.TOKO_MANAGE}>
                <Button
                  variant="ghost"
                  className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                  disabled={isBulkDeleting}
                  onClick={async () => {
                    if (confirm(`Yakin ingin menghapus ${selectedIds.size} produk terpilih?`)) {
                      setIsBulkDeleting(true);
                      const res = await bulkDeleteProductsAction(Array.from(selectedIds));
                      if (res.success) setSelectedIds(new Set());
                      else alert(res.message);
                      setIsBulkDeleting(false);
                    }
                  }}
                >
                  <PiTrashDuotone className="mr-2 h-4 w-4" />
                  Hapus {selectedIds.size} Terpilih
                </Button>
              </Can>
            )}
            <TableControls
              currentPage={table.currentPage}
              totalPages={table.totalPages}
              pageSize={table.pageSize}
              totalItems={table.totalItems}
              startIndex={table.startIndex}
              endIndex={table.endIndex}
              onPageChange={table.setCurrentPage}
              onPageSizeChange={table.setPageSize}
              onExport={() => table.exportToCsv("Katalog_Produk_Toko", exportColumns)}
              onExportExcel={() => table.exportToExcel("Katalog_Produk_Toko", exportColumns)}
              onExportPdf={() => table.exportToPdf("Katalog_Produk_Toko", exportColumns, "Katalog Produk Toko Koperasi")}
              exportLabel="Export Katalog"
            />
          </div>
        </>
      )}

      {/* ── Modal: Tambah Produk ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">Daftarkan Produk Baru</h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <PiXBold className="h-5 w-5" />
              </button>
            </div>
            <form action={dispatchCreate} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Kode / Barcode Produk</label>
                <input type="text" name="code" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Kode unik atau barcode pembeda untuk setiap barang.</p>
                {createState.errors?.code && <p className="mt-1 text-xs text-red-600">{createState.errors.code[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Produk</label>
                <input type="text" name="name" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Nama lengkap produk retail beserta ukurannya.</p>
                {createState.errors?.name && <p className="mt-1 text-xs text-red-600">{createState.errors.name[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Kategori Produk (Opsional)</label>
                <input type="text" name="category" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Grup penggolongan tipe produk untuk filter katalog.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stok Awal</label>
                  <input type="number" name="stock" defaultValue={0} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Stok awal fisik.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Minimal Stok</label>
                  <input type="number" name="minStock" defaultValue={5} min={0} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Alert merah jika stok ≤ nilai ini.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
                  <input type="number" name="purchasePrice" defaultValue={0} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Harga modal beli.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Harga Jual (Rp)</label>
                  <input type="number" name="sellingPrice" defaultValue={0} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Harga jual retail.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <Button type="button" variant="neutral" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan Produk</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Produk ── */}
      {editModal.isOpen && editModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button onClick={() => setEditModal({ isOpen: false, product: null })} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <PiXBold className="h-5 w-5" />
            </button>
            <h3 className="mb-4 text-lg font-bold text-gray-900">Ubah Data Produk</h3>
            <form action={dispatchUpdate} className="space-y-4">
              <input type="hidden" name="productId" value={editModal.product.id} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Kode / Barcode</label>
                <input type="text" name="code" required defaultValue={editModal.product.code} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Kode unik atau barcode pembeda barang.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Produk</label>
                <input type="text" name="name" required defaultValue={editModal.product.name} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Nama lengkap produk retail.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
                <input type="text" name="category" defaultValue={editModal.product.category || ""} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Grup penggolongan tipe produk.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Minimal Stok</label>
                  <input type="number" name="minStock" min={0} defaultValue={editModal.product.minStock} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Alert stok rendah.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
                  <input type="number" name="purchasePrice" required defaultValue={Number(editModal.product.purchasePrice)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Harga modal beli.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Harga Jual (Rp)</label>
                  <input type="number" name="sellingPrice" required defaultValue={Number(editModal.product.sellingPrice)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                  <p className="mt-1 text-xs text-gray-500">Harga jual retail.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="neutral" onClick={() => setEditModal({ isOpen: false, product: null })}>Batal</Button>
                <Button type="submit">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Opname Stok ── */}
      {adjModal.isOpen && adjModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button onClick={() => setAdjModal({ isOpen: false, product: null })} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <PiXBold className="h-5 w-5" />
            </button>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Penyesuaian Stok (Opname Fisik)</h3>
            <p className="mb-4 text-sm text-gray-600">
              Produk: <span className="font-semibold text-gray-900">{adjModal.product.name} ({adjModal.product.code})</span><br />
              Stok Sistem Saat Ini: <span className="font-bold text-red-800">{adjModal.product.stock} unit</span>
            </p>
            <form action={dispatchAdj} className="space-y-4">
              <input type="hidden" name="productId" value={adjModal.product.id} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah Perubahan (Positif / Negatif)</label>
                <input type="number" name="quantity" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Nilai negatif (misal -5) untuk stok susut, positif (misal 5) jika stok bertambah.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Alasan Penyesuaian</label>
                <input type="text" name="reason" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700" />
                <p className="mt-1 text-xs text-gray-500">Catatan/keterangan penyebab perbedaan jumlah stok fisik.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="neutral" onClick={() => setAdjModal({ isOpen: false, product: null })}>Batal</Button>
                <Button type="submit">Simpan Penyesuaian</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
