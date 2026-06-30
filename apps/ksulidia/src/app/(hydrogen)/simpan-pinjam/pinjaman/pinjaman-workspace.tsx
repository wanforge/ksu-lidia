"use client";

import { useActionState, useMemo, useState } from "react";
import {
  PiPlusDuotone,
  PiCoinsDuotone,
  PiHandCoinsDuotone,
  PiXBold,
  PiMagnifyingGlassBold,
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
import { useCustomTable, ColumnFilterConfig } from "@/lib/use-custom-table";
import { LOAN_STATUS, INSTALLMENT_STATUS } from "@/lib/constants";
import {
  TableControls,
  SortableHeader,
} from "@/app/(hydrogen)/_components/table-controls";
import { DataTableFilters } from "@/components/ui/table/DataTableFilters";
import { Tabs } from "@/components/ui/Tabs";

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
  const [tab, setTab] = useState<"list" | "detail">("list");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formDataVal, setFormDataVal] = useState({
    memberId: "",
    amount: 10000000,
    interestRate: defaultRates.interestRate,
    provisionRate: defaultRates.provisionRate,
    crkRate: defaultRates.crkRate,
    penaltyRate: defaultRates.penaltyRate,
    tenor: 10,
  });

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

  const [createState, dispatchCreate] = useActionState<
    LoanActionState,
    FormData
  >(createLoanAction, { success: false, message: "" });

  const [payState, dispatchPay] = useActionState<LoanActionState, FormData>(
    payInstallmentAction,
    { success: false, message: "" }
  );

  useActionFeedback(createState, () => {
    setIsCreateModalOpen(false);
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
  });

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
    return { monthlyInterest, provision, crk, receivedAmount, installmentAmount };
  }, [formDataVal]);

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

  const loanFilterConfig: ColumnFilterConfig[] = useMemo(
    () => [
      { key: "memberName", label: "Nama Anggota", type: "text", placeholder: "Cari nama..." },
      { key: "memberNo", label: "No. RAT", type: "text", placeholder: "Cari nomor..." },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Aktif", value: LOAN_STATUS.ACTIVE },
          { label: "Lunas", value: "PAID" },
        ],
      },
      { key: "amountVal", label: "Nilai Pinjaman", type: "numberRange" },
    ],
    []
  );

  const table = useCustomTable({
    items: mappedLoans,
    initialSort: { key: "dateDisbursed", direction: "desc" },
    initialPageSize: 10,
    advancedFilterConfig: loanFilterConfig,
  });

  const selectedLoan = useMemo(
    () => loans.find((l) => l.id === selectedLoanId) || null,
    [loans, selectedLoanId]
  );

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
  });

  const openPayModal = (loan: LoanWithMember, inst: Installment) => {
    const monthlyPrincipal = Number(loan.amount) / loan.tenor;
    const monthlyInterest =
      Number(loan.amount) * (Number(loan.interestRate) / 100);
    const isLate = inst.dueDate ? new Date(inst.dueDate) < new Date() : false;
    setPayModal({
      isOpen: true,
      installment: inst,
      loan,
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      penalty: 0,
      addPenalty: isLate,
    });
  };

  const payModalTotal = useMemo(() => {
    const base = payModal.principal + payModal.interest;
    if (payModal.addPenalty) {
      const penaltyAmount =
        payModal.principal *
        ((Number(payModal.loan?.penaltyRate) || 5.0) / 100);
      return { penalty: penaltyAmount, total: base + penaltyAmount };
    }
    return { penalty: 0, total: base };
  }, [payModal]);

  const navTabs = useMemo(() => {
    const tabs = [
      {
        id: "list",
        label: "Daftar Pinjaman",
        icon: PiHandCoinsDuotone,
        badge: formatNumber(loans.length),
      },
    ];
    if (selectedLoan) {
      tabs.push({
        id: "detail",
        label: `Kartu Angsuran: ${selectedLoan.member.name}`,
        icon: PiCoinsDuotone,
        badge: undefined as any,
      });
    }
    return tabs;
  }, [loans.length, selectedLoan]);

  const exportColumns = [
    { label: "Nama Anggota", key: "memberName" },
    { label: "No. RAT", key: "memberNo" },
    { label: "Tanggal Pencairan", key: "formattedDate" },
    { label: "Jumlah Pinjaman", key: "amountVal" },
    { label: "Bunga flat (%)", key: "interestRate" },
    { label: "Tenor (Bulan)", key: "tenor" },
    { label: "Angsuran Bulanan", key: "installmentAmountVal" },
    { label: "Status Pinjaman", key: "status" },
    { label: "Progress Bayar", key: "progressText" },
  ];

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Tab navigation */}
      <Tabs tabs={navTabs} activeTab={tab} onChange={(id) => setTab(id as any)} />

      {/* List view */}
      {tab === "list" && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 p-4">
            <DataTableFilters
              filterConfig={loanFilterConfig}
              onFilterChange={table.setAdvancedFilters}
              currentFilters={table.advancedFilters}
            />
            <Button
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PiPlusDuotone className="h-4 w-4" />
              Cairkan Pinjaman
            </Button>
          </div>

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
                    <Table.Row className="bg-gray-50">
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Nama Anggota" sortKey="memberName" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Tanggal Cair" sortKey="dateDisbursed" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Nilai Hutang" sortKey="amountVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-end" />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Tenor" sortKey="tenor" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-center" />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Angsuran / Bulan" sortKey="installmentAmountVal" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-end" />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Status" sortKey="status" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-center" />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader label="Progres" sortKey="paidCount" activeSortKey={table.sortConfig.key as string} activeDirection={table.sortConfig.direction} onSort={table.handleSort} className="w-full justify-center" />
                      </Table.Head>
                      <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Aksi</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {table.paginatedItems.map((l) => (
                      <Table.Row key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <Table.Cell className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{l.memberName}</p>
                          <p className="text-xs text-gray-400">No. RAT {l.memberNo}</p>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3 text-sm text-gray-900">{l.formattedDate}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rp {formatNumber(l.amountVal)}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-center text-sm text-gray-900">{l.tenor} bulan</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rp {formatNumber(l.installmentAmountVal)}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${l.status === LOAN_STATUS.ACTIVE ? "border-rose-200 bg-rose-50 text-rose-800" : "border-green-200 bg-green-50 text-green-800"}`}>
                            {l.status === LOAN_STATUS.ACTIVE ? "AKTIF" : "LUNAS"}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-xs text-gray-500">{l.progressText}</span>
                            <div className="h-1.5 w-16 rounded-full bg-gray-200">
                              <div className="h-1.5 rounded-full bg-red-700" style={{ width: `${(l.paidCount / l.tenor) * 100}%` }} />
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <Button
                            size="sm"
                            onClick={() => { setSelectedLoanId(l.id); setTab("detail"); }}
                          >
                            Buka Kartu
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
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
                onExport={() => table.exportToCsv("Daftar_Kredit_Anggota", exportColumns)}
                onExportExcel={() => table.exportToExcel("Daftar_Kredit_Anggota", exportColumns)}
                onExportPdf={() => table.exportToPdf("Daftar_Kredit_Anggota", exportColumns, "Daftar Kredit Anggota Koperasi")}
                exportLabel="Export"
              />
            </>
          )}
        </div>
      )}

      {/* Detail view */}
      {tab === "detail" && selectedLoan && (
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Kartu Angsuran Pinjaman</p>
              <h2 className="text-xl font-bold text-gray-900">
                [{selectedLoan.member.no}] {selectedLoan.member.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Status Pinjaman</p>
              <span className={`inline-flex rounded-md border px-3 py-1 text-sm font-bold ${selectedLoan.status === LOAN_STATUS.ACTIVE ? "border-rose-200 bg-rose-50 text-rose-800" : "border-green-200 bg-green-50 text-green-800"}`}>
                {selectedLoan.status === LOAN_STATUS.ACTIVE ? "AKTIF / BELUM LUNAS" : "LUNAS"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-5">
            {[
              { label: "Hutang Awal", value: `Rp ${formatNumber(Number(selectedLoan.amount))}` },
              { label: "Tenor & Bunga", value: `${selectedLoan.tenor} bln @ ${Number(selectedLoan.interestRate)}%` },
              { label: "Potongan Provisi", value: `Rp ${formatNumber(Number(selectedLoan.provision))}` },
              { label: "Potongan CRK", value: `Rp ${formatNumber(Number(selectedLoan.crk))}` },
              { label: "Diterima Bersih", value: `Rp ${formatNumber(Number(selectedLoan.receivedAmount))}`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className={`font-semibold ${highlight ? "text-red-800" : "text-gray-950"}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Jadwal Angsuran Bulanan</h3>
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
                  <Table.Row className="bg-gray-50">
                    {[
                      { label: "Bulan ke-", key: "monthNumber" },
                      { label: "Jatuh Tempo", key: "dueDate" },
                      { label: "Pokok", key: "principalVal", right: true },
                      { label: "Bunga", key: "interestVal", right: true },
                      { label: "Denda", key: "penaltyVal", right: true },
                      { label: "Total Tagihan", key: "totalVal", right: true },
                    ].map(({ label, key, right }) => (
                      <Table.Head key={key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <SortableHeader
                          label={label}
                          sortKey={key}
                          activeSortKey={instTable.sortConfig.key as string}
                          activeDirection={instTable.sortConfig.direction}
                          onSort={instTable.handleSort}
                          className={right ? "w-full justify-end" : ""}
                        />
                      </Table.Head>
                    ))}
                    <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</Table.Head>
                    <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Tanggal Bayar</Table.Head>
                    <Table.Head className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Aksi</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {instTable.paginatedItems.map((inst) => {
                    const isPaid = inst.status === INSTALLMENT_STATUS.PAID;
                    return (
                      <Table.Row key={inst.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <Table.Cell className="px-4 py-3 text-sm text-gray-900">{inst.monthNumber}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-sm text-gray-900">{inst.dueDateFormatted}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-right text-sm text-gray-900">Rp {formatNumber(inst.principalVal)}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-right text-sm text-gray-900">Rp {formatNumber(inst.interestVal)}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-right text-sm text-gray-900">Rp {formatNumber(inst.penaltyVal)}</Table.Cell>
                        <Table.Cell className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Rp {formatNumber(inst.totalVal)}</Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          {isPaid ? (
                            <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">LUNAS</span>
                          ) : (
                            <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">BELUM BAYAR</span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3 text-sm text-gray-900">{inst.paidAtFormatted}</Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          {!isPaid && selectedLoan.status === LOAN_STATUS.ACTIVE ? (
                            <Button size="sm" onClick={() => openPayModal(selectedLoan, inst as any)}>
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
                onExport={() => instTable.exportToCsv(`Jadwal_Kredit_${selectedLoan.member.name}`, [
                  { label: "Bulan ke-", key: "monthNumber" },
                  { label: "Tanggal Jatuh Tempo", key: "dueDateFormatted" },
                  { label: "Pokok Angsuran", key: "principalVal" },
                  { label: "Bunga", key: "interestVal" },
                  { label: "Denda", key: "penaltyVal" },
                  { label: "Total Tagihan", key: "totalVal" },
                  { label: "Status", key: "status" },
                  { label: "Tanggal Pembayaran", key: "paidAtFormatted" },
                ])}
                onExportExcel={() => instTable.exportToExcel(`Jadwal_Kredit_${selectedLoan.member.name}`, [
                  { label: "Bulan ke-", key: "monthNumber" },
                  { label: "Tanggal Jatuh Tempo", key: "dueDateFormatted" },
                  { label: "Pokok", key: "principalVal" },
                  { label: "Bunga", key: "interestVal" },
                  { label: "Denda", key: "penaltyVal" },
                  { label: "Total", key: "totalVal" },
                  { label: "Status", key: "status" },
                  { label: "Tanggal Bayar", key: "paidAtFormatted" },
                ])}
                onExportPdf={() => instTable.exportToPdf(`Jadwal_Kredit_${selectedLoan.member.name}`, [
                  { label: "Bln", key: "monthNumber" },
                  { label: "Jatuh Tempo", key: "dueDateFormatted" },
                  { label: "Pokok", key: "principalVal" },
                  { label: "Bunga", key: "interestVal" },
                  { label: "Denda", key: "penaltyVal" },
                  { label: "Total", key: "totalVal" },
                  { label: "Status", key: "status" },
                  { label: "Tgl Bayar", key: "paidAtFormatted" },
                ], `Kartu Angsuran — ${selectedLoan.member.name}`)}
                exportLabel="Export"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Cairkan Pinjaman Baru ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
          <div className="relative w-full max-w-4xl rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">Pengajuan & Pencairan Kredit</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <PiXBold className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_360px]">
              <form action={dispatchCreate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Pilih Anggota Penerima</label>
                  <select
                    name="memberId"
                    required
                    value={formDataVal.memberId}
                    onChange={(e) => setFormDataVal({ ...formDataVal, memberId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {eligibleMembers.map((em) => (
                      <option key={em.id} value={em.id}>[{em.no}] {em.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Pilih anggota terdaftar yang tidak memiliki pinjaman aktif berjalan.</p>
                  {createState.errors?.memberId && (
                    <p className="mt-1 text-xs text-red-600">{createState.errors.memberId[0]}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nominal Pinjaman (Rupiah)</label>
                  <input type="number" name="amount" required value={formDataVal.amount}
                    onChange={(e) => setFormDataVal({ ...formDataVal, amount: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">Jumlah dana pinjaman yang diajukan oleh anggota.</p>
                  {createState.errors?.amount && (
                    <p className="mt-1 text-xs text-red-600">{createState.errors.amount[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Bunga Flat Bulanan (%)", name: "interestRate", field: "interestRate", hint: "Bunga pinjaman bulanan (%)" },
                    { label: "Potongan Provisi (%)", name: "provisionRate", field: "provisionRate", hint: "% thd Bunga" },
                    { label: "Potongan CRK (%)", name: "crkRate", field: "crkRate", hint: "% thd Pokok" },
                    { label: "Denda Terlambat (%)", name: "penaltyRate", field: "penaltyRate", hint: "Denda per keterlambatan" },
                    { label: "Tenor Jangka Waktu (Bulan)", name: "tenor", field: "tenor", hint: "Jangka waktu pelunasan cicilan bulanan" },
                  ].map(({ label, name, field, hint }) => (
                    <div key={name}>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                      <input
                        type="number"
                        name={name}
                        step="0.01"
                        required
                        value={(formDataVal as any)[field]}
                        onChange={(e) => setFormDataVal({ ...formDataVal, [field]: Number(e.target.value) })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                      />
                      <p className="mt-1 text-xs text-gray-500">{hint}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                  <Button type="button" variant="neutral" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={!formDataVal.memberId}>Cairkan Pinjaman</Button>
                </div>
              </form>

              {/* Calculator panel */}
              <div className="h-fit space-y-4 rounded-lg border border-red-100 bg-red-50/50 p-5">
                <h3 className="border-b border-red-200 pb-2 font-bold text-red-800">Simulasi Potongan & Angsuran</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Nilai Hutang:</span>
                    <span className="font-semibold">Rp {formatNumber(formDataVal.amount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-100 pb-2">
                    <span>Tenor:</span>
                    <span className="font-semibold">{formDataVal.tenor} Bulan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-700">Provisi ({formDataVal.provisionRate}% dari Bunga):</span>
                    <span className="font-semibold text-rose-700">- Rp {formatNumber(liveCalc.provision)}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-100 pb-2">
                    <span className="text-rose-700">CRK ({formDataVal.crkRate}% dari Pokok):</span>
                    <span className="font-semibold text-rose-700">- Rp {formatNumber(liveCalc.crk)}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-gray-900">
                    <span>Sisa Diterima Peminjam:</span>
                    <span className="text-lg text-red-700">Rp {formatNumber(liveCalc.receivedAmount)}</span>
                  </div>
                  <div className="space-y-2 border-t border-red-200 pt-3">
                    <p className="text-xs font-semibold uppercase text-gray-500">Kewajiban Bulanan</p>
                    <div className="flex justify-between">
                      <span>Angsuran Pokok:</span>
                      <span>Rp {formatNumber(formDataVal.amount / formDataVal.tenor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bunga ({formDataVal.interestRate}%):</span>
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
          </div>
        </div>
      )}

      {/* ── Modal: Bayar Angsuran ── */}
      {payModal.isOpen && payModal.installment && payModal.loan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setPayModal({ isOpen: false, installment: null, loan: null, principal: 0, interest: 0, penalty: 0, addPenalty: false })}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="mb-2 text-lg font-bold text-gray-900">Pencatatan Pembayaran Angsuran</h3>
            <p className="mb-4 text-sm text-gray-600">
              Anggota: <span className="font-semibold text-gray-900">{payModal.loan.member.name}</span><br />
              Angsuran Ke-<span className="font-semibold text-red-800">{payModal.installment.monthNumber}</span> dari {payModal.loan.tenor} bulan
            </p>

            <form action={dispatchPay} className="space-y-4">
              <input type="hidden" name="installmentId" value={payModal.installment.id} />
              <input type="hidden" name="principalPaid" value={payModal.principal} />
              <input type="hidden" name="interestPaid" value={payModal.interest} />
              <input type="hidden" name="penaltyPaid" value={payModalTotal.penalty} />

              <div className="space-y-2 rounded-md bg-gray-50 p-3">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Angsuran Pokok:</span>
                  <span className="font-medium">Rp {formatNumber(payModal.principal)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2 text-sm text-gray-700">
                  <span>Bunga ({Number(payModal.loan?.interestRate) || 0}% flat):</span>
                  <span className="font-medium">Rp {formatNumber(payModal.interest)}</span>
                </div>
                <div className="pt-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={payModal.addPenalty}
                      onChange={(e) => setPayModal({ ...payModal, addPenalty: e.target.checked })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                      Kenakan Denda Keterlambatan ({Number(payModal.loan?.penaltyRate) || 5}%)
                    </span>
                  </label>
                  <p className="mt-1 pl-5 text-xs text-gray-500">Centang jika pembayaran terlambat melewati tanggal jatuh tempo.</p>
                  {payModal.addPenalty && (
                    <div className="mt-2 flex justify-between text-sm font-medium text-rose-700">
                      <span>Denda ({Number(payModal.loan?.penaltyRate) || 5}% dari nominal angsuran):</span>
                      <span>Rp {formatNumber(payModalTotal.penalty)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                  <span>Total yang Dibayar:</span>
                  <span className="text-lg text-red-700">Rp {formatNumber(payModalTotal.total)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="neutral" onClick={() => setPayModal({ isOpen: false, installment: null, loan: null, principal: 0, interest: 0, penalty: 0, addPenalty: false })}>
                  Batal
                </Button>
                <Button type="submit">Konfirmasi Pembayaran</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
