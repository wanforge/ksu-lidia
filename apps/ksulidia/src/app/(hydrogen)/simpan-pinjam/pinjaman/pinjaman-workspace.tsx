"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiCoinsDuotone,
  PiHandCoinsDuotone,
  PiCheckCircleDuotone,
  PiWarningCircleDuotone,
  PiXBold,
  PiArrowRightBold,
} from "react-icons/pi";
import EmptyState from "@/app/(hydrogen)/_components/empty-state";
import { formatNumber } from "@/lib/format";
import { useActionFeedback } from "@/app/shared/use-action-feedback";
import {
  createLoanAction,
  payInstallmentAction,
  LoanActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Table } from "rizzui";
import { useCustomTable } from "@/lib/use-custom-table";
import { LOAN_STATUS, INSTALLMENT_STATUS } from "@/lib/constants";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";

type Installment = {
  id: string;
  monthNumber: number;
  principalPaid: any;
  interestPaid: any;
  penaltyPaid: any;
  totalPaid: any;
  dueDate: any;
  paidAt: any;
  status: string;
};

type LoanWithMember = {
  id: string;
  amount: any;
  interestRate: any;
  provisionRate: any;
  crkRate: any;
  penaltyRate: any;
  tenor: number;
  provision: any;
  crk: any;
  receivedAmount: any;
  installmentAmount: any;
  status: string;
  dateDisbursed: any;
  member: {
    no: number;
    name: string;
  };
  installments: Installment[];
};

type EligibleMember = {
  id: string;
  no: number;
  name: string;
};

type PinjamanWorkspaceProps = {
  loans: LoanWithMember[];
  eligibleMembers: EligibleMember[];
  defaultRates: {
    interestRate: number;
    provisionRate: number;
    crkRate: number;
    penaltyRate: number;
  };
};

export default function PinjamanWorkspace({
  loans,
  eligibleMembers,
  defaultRates,
}: PinjamanWorkspaceProps) {
  const [tab, setTab] = useState<"list" | "create" | "detail">("list");
  const [query, setQuery] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // New Loan Form State (for live calculations)
  const [formDataVal, setFormDataVal] = useState({
    memberId: "",
    amount: 10000000,
    interestRate: defaultRates.interestRate,
    provisionRate: defaultRates.provisionRate,
    crkRate: defaultRates.crkRate,
    penaltyRate: defaultRates.penaltyRate,
    tenor: 10,
  });

  // Pay Installment Modal State
  const [payModal, setPayModal] = useState<{
    isOpen: boolean;
    installment: Installment | null;
    loan: LoanWithMember | null;
    principal: number;
    interest: number;
    penalty: number;
    addPenalty: boolean;
  }>({
    isOpen: false,
    installment: null,
    loan: null,
    principal: 0,
    interest: 0,
    penalty: 0,
    addPenalty: false,
  });

  // Action states
  const [createState, dispatchCreate] = useActionState<
    LoanActionState,
    FormData
  >(createLoanAction, { success: false, message: "" });

  const [payState, dispatchPay] = useActionState<LoanActionState, FormData>(
    payInstallmentAction,
    { success: false, message: "" }
  );

  // Use action feedback
  useActionFeedback(createState, () => {
    setTab("list");
    setFormDataVal({
      memberId: "",
      amount: 10000000,
      interestRate: defaultRates.interestRate,
      provisionRate: defaultRates.provisionRate,
      crkRate: defaultRates.crkRate,
      penaltyRate: defaultRates.penaltyRate,
      tenor: 10,
    });
  });

  useActionFeedback(payState, () => {
    setPayModal({
      isOpen: false,
      installment: null,
      loan: null,
      principal: 0,
      interest: 0,
      penalty: 0,
      addPenalty: false,
    });
    // Let the workspace revalidate the state via path revalidation
  });

  // Live Loan Calculation
  const liveCalc = useMemo(() => {
    const amount = Number(formDataVal.amount) || 0;
    const rate = Number(formDataVal.interestRate) || 0;
    const provRate = Number(formDataVal.provisionRate) || 0;
    const cRate = Number(formDataVal.crkRate) || 0;
    const tenor = Number(formDataVal.tenor) || 1;

    const monthlyInterest = amount * (rate / 100);
    const provision = monthlyInterest * (provRate / 100);
    const crk = amount * (cRate / 100);
    const receivedAmount = amount - provision - crk;
    const installmentAmount = amount / tenor + monthlyInterest;

    return {
      monthlyInterest,
      provision,
      crk,
      receivedAmount,
      installmentAmount,
    };
  }, [formDataVal]);

  // Precompute loan metrics for sorting & exporting
  const mappedLoans = useMemo(() => {
    return loans.map((l) => {
      const paidCount = l.installments.filter(
        (i) => i.status === INSTALLMENT_STATUS.PAID
      ).length;
      return {
        ...l,
        memberName: l.member.name,
        memberNo: l.member.no.toString(),
        paidCount,
        progressText: `${paidCount}/${l.tenor}`,
        amountVal: Number(l.amount),
        installmentAmountVal: Number(l.installmentAmount),
        formattedDate: new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(l.dateDisbursed)),
      };
    });
  }, [loans]);

  const table = useCustomTable({
    items: mappedLoans,
    initialSort: { key: "dateDisbursed", direction: "desc" },
    initialPageSize: 10,
    searchFields: ["memberName", "memberNo", "status"],
  });

  const selectedLoan = useMemo(() => {
    return loans.find((l) => l.id === selectedLoanId) || null;
  }, [loans, selectedLoanId]);

  const mappedInstallments = useMemo(() => {
    if (!selectedLoan) return [];
    return selectedLoan.installments.map((inst) => {
      const base = Number(selectedLoan.amount) / selectedLoan.tenor;
      const interest =
        Number(selectedLoan.amount) * (Number(selectedLoan.interestRate) / 100);
      return {
        ...inst,
        dueDateFormatted: new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(inst.dueDate)),
        paidAtFormatted: inst.paidAt
          ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(inst.paidAt))
          : "-",
        principalVal: Number(inst.principalPaid) || base,
        interestVal: Number(inst.interestPaid) || interest,
        penaltyVal: Number(inst.penaltyPaid) || 0,
        totalVal: Number(inst.totalPaid) || base + interest,
      };
    });
  }, [selectedLoan]);

  const instTable = useCustomTable({
    items: mappedInstallments,
    initialSort: { key: "monthNumber", direction: "asc" },
    initialPageSize: 12,
    searchFields: ["status", "dueDateFormatted", "paidAtFormatted"],
  });

  // Setup default values for installment payment when modal opens
  const openPayModal = (loan: LoanWithMember, inst: Installment) => {
    const monthlyPrincipal = Number(loan.amount) / loan.tenor;
    const monthlyInterest =
      Number(loan.amount) * (Number(loan.interestRate) / 100);

    setPayModal({
      isOpen: true,
      installment: inst,
      loan,
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      penalty: 0,
      addPenalty: false,
    });
  };

  // Recalculate total if penalty is checked
  const payModalTotal = useMemo(() => {
    const base = payModal.principal + payModal.interest;
    if (payModal.addPenalty) {
      // Penalty based on penaltyRate (default 5%) of monthly principal installment
      const installmentAmount = payModal.principal;
      const penaltyAmount =
        installmentAmount * ((Number(payModal.loan?.penaltyRate) || 5.0) / 100);
      return {
        penalty: penaltyAmount,
        total: base + penaltyAmount,
      };
    }
    return {
      penalty: 0,
      total: base,
    };
  }, [payModal]);

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
          <PiHandCoinsDuotone className="h-4 w-4" />
          Daftar Pinjaman
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatNumber(loans.length)}
          </span>
        </button>

        {selectedLoan && (
          <button
            type="button"
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === "detail"
                ? "border-red-700 text-red-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setTab("detail")}
          >
            <PiCoinsDuotone className="h-4 w-4" />
            Kartu Angsuran: {selectedLoan.member.name}
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
          Cairkan Pinjaman Baru
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "create" ? (
        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_400px]">
          <div className="max-w-xl space-y-4">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Pengajuan & Pencairan Kredit
            </h2>
            <form action={dispatchCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Pilih Anggota Penerima
                </label>
                <select
                  name="memberId"
                  required
                  value={formDataVal.memberId}
                  onChange={(e) =>
                    setFormDataVal({ ...formDataVal, memberId: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {eligibleMembers.map((em) => (
                    <option key={em.id} value={em.id}>
                      [{em.no}] {em.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Pilih anggota terdaftar yang tidak memiliki pinjaman aktif
                  berjalan.
                </p>
                {createState.errors?.memberId && (
                  <p className="mt-1 text-xs text-red-600">
                    {createState.errors.memberId[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nominal Pinjaman (Rupiah)
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  value={formDataVal.amount}
                  onChange={(e) =>
                    setFormDataVal({
                      ...formDataVal,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Jumlah dana pinjaman yang diajukan oleh anggota.
                </p>
                {createState.errors?.amount && (
                  <p className="mt-1 text-xs text-red-600">
                    {createState.errors.amount[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bunga Flat Bulanan (%)
                  </label>
                  <input
                    type="number"
                    name="interestRate"
                    step="0.01"
                    required
                    value={formDataVal.interestRate}
                    onChange={(e) =>
                      setFormDataVal({
                        ...formDataVal,
                        interestRate: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Bunga pinjaman bulanan (%).
                  </p>
                  {createState.errors?.interestRate && (
                    <p className="mt-1 text-xs text-red-600">
                      {createState.errors.interestRate[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Potongan Provisi (%)
                  </label>
                  <input
                    type="number"
                    name="provisionRate"
                    step="0.01"
                    required
                    value={formDataVal.provisionRate}
                    onChange={(e) =>
                      setFormDataVal({
                        ...formDataVal,
                        provisionRate: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">% thd Bunga.</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Potongan CRK (%)
                  </label>
                  <input
                    type="number"
                    name="crkRate"
                    step="0.01"
                    required
                    value={formDataVal.crkRate}
                    onChange={(e) =>
                      setFormDataVal({
                        ...formDataVal,
                        crkRate: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">% thd Pokok.</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Denda Terlambat (%)
                  </label>
                  <input
                    type="number"
                    name="penaltyRate"
                    step="0.01"
                    required
                    value={formDataVal.penaltyRate}
                    onChange={(e) =>
                      setFormDataVal({
                        ...formDataVal,
                        penaltyRate: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Denda per keterlambatan.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tenor Jangka Waktu (Bulan)
                  </label>
                  <input
                    type="number"
                    name="tenor"
                    required
                    value={formDataVal.tenor}
                    onChange={(e) =>
                      setFormDataVal({
                        ...formDataVal,
                        tenor: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Jangka waktu pelunasan cicilan bulanan.
                  </p>
                  {createState.errors?.tenor && (
                    <p className="mt-1 text-xs text-red-600">
                      {createState.errors.tenor[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-red-700 text-white hover:bg-red-800"
                  disabled={!formDataVal.memberId}
                >
                  Cairkan Pinjaman
                </Button>
              </div>
            </form>
          </div>

          {/* Calculator Info Panel */}
          <div className="h-fit space-y-4 rounded-lg border border-red-100 bg-red-50/50 p-6">
            <h3 className="border-b border-red-200 pb-2 font-bold text-red-800">
              Simulasi Potongan & Angsuran
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Nilai Hutang:</span>
                <span className="font-semibold">
                  Rp {formatNumber(formDataVal.amount)}
                </span>
              </div>
              <div className="flex justify-between border-b border-red-100 pb-2">
                <span>Tenor:</span>
                <span className="font-semibold">{formDataVal.tenor} Bulan</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center text-rose-700">
                  Potongan Provisi ({formDataVal.provisionRate}% dari Bunga):
                </span>
                <span className="font-semibold text-rose-700">
                  - Rp {formatNumber(liveCalc.provision)}
                </span>
              </div>
              <div className="flex justify-between border-b border-red-100 pb-2">
                <span className="flex items-center text-rose-700">
                  Potongan CRK ({formDataVal.crkRate}% dari Pokok):
                </span>
                <span className="font-semibold text-rose-700">
                  - Rp {formatNumber(liveCalc.crk)}
                </span>
              </div>

              <div className="flex justify-between pt-1 font-bold text-gray-900">
                <span>Sisa Diterima Peminjam:</span>
                <span className="text-lg text-red-700">
                  Rp {formatNumber(liveCalc.receivedAmount)}
                </span>
              </div>

              <div className="my-4 space-y-2 border-t border-red-200 pt-3">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Detail Kewajiban Bulanan
                </p>
                <div className="flex justify-between">
                  <span>Angsuran Pokok:</span>
                  <span>
                    Rp {formatNumber(formDataVal.amount / formDataVal.tenor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bunga Berjalan ({formDataVal.interestRate}%):</span>
                  <span>Rp {formatNumber(liveCalc.monthlyInterest)}</span>
                </div>
                <div className="flex justify-between border-t border-red-100 pt-2 font-bold text-red-900">
                  <span>Angsuran per Bulan:</span>
                  <span>Rp {formatNumber(liveCalc.installmentAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : tab === "detail" ? (
        <div className="space-y-6 p-6">
          {selectedLoan && (
            <div>
              {/* Info Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Kartu Angsuran Pinjaman
                  </p>
                  <h2 className="text-xl font-bold text-gray-900">
                    [{selectedLoan.member.no}] {selectedLoan.member.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">
                    Status Pinjaman
                  </p>
                  <span
                    className={`inline-flex rounded-md border px-3 py-1 text-sm font-bold ${
                      selectedLoan.status === LOAN_STATUS.ACTIVE
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-green-200 bg-green-50 text-green-800"
                    }`}
                  >
                    {selectedLoan.status === LOAN_STATUS.ACTIVE
                      ? "AKTIF / BELUM LUNAS"
                      : "LUNAS"}
                  </span>
                </div>
              </div>

              {/* Loan parameters */}
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-5">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Hutang Awal
                  </p>
                  <p className="font-semibold text-gray-950">
                    Rp {formatNumber(Number(selectedLoan.amount))}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Tenor & Bunga
                  </p>
                  <p className="font-semibold text-gray-950">
                    {selectedLoan.tenor} bln @{" "}
                    {Number(selectedLoan.interestRate)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Potongan Provisi
                  </p>
                  <p className="font-semibold text-gray-950">
                    Rp {formatNumber(Number(selectedLoan.provision))}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Potongan CRK
                  </p>
                  <p className="font-semibold text-gray-950">
                    Rp {formatNumber(Number(selectedLoan.crk))}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Diterima Bersih
                  </p>
                  <p className="font-semibold text-red-800">
                    Rp {formatNumber(Number(selectedLoan.receivedAmount))}
                  </p>
                </div>
              </div>

              {/* Installments Ledger */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                    Jadwal Angsuran Bulanan
                  </h3>
                  <label className="relative max-w-xs flex-1">
                    <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={instTable.searchQuery}
                      onChange={(e) => instTable.setSearchQuery(e.target.value)}
                      placeholder="Cari status, jatuh tempo..."
                      className="w-full rounded border border-gray-300 bg-white py-1 pl-8 pr-2 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700"
                    />
                  </label>
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>
                          <SortableHeader
                            label="Bulan ke-"
                            sortKey="monthNumber"
                            activeSortKey={instTable.sortConfig.key as string}
                            activeDirection={instTable.sortConfig.direction}
                            onSort={instTable.handleSort}
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Jatuh Tempo"
                            sortKey="dueDate"
                            activeSortKey={instTable.sortConfig.key as string}
                            activeDirection={instTable.sortConfig.direction}
                            onSort={instTable.handleSort}
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Pokok"
                            sortKey="principalVal"
                            activeSortKey={instTable.sortConfig.key as string}
                            activeDirection={instTable.sortConfig.direction}
                            onSort={instTable.handleSort}
                            className="w-full justify-end"
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Bunga"
                            sortKey="interestVal"
                            activeSortKey={instTable.sortConfig.key as string}
                            activeDirection={instTable.sortConfig.direction}
                            onSort={instTable.handleSort}
                            className="w-full justify-end"
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Denda"
                            sortKey="penaltyVal"
                            activeSortKey={instTable.sortConfig.key as string}
                            activeDirection={instTable.sortConfig.direction}
                            onSort={instTable.handleSort}
                            className="w-full justify-end"
                          />
                        </Table.Head>
                        <Table.Head>
                          <SortableHeader
                            label="Total Tagihan"
                            sortKey="totalVal"
                            activeSortKey={instTable.sortConfig.key as string}
                            activeDirection={instTable.sortConfig.direction}
                            onSort={instTable.handleSort}
                            className="w-full justify-end text-red-800"
                          />
                        </Table.Head>
                        <Table.Head>Status</Table.Head>
                        <Table.Head>Tanggal Bayar</Table.Head>
                        <Table.Head>Aksi</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {instTable.paginatedItems.map((inst) => {
                        const isPaid = inst.status === INSTALLMENT_STATUS.PAID;
                        return (
                          <Table.Row
                            key={inst.id}
                            className="hover:bg-gray-50/50"
                          >
                            <Table.Cell>{inst.monthNumber}</Table.Cell>
                            <Table.Cell>{inst.dueDateFormatted}</Table.Cell>
                            <Table.Cell>
                              Rp {formatNumber(inst.principalVal)}
                            </Table.Cell>
                            <Table.Cell>
                              Rp {formatNumber(inst.interestVal)}
                            </Table.Cell>
                            <Table.Cell>
                              Rp {formatNumber(inst.penaltyVal)}
                            </Table.Cell>
                            <Table.Cell>
                              Rp {formatNumber(inst.totalVal)}
                            </Table.Cell>
                            <Table.Cell>
                              {isPaid ? (
                                <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                                  LUNAS
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                  BELUM BAYAR
                                </span>
                              )}
                            </Table.Cell>
                            <Table.Cell>{inst.paidAtFormatted}</Table.Cell>
                            <Table.Cell>
                              {!isPaid &&
                              selectedLoan.status === LOAN_STATUS.ACTIVE ? (
                                <Button
                                  size="sm"
                                  className="bg-red-700 text-white hover:bg-red-800"
                                  onClick={() =>
                                    openPayModal(selectedLoan, inst as any)
                                  }
                                >
                                  Bayar
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>
                {instTable.totalItems > 0 && (
                  <TableControls
                    currentPage={instTable.currentPage}
                    totalPages={instTable.totalPages}
                    pageSize={instTable.pageSize}
                    totalItems={instTable.totalItems}
                    startIndex={instTable.startIndex}
                    endIndex={instTable.endIndex}
                    onPageChange={instTable.setCurrentPage}
                    onPageSizeChange={instTable.setPageSize}
                    onExport={() => {
                      instTable.exportToCsv(
                        `Jadwal_Kredit_${selectedLoan.member.name}`,
                        [
                          { label: "Bulan ke-", key: "monthNumber" },
                          {
                            label: "Tanggal Jatuh Tempo",
                            key: "dueDateFormatted",
                          },
                          { label: "Pokok Angsuran", key: "principalVal" },
                          { label: "Bunga", key: "interestVal" },
                          { label: "Denda", key: "penaltyVal" },
                          { label: "Total Tagihan", key: "totalVal" },
                          { label: "Status", key: "status" },
                          {
                            label: "Tanggal Pembayaran",
                            key: "paidAtFormatted",
                          },
                        ]
                      );
                    }}
                    exportLabel="Unduh Jadwal Kredit"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 p-4">
            <div className="flex min-w-[220px] max-w-md flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-500">
                Cari Pinjaman
              </span>
              <label className="relative block">
                <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={table.searchQuery}
                  onChange={(e) => table.setSearchQuery(e.target.value)}
                  placeholder="Cari nama anggota, nomor RAT, status..."
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700"
                />
              </label>
            </div>
          </div>

          {/* Loans List Table */}
          {table.paginatedItems.length === 0 ? (
            <EmptyState
              icon={PiCoinsDuotone}
              title="Tidak ada data pinjaman"
              description="Pencarian Anda kosong atau belum ada pengajuan pinjaman."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>
                        <SortableHeader
                          label="Nama Anggota"
                          sortKey="memberName"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Tanggal Cair"
                          sortKey="dateDisbursed"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Nilai Hutang"
                          sortKey="amountVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Tenor"
                          sortKey="tenor"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-center"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Angsuran / Bulan"
                          sortKey="installmentAmountVal"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-end"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Status"
                          sortKey="status"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-center"
                        />
                      </Table.Head>
                      <Table.Head>
                        <SortableHeader
                          label="Progres"
                          sortKey="paidCount"
                          activeSortKey={table.sortConfig.key as string}
                          activeDirection={table.sortConfig.direction}
                          onSort={table.handleSort}
                          className="w-full justify-center"
                        />
                      </Table.Head>
                      <Table.Head>Aksi</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {table.paginatedItems.map((l) => {
                      return (
                        <Table.Row key={l.id} className="hover:bg-gray-50/50">
                          <Table.Cell>
                            <p className="font-semibold text-gray-900">
                              {l.memberName}
                            </p>
                            <p className="text-xs text-gray-400">
                              No. RAT {l.memberNo}
                            </p>
                          </Table.Cell>
                          <Table.Cell>{l.formattedDate}</Table.Cell>
                          <Table.Cell>
                            Rp {formatNumber(l.amountVal)}
                          </Table.Cell>
                          <Table.Cell>{l.tenor} bulan</Table.Cell>
                          <Table.Cell>
                            Rp {formatNumber(l.installmentAmountVal)}
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                                l.status === LOAN_STATUS.ACTIVE
                                  ? "border-rose-200 bg-rose-50 text-rose-800"
                                  : "border-green-200 bg-green-50 text-green-800"
                              }`}
                            >
                              {l.status === LOAN_STATUS.ACTIVE
                                ? "AKTIF"
                                : "LUNAS"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-xs text-gray-500">
                                {l.progressText}
                              </span>
                              <div className="h-1.5 w-16 rounded-full bg-gray-200">
                                <div
                                  className="h-1.5 rounded-full bg-red-700"
                                  style={{
                                    width: `${(l.paidCount / l.tenor) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              size="sm"
                              className="bg-red-700 text-white hover:bg-red-800"
                              onClick={() => {
                                setSelectedLoanId(l.id);
                                setTab("detail");
                              }}
                            >
                              Buka Kartu
                            </Button>
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
                  table.exportToCsv("Daftar_Kredit_Anggota", [
                    { label: "Nama Anggota", key: "memberName" },
                    { label: "No. RAT", key: "memberNo" },
                    { label: "Tanggal Pencairan", key: "formattedDate" },
                    { label: "Jumlah Pinjaman", key: "amountVal" },
                    { label: "Bunga flat", key: "interestRate" },
                    { label: "Tenor (Bulan)", key: "tenor" },
                    { label: "Angsuran Bulanan", key: "installmentAmountVal" },
                    { label: "Status Pinjaman", key: "status" },
                    { label: "Progress Bayar", key: "progressText" },
                  ]);
                }}
                exportLabel="Unduh Data Pinjaman"
              />
            </>
          )}
        </div>
      )}

      {/* Pay Installment Modal */}
      {payModal.isOpen && payModal.installment && payModal.loan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="animate-in fade-in zoom-in relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl duration-200">
            <button
              onClick={() =>
                setPayModal({
                  isOpen: false,
                  installment: null,
                  loan: null,
                  principal: 0,
                  interest: 0,
                  penalty: 0,
                  addPenalty: false,
                })
              }
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Pencatatan Pembayaran Angsuran
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Anggota:{" "}
              <span className="font-semibold text-gray-900">
                {payModal.loan.member.name}
              </span>{" "}
              <br />
              Angsuran Ke-{" "}
              <span className="font-semibold text-red-800">
                {payModal.installment.monthNumber}
              </span>{" "}
              dari {payModal.loan.tenor} bulan
            </p>

            <form action={dispatchPay} className="space-y-4">
              <input
                type="hidden"
                name="installmentId"
                value={payModal.installment.id}
              />
              <input
                type="hidden"
                name="principalPaid"
                value={payModal.principal}
              />
              <input
                type="hidden"
                name="interestPaid"
                value={payModal.interest}
              />
              <input
                type="hidden"
                name="penaltyPaid"
                value={payModalTotal.penalty}
              />

              <div className="space-y-2 rounded-md bg-gray-50 p-3">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Angsuran Pokok:</span>
                  <span className="font-medium">
                    Rp {formatNumber(payModal.principal)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2 text-sm text-gray-700">
                  <span>
                    Bunga ({Number(payModal.loan?.interestRate) || 0}% flat):
                  </span>
                  <span className="font-medium">
                    Rp {formatNumber(payModal.interest)}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={payModal.addPenalty}
                      onChange={(e) =>
                        setPayModal({
                          ...payModal,
                          addPenalty: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                      Kenakan Denda Keterlambatan (
                      {Number(payModal.loan?.penaltyRate) || 5}%)
                    </span>
                  </label>
                  <p className="mt-1 pl-5 text-xs text-gray-500">
                    Centang opsi ini jika pembayaran terlambat melewati tanggal
                    jatuh tempo.
                  </p>
                  {payModal.addPenalty && (
                    <div className="mt-2 flex justify-between text-sm font-medium text-rose-700">
                      <span>
                        Denda ({Number(payModal.loan?.penaltyRate) || 5}% dari
                        nominal angsuran):
                      </span>
                      <span>Rp {formatNumber(payModalTotal.penalty)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                  <span>Total yang Dibayar:</span>
                  <span className="text-lg text-red-700">
                    Rp {formatNumber(payModalTotal.total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() =>
                    setPayModal({
                      isOpen: false,
                      installment: null,
                      loan: null,
                      principal: 0,
                      interest: 0,
                      penalty: 0,
                      addPenalty: false,
                    })
                  }
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-red-700 text-white hover:bg-red-800"
                >
                  Konfirmasi Pembayaran
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
