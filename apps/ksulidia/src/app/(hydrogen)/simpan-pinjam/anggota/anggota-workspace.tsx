"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  PiPlusBold,
  PiUsersThreeDuotone,
  PiBookOpenDuotone,
  PiArrowDownRightDuotone,
  PiArrowUpLeftDuotone,
  PiArrowDownRightBold,
  PiArrowUpLeftBold,
  PiUserCirclePlusDuotone,
  PiClockCounterClockwiseDuotone,
  PiXBold,
  PiWarningBold,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { formatNumber } from "@/lib/format";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import {
  createMemberAction,
  updateMemberAction,
  postSavingsTransactionAction,
  MemberActionState,
} from "./actions";
import { SavingsType, SavingsTxType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Table } from "rizzui";
import { useCustomTable, ColumnFilterConfig } from "@/lib/use-custom-table";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";
import { DataTableFilters } from "@/components/ui/table/DataTableFilters";
import { TableActionButton } from "@/components/ui/table/TableActionButton";
import { DateInput } from "@/components/ui/form/DateInput";
import { SAVINGS_TYPES } from "@/lib/constants";

type SavingsAccount = {
  id: string;
  type: SavingsType;
  balance: any; // Decimal
};

type ActiveLoan = {
  id: string;
  amount: any;
  installmentAmount: any;
  status: string;
};

type MemberWithAccounts = {
  id: string;
  no: number;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  isDeceased: boolean;
  savingsAccounts: SavingsAccount[];
  loans: ActiveLoan[];
};

type AnggotaWorkspaceProps = {
  members: MemberWithAccounts[];
};

function getSavingsBalance(
  member: MemberWithAccounts,
  type: SavingsType
): number {
  const acc = member.savingsAccounts.find((a) => a.type === type);
  return acc ? Number(acc.balance) : 0;
}

function getTotalSavings(member: MemberWithAccounts): number {
  return member.savingsAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );
}

export default function AnggotaWorkspace({ members }: AnggotaWorkspaceProps) {
  const [tab, setTab] = useState<"list" | "create" | "detail">("list");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  // Member details loaded dynamically
  const [memberDetail, setMemberDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Setoran / Penarikan Modal
  const [txModal, setTxModal] = useState<{
    isOpen: boolean;
    member: MemberWithAccounts | null;
    type: SavingsTxType;
  }>({
    isOpen: false,
    member: null,
    type: SavingsTxType.DEPOSIT,
  });

  // Action States
  const [createState, dispatchCreate] = useActionState<
    MemberActionState,
    FormData
  >(createMemberAction, { success: false, message: "" });

  const [txState, dispatchTx] = useActionState<MemberActionState, FormData>(
    postSavingsTransactionAction,
    { success: false, message: "" }
  );

  // Auto handle toast & reload
  useActionFeedback(createState, () => {
    setTab("list");
  });

  useActionFeedback(txState, () => {
    setTxModal({ isOpen: false, member: null, type: SavingsTxType.DEPOSIT });
    if (selectedMemberId) {
      loadMemberDetails(selectedMemberId);
    }
  });

  // Load member details dynamically
  const loadMemberDetails = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/ksulidia/anggota/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMemberDetail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedMemberId) {
      loadMemberDetails(selectedMemberId);
    } else {
      setMemberDetail(null);
    }
  }, [selectedMemberId]);

  // Precompute metrics for table
  const mappedMembers = useMemo(() => {
    return members.map((m) => ({
      ...m,
      pokok: getSavingsBalance(m, SavingsType.POKOK),
      wajib: getSavingsBalance(m, SavingsType.WAJIB),
      sukarela: getSavingsBalance(m, SavingsType.SUKARELA),
      totalSavings: getTotalSavings(m),
      activeLoanText:
        m.loans.length > 0
          ? `Ada (Rp ${formatNumber(Number(m.loans[0].amount))})`
          : "Tidak ada",
    }));
  }, [members]);

  const memberFilterConfig: ColumnFilterConfig[] = useMemo(
    () => [
      {
        key: "no",
        label: "Nomor Rapat Anggota Tahunan",
        type: "text",
        placeholder: "Cari nomor...",
      },
      {
        key: "name",
        label: "Nama Anggota",
        type: "text",
        placeholder: "Cari nama...",
      },
      {
        key: "phone",
        label: "Nomor Telepon",
        type: "text",
        placeholder: "Cari telepon...",
      },
      {
        key: "address",
        label: "Alamat",
        type: "text",
        placeholder: "Cari alamat...",
      },
      { key: "isDeceased", label: "Status Wafat", type: "boolean" },
      { key: "pokok", label: "Simpanan Pokok", type: "numberRange" },
      { key: "wajib", label: "Simpanan Wajib", type: "numberRange" },
      { key: "sukarela", label: "Simpanan Sukarela", type: "numberRange" },
    ],
    []
  );

  const table = useCustomTable({
    items: mappedMembers,
    initialSort: { key: "no", direction: "asc" },
    initialPageSize: 10,
    advancedFilterConfig: memberFilterConfig,
  });

  const txItems = useMemo(() => {
    if (!memberDetail?.savingsTransactions) return [];
    return memberDetail.savingsTransactions.map((tx: any) => ({
      ...tx,
      formattedDate: new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(tx.date)),
    }));
  }, [memberDetail]);

  const transactionFilterConfig: ColumnFilterConfig[] = useMemo(
    () => [
      {
        key: "type",
        label: "Jenis Mutasi",
        type: "select",
        options: [
          { label: "Setoran", value: "DEPOSIT" },
          { label: "Penarikan", value: "WITHDRAWAL" },
        ],
      },
      {
        key: "savingsType",
        label: "Jenis Simpanan",
        type: "select",
        options: [
          { label: "Simpanan Wajib", value: SAVINGS_TYPES.WAJIB },
          { label: "Simpanan Sukarela", value: SAVINGS_TYPES.SUKARELA },
          { label: "Simpanan Pokok", value: SAVINGS_TYPES.POKOK },
        ],
      },
      {
        key: "description",
        label: "Keterangan",
        type: "text",
        placeholder: "Cari keterangan...",
      },
    ],
    []
  );

  const txTable = useCustomTable({
    items: txItems,
    initialSort: { key: "date", direction: "desc" },
    initialPageSize: 10,
    advancedFilterConfig: transactionFilterConfig,
  });

  const selectedMemberObj = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

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
          <PiUsersThreeDuotone className="h-4 w-4" />
          Daftar Anggota
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatNumber(members.length)}
          </span>
        </button>

        {selectedMemberObj && (
          <button
            type="button"
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === "detail"
                ? "border-red-700 text-red-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setTab("detail")}
          >
            <PiBookOpenDuotone className="h-4 w-4" />
            Buku Tabungan: {selectedMemberObj.name}
          </button>
        )}

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
          Tambah Anggota
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "create" ? (
        <div>
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-950">
              Daftarkan Anggota Baru
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Masukkan data diri lengkap anggota baru koperasi.
            </p>
          </div>

          <form action={dispatchCreate}>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {createState.message ? (
                <div
                  className={
                    createState.success
                      ? "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 md:col-span-2"
                      : "rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 md:col-span-2"
                  }
                >
                  {createState.message}
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Nomor Anggota (RAT)
                </label>
                <input
                  type="number"
                  name="no"
                  required
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nomor urut anggota dalam buku Rapat Anggota Tahunan (RAT).
                </p>
                {createState.errors?.no && (
                  <p className="mt-1 text-xs text-rose-700">
                    {createState.errors.no[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nama lengkap sesuai dengan KTP anggota.
                </p>
                {createState.errors?.name && (
                  <p className="mt-1 text-xs text-rose-700">
                    {createState.errors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Nomor Telepon (Optional)
                </label>
                <input
                  type="text"
                  name="phone"
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nomor telepon aktif (WhatsApp) untuk mempermudah komunikasi.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Alamat (Optional)
                </label>
                <textarea
                  name="address"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alamat tempat tinggal saat ini sesuai domisili.
                </p>
              </div>
            </div>

            <div className="flex justify-end rounded-b-md border-t border-gray-200 bg-gray-50/50 px-5 py-4">
              <Button type="submit" size="md">
                <PiUserCirclePlusDuotone className="mr-2 h-4 w-4" />
                Daftarkan Anggota
              </Button>
            </div>
          </form>
        </div>
      ) : tab === "detail" ? (
        <div className="space-y-6 p-6">
          {isLoadingDetail ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Memuat mutasi buku tabungan...
            </div>
          ) : !memberDetail ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Data anggota tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-6">
              {memberDetail.isDeceased && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                  <PiWarningBold className="h-5 w-5 shrink-0" />
                  <span>
                    Anggota ini telah dinyatakan Meninggal Dunia (Wafat). Semua
                    transaksi simpan-pinjam ditutup sementara untuk proses ahli
                    waris.
                  </span>
                </div>
              )}

              {/* Member Summary Header */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-red-100 bg-red-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
                    Simpanan Pokok
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rp{" "}
                    {formatNumber(
                      getSavingsBalance(memberDetail, SavingsType.POKOK)
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
                    Simpanan Wajib
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rp{" "}
                    {formatNumber(
                      getSavingsBalance(memberDetail, SavingsType.WAJIB)
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
                    Simpanan Sukarela
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rp{" "}
                    {formatNumber(
                      getSavingsBalance(memberDetail, SavingsType.SUKARELA)
                    )}
                  </p>
                </div>
                <div className="border-primary/30 bg-primary rounded-lg border p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-100">
                    Total Simpanan
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    Rp {formatNumber(getTotalSavings(memberDetail))}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={memberDetail.isDeceased}
                  onClick={() =>
                    setTxModal({
                      isOpen: true,
                      member: memberDetail,
                      type: SavingsTxType.DEPOSIT,
                    })
                  }
                >
                  <PiArrowDownRightBold className="mr-1 h-3.5 w-3.5" />
                  Setor Tunai
                </Button>
                <Button
                  size="sm"
                  variant="primary-soft"
                  disabled={memberDetail.isDeceased}
                  onClick={() =>
                    setTxModal({
                      isOpen: true,
                      member: memberDetail,
                      type: SavingsTxType.WITHDRAWAL,
                    })
                  }
                >
                  <PiArrowUpLeftBold className="mr-1 h-3.5 w-3.5" />
                  Penarikan Saldo
                </Button>
              </div>

              {/* Savings Mutasi Table */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-500">
                    <PiClockCounterClockwiseDuotone className="mr-2 h-4 w-4 text-gray-400" />
                    Mutasi Buku Tabungan
                  </h3>
                  <DataTableFilters
                    filterConfig={transactionFilterConfig}
                    onFilterChange={txTable.setAdvancedFilters}
                    currentFilters={txTable.advancedFilters}
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>
                          <SortableHeader
                            label="Tanggal"
                            sortKey="date"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Mutasi"
                            sortKey="type"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Simpanan"
                            sortKey="savingsType"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Jumlah"
                            sortKey="amount"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                            className="w-full justify-end"
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Keterangan"
                            sortKey="description"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {txTable.paginatedItems.length === 0 ? (
                        <Table.Row>
                          <Table.Cell
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            Belum ada riwayat transaksi simpanan.
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        txTable.paginatedItems.map((tx: any) => (
                          <Table.Row
                            key={tx.id}
                            className="hover:bg-gray-50/50"
                          >
                            <Table.Cell>{tx.formattedDate}</Table.Cell>
                            <Table.Cell>
                              <span
                                className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                                  tx.type === SavingsTxType.DEPOSIT
                                    ? "border-green-200 bg-green-50 text-green-800"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                                }`}
                              >
                                {tx.type === SavingsTxType.DEPOSIT
                                  ? "SETOR"
                                  : "TARIK"}
                              </span>
                            </Table.Cell>
                            <Table.Cell>{tx.savingsType}</Table.Cell>
                            <Table.Cell
                              className={`px-4 py-3 text-right font-bold ${
                                tx.type === SavingsTxType.DEPOSIT
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {tx.type === SavingsTxType.DEPOSIT ? "+" : "-"} Rp{" "}
                              {formatNumber(Number(tx.amount))}
                            </Table.Cell>
                            <Table.Cell>{tx.description || "-"}</Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </div>
                {txTable.totalItems > 0 && (
                  <TableControls
                    currentPage={txTable.currentPage}
                    totalPages={txTable.totalPages}
                    pageSize={txTable.pageSize}
                    totalItems={txTable.totalItems}
                    startIndex={txTable.startIndex}
                    endIndex={txTable.endIndex}
                    onPageChange={txTable.setCurrentPage}
                    onPageSizeChange={txTable.setPageSize}
                    onExport={() => {
                      txTable.exportToCsv(`Mutasi_${memberDetail.name}`, [
                        { label: "Tanggal", key: "formattedDate" },
                        { label: "Mutasi", key: "type" },
                        { label: "Jenis Simpanan", key: "savingsType" },
                        { label: "Jumlah", key: "amount" },
                        { label: "Keterangan", key: "description" },
                      ]);
                    }}
                    exportLabel="Unduh Mutasi Buku"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Filters */}
          <DataTableFilters
            filterConfig={memberFilterConfig}
            onFilterChange={table.setAdvancedFilters}
            currentFilters={table.advancedFilters}
          />

          {/* Member List Table */}
          {table.paginatedItems.length === 0 ? (
            <EmptyState
              icon={PiUsersThreeDuotone}
              title="Tidak ada anggota ditemukan"
              description="Pastikan kata kunci pencarian Anda benar atau tambahkan anggota baru."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>
                        <SortableHeader
                          label="No. RAT"
                          sortKey="no"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Nama Anggota"
                          sortKey="name"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Pokok"
                          sortKey="pokok"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Wajib"
                          sortKey="wajib"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Sukarela"
                          sortKey="sukarela"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Total Simpanan"
                          sortKey="totalSavings"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end text-red-800"
                        />
                      </Table.Head>
                      <Table.Head>Pinjaman Aktif</Table.Head>
                      <Table.Head>Aksi</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {table.paginatedItems.map((m) => {
                      const hasActiveLoan = m.loans.length > 0;
                      return (
                        <Table.Row key={m.id} className="hover:bg-gray-50/50">
                          <Table.Cell>{m.no}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {m.name}
                              </p>
                              {m.isDeceased && (
                                <span className="inline-flex rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800 dark:bg-red-950 dark:text-red-300">
                                  Wafat
                                </span>
                              )}
                            </div>
                            {m.phone && (
                              <p className="text-xs text-gray-400">{m.phone}</p>
                            )}
                          </Table.Cell>
                          <Table.Cell>Rp {formatNumber(m.pokok)}</Table.Cell>
                          <Table.Cell>Rp {formatNumber(m.wajib)}</Table.Cell>
                          <Table.Cell>Rp {formatNumber(m.sukarela)}</Table.Cell>
                          <Table.Cell>
                            Rp {formatNumber(m.totalSavings)}
                          </Table.Cell>
                          <Table.Cell>
                            {hasActiveLoan ? (
                              <div className="flex flex-col gap-0.5 text-left">
                                <span className="font-semibold text-gray-900">
                                  Rp {formatNumber(Number(m.loans[0].amount))}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                                  Pinjaman Aktif
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Tidak ada
                              </span>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <TableActionButton
                              icon={PiBookOpenDuotone}
                              label="Mutasi"
                              variant="primary-soft"
                              onClick={() => {
                                setSelectedMemberId(m.id);
                                setTab("detail");
                              }}
                            />
                            <TableActionButton
                              icon={PiArrowDownRightDuotone}
                              label="Setor"
                              variant="primary"
                              disabled={m.isDeceased}
                              onClick={() =>
                                setTxModal({
                                  isOpen: true,
                                  member: m,
                                  type: SavingsTxType.DEPOSIT,
                                })
                              }
                            />
                            <TableActionButton
                              icon={PiArrowUpLeftDuotone}
                              label="Tarik"
                              variant="warning"
                              disabled={m.isDeceased}
                              onClick={() =>
                                setTxModal({
                                  isOpen: true,
                                  member: m,
                                  type: SavingsTxType.WITHDRAWAL,
                                })
                              }
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
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
                  table.exportToCsv("Daftar_Anggota_Koperasi", [
                    { label: "No. RAT", key: "no" },
                    { label: "Nama Anggota", key: "name" },
                    { label: "Nomor Telepon", key: "phone" },
                    { label: "Alamat", key: "address" },
                    { label: "Simpanan Pokok", key: "pokok" },
                    { label: "Simpanan Wajib", key: "wajib" },
                    { label: "Simpanan Sukarela", key: "sukarela" },
                    { label: "Total Simpanan", key: "totalSavings" },
                    { label: "Status Pinjaman", key: "activeLoanText" },
                  ]);
                }}
                exportLabel="Unduh Data Anggota"
              />
            </>
          )}
        </div>
      )}

      {/* Custom Transaction Dialog Modal */}
      {txModal.isOpen && txModal.member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() =>
                setTxModal({
                  isOpen: false,
                  member: null,
                  type: SavingsTxType.DEPOSIT,
                })
              }
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Pencatatan{" "}
              {txModal.type === SavingsTxType.DEPOSIT
                ? "Setoran Tunai"
                : "Penarikan Saldo"}
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              Anggota:{" "}
              <span className="font-semibold text-gray-900">
                {txModal.member.name} (No. {txModal.member.no})
              </span>
            </p>

            <form action={dispatchTx} className="space-y-4">
              <input type="hidden" name="memberId" value={txModal.member.id} />
              <input type="hidden" name="type" value={txModal.type} />

              <DateInput
                name="transactionDate"
                label="Tanggal Transaksi"
                helperText="Tanggal pencatatan transaksi simpanan ini."
                tooltipContent="Secara default adalah tanggal hari ini, dapat diubah sesuai tanggal transaksi."
                defaultValue={new Date()} // Always defaults to today
                required
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jenis Simpanan
                </label>
                <select
                  name="savingsType"
                  defaultValue={SavingsType.WAJIB}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                >
                  <option value={SavingsType.WAJIB}>Simpanan Wajib</option>
                  <option value={SavingsType.SUKARELA}>
                    Simpanan Sukarela
                  </option>
                  <option value={SavingsType.POKOK}>Simpanan Pokok</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Pilih pos simpanan yang dituju (Wajib bulanan, Sukarela
                  tabungan biasa, atau Pokok pendirian).
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nominal (Rupiah)
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min={100}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Jumlah nominal uang tunai dalam Rupiah (minimal Rp 100).
                </p>
                {txState.errors?.amount && (
                  <p className="mt-1 text-xs text-red-600">
                    {txState.errors.amount[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Keterangan / Catatan
                </label>
                <input
                  type="text"
                  name="description"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Keterangan opsional sebagai catatan bukti transaksi.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() =>
                    setTxModal({
                      isOpen: false,
                      member: null,
                      type: SavingsTxType.DEPOSIT,
                    })
                  }
                >
                  Batal
                </Button>
                <Button type="submit">Catat Transaksi</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
