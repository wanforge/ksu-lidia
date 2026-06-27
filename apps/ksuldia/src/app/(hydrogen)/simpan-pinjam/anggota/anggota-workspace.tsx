"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiUsersThreeDuotone,
  PiBookOpenDuotone,
  PiArrowDownRightBold,
  PiArrowUpLeftBold,
  PiUserCirclePlusDuotone,
  PiClockCounterClockwiseDuotone,
  PiXBold,
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
import { useCustomTable } from "@/lib/use-custom-table";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";

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

  const table = useCustomTable({
    items: mappedMembers,
    initialSort: { key: "no", direction: "asc" },
    initialPageSize: 10,
    searchFields: ["name", "no", "phone", "address"],
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

  const txTable = useCustomTable({
    items: txItems,
    initialSort: { key: "date", direction: "desc" },
    initialPageSize: 10,
    searchFields: ["savingsType", "type", "description", "formattedDate"],
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
              ? "border-teal-700 text-teal-700"
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
                ? "border-teal-700 text-teal-700"
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
              ? "border-teal-700 text-teal-700"
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
        <div className="max-w-xl p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Registrasi Anggota Baru
          </h2>
          <form action={dispatchCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomor Anggota (No. RAT)
              </label>
              <input
                type="number"
                name="no"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="Contoh: 301"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nomor urut anggota dalam buku Rapat Anggota Tahunan (RAT).
              </p>
              {createState.errors?.no && (
                <p className="mt-1 text-xs text-red-600">
                  {createState.errors.no[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="Nama lengkap anggota"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nama lengkap sesuai dengan KTP anggota.
              </p>
              {createState.errors?.name && (
                <p className="mt-1 text-xs text-red-600">
                  {createState.errors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomor Telepon (Optional)
              </label>
              <input
                type="text"
                name="phone"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="081xxxxxxxx"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nomor telepon aktif (WhatsApp) untuk mempermudah komunikasi.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alamat (Optional)
              </label>
              <textarea
                name="address"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                placeholder="Alamat domisili"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                Alamat tempat tinggal saat ini sesuai domisili.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="bg-teal-700 text-white hover:bg-teal-800"
              >
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
              {/* Member Summary Header */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                    Simpanan Pokok
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rp{" "}
                    {formatNumber(
                      getSavingsBalance(memberDetail, SavingsType.POKOK)
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                    Simpanan Wajib
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rp{" "}
                    {formatNumber(
                      getSavingsBalance(memberDetail, SavingsType.WAJIB)
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                    Simpanan Sukarela
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    Rp{" "}
                    {formatNumber(
                      getSavingsBalance(memberDetail, SavingsType.SUKARELA)
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-teal-200 bg-teal-600 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">
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
                  className="bg-teal-700 text-white hover:bg-teal-800"
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
                  className="border-teal-700 text-teal-700 hover:bg-teal-50"
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
                  <label className="relative max-w-xs flex-1">
                    <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={txTable.searchQuery}
                      onChange={(e) => txTable.setSearchQuery(e.target.value)}
                      placeholder="Cari jenis, mutasi, ket..."
                      className="w-full rounded border border-gray-300 bg-white py-1 pl-8 pr-2 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-700"
                    />
                  </label>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">
                          <SortableHeader
                            label="Tanggal"
                            sortKey="date"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </th>
                        <th className="px-4 py-3">
                          <SortableHeader
                            label="Mutasi"
                            sortKey="type"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </th>
                        <th className="px-4 py-3">
                          <SortableHeader
                            label="Simpanan"
                            sortKey="savingsType"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </th>
                        <th className="px-4 py-3 text-right">
                          <SortableHeader
                            label="Jumlah"
                            sortKey="amount"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                            className="w-full justify-end"
                          />
                        </th>
                        <th className="px-4 py-3">
                          <SortableHeader
                            label="Keterangan"
                            sortKey="description"
                            activeSortKey={txTable.sortConfig.key as string}
                            activeDirection={txTable.sortConfig.direction}
                            onSort={txTable.handleSort}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {txTable.paginatedItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            Belum ada riwayat transaksi simpanan.
                          </td>
                        </tr>
                      ) : (
                        txTable.paginatedItems.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3">{tx.formattedDate}</td>
                            <td className="px-4 py-3">
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
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {tx.savingsType}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${
                                tx.type === SavingsTxType.DEPOSIT
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {tx.type === SavingsTxType.DEPOSIT ? "+" : "-"} Rp{" "}
                              {formatNumber(Number(tx.amount))}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {tx.description || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
          <div className="flex border-b border-gray-200 p-4">
            <label className="relative max-w-md flex-1">
              <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={table.searchQuery}
                onChange={(e) => table.setSearchQuery(e.target.value)}
                placeholder="Cari nomor RAT, nama anggota..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-700"
              />
            </label>
          </div>

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
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">
                        <SortableHeader
                          label="No. RAT"
                          sortKey="no"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3">
                        <SortableHeader
                          label="Nama Anggota"
                          sortKey="name"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <SortableHeader
                          label="Pokok"
                          sortKey="pokok"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <SortableHeader
                          label="Wajib"
                          sortKey="wajib"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <SortableHeader
                          label="Sukarela"
                          sortKey="sukarela"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <SortableHeader
                          label="Total Simpanan"
                          sortKey="totalSavings"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end text-teal-800"
                        />
                      </th>
                      <th className="px-4 py-3 text-center">Pinjaman Aktif</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.paginatedItems.map((m) => {
                      const hasActiveLoan = m.loans.length > 0;
                      return (
                        <tr key={m.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {m.no}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {m.name}
                            </p>
                            {m.phone && (
                              <p className="text-xs text-gray-400">{m.phone}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            Rp {formatNumber(m.pokok)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            Rp {formatNumber(m.wajib)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            Rp {formatNumber(m.sukarela)}
                          </td>
                          <td className="bg-teal-50/10 px-4 py-3 text-right font-bold text-teal-800">
                            Rp {formatNumber(m.totalSavings)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasActiveLoan ? (
                              <span className="inline-flex rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800">
                                Ada (Rp{" "}
                                {formatNumber(Number(m.loans[0].amount))})
                              </span>
                            ) : (
                              <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-500">
                                Tidak ada
                              </span>
                            )}
                          </td>
                          <td className="flex items-center justify-center gap-1.5 px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="primary-soft"
                              className="border-teal-600 text-teal-700 hover:bg-teal-50"
                              onClick={() => {
                                setSelectedMemberId(m.id);
                                setTab("detail");
                              }}
                            >
                              Mutasi
                            </Button>
                            <Button
                              size="sm"
                              className="bg-teal-700 text-white hover:bg-teal-800"
                              onClick={() =>
                                setTxModal({
                                  isOpen: true,
                                  member: m,
                                  type: SavingsTxType.DEPOSIT,
                                })
                              }
                            >
                              Setor
                            </Button>
                            <Button
                              size="sm"
                              variant="neutral"
                              className="border-amber-600 text-amber-700 hover:bg-amber-50"
                              onClick={() =>
                                setTxModal({
                                  isOpen: true,
                                  member: m,
                                  type: SavingsTxType.WITHDRAWAL,
                                })
                              }
                            >
                              Tarik
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
          <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
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

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jenis Simpanan
                </label>
                <select
                  name="savingsType"
                  defaultValue={SavingsType.WAJIB}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  placeholder="Contoh: 50000"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  placeholder="Contoh: Setoran Wajib Bulanan Mei"
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
                <Button
                  type="submit"
                  className="bg-teal-700 text-white hover:bg-teal-800"
                >
                  Catat Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
