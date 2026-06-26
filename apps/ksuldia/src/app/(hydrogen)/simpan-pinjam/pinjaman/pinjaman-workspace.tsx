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
import { createLoanAction, payInstallmentAction, LoanActionState } from "./actions";
import { Button } from "@/components/ui/button";

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
};

export default function PinjamanWorkspace({ loans, eligibleMembers }: PinjamanWorkspaceProps) {
  const [tab, setTab] = useState<"list" | "create" | "detail">("list");
  const [query, setQuery] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // New Loan Form State (for live calculations)
  const [formDataVal, setFormDataVal] = useState({
    memberId: "",
    amount: 10000000,
    interestRate: 1.0,
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
  const [createState, dispatchCreate] = useActionState<LoanActionState, FormData>(
    createLoanAction,
    { success: false, message: "" }
  );

  const [payState, dispatchPay] = useActionState<LoanActionState, FormData>(
    payInstallmentAction,
    { success: false, message: "" }
  );

  // Use action feedback
  useActionFeedback(createState, () => {
    setTab("list");
    setFormDataVal({ memberId: "", amount: 10000000, interestRate: 1.0, tenor: 10 });
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
    const tenor = Number(formDataVal.tenor) || 1;

    const monthlyInterest = amount * (rate / 100);
    const provision = monthlyInterest; // 1x monthly interest
    const crk = amount / tenor; // 1x monthly principal installment
    const receivedAmount = amount - provision - crk;
    const installmentAmount = (amount / tenor) + monthlyInterest;

    return {
      monthlyInterest,
      provision,
      crk,
      receivedAmount,
      installmentAmount,
    };
  }, [formDataVal]);

  // Filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return loans.filter((l) => {
      if (!q) return true;
      return (
        l.member.name.toLowerCase().includes(q) ||
        l.member.no.toString().includes(q) ||
        l.status.toLowerCase().includes(q)
      );
    });
  }, [loans, query]);

  const selectedLoan = useMemo(() => {
    return loans.find((l) => l.id === selectedLoanId) || null;
  }, [loans, selectedLoanId]);

  // Setup default values for installment payment when modal opens
  const openPayModal = (loan: LoanWithMember, inst: Installment) => {
    const monthlyPrincipal = Number(loan.amount) / loan.tenor;
    const monthlyInterest = Number(loan.amount) * (Number(loan.interestRate) / 100);
    
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
      // 5% of monthly installment
      const installmentAmount = (payModal.principal + payModal.interest);
      const penaltyAmount = installmentAmount * 0.05;
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
            tab === "list" ? "border-teal-700 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"
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
              tab === "detail" ? "border-teal-700 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"
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
            tab === "create" ? "border-teal-700 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => setTab("create")}
        >
          <PiPlusBold className="h-4 w-4" />
          Cairkan Pinjaman Baru
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "create" ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pengajuan & Pencairan Kredit</h2>
            <form action={dispatchCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Anggota Penerima</label>
                <select
                  name="memberId"
                  required
                  value={formDataVal.memberId}
                  onChange={(e) => setFormDataVal({ ...formDataVal, memberId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {eligibleMembers.map((em) => (
                    <option key={em.id} value={em.id}>
                      [{em.no}] {em.name}
                    </option>
                  ))}
                </select>
                {createState.errors?.memberId && (
                  <p className="text-xs text-red-600 mt-1">{createState.errors.memberId[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Pinjaman (Rupiah)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  value={formDataVal.amount}
                  onChange={(e) => setFormDataVal({ ...formDataVal, amount: Number(e.target.value) })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                />
                {createState.errors?.amount && (
                  <p className="text-xs text-red-600 mt-1">{createState.errors.amount[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bunga Flat Bulanan (%)</label>
                  <input
                    type="number"
                    name="interestRate"
                    step="0.01"
                    required
                    value={formDataVal.interestRate}
                    onChange={(e) => setFormDataVal({ ...formDataVal, interestRate: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  />
                  {createState.errors?.interestRate && (
                    <p className="text-xs text-red-600 mt-1">{createState.errors.interestRate[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenor Jangka Waktu (Bulan)</label>
                  <input
                    type="number"
                    name="tenor"
                    required
                    value={formDataVal.tenor}
                    onChange={(e) => setFormDataVal({ ...formDataVal, tenor: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-teal-600"
                  />
                  {createState.errors?.tenor && (
                    <p className="text-xs text-red-600 mt-1">{createState.errors.tenor[0]}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800" disabled={!formDataVal.memberId}>
                  Cairkan Pinjaman
                </Button>
              </div>
            </form>
          </div>

          {/* Calculator Info Panel */}
          <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-6 space-y-4 h-fit">
            <h3 className="font-bold text-teal-800 border-b border-teal-200 pb-2">Simulasi Potongan & Angsuran</h3>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Nilai Hutang:</span>
                <span className="font-semibold">Rp {formatNumber(formDataVal.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-teal-100 pb-2">
                <span>Tenor:</span>
                <span className="font-semibold">{formDataVal.tenor} Bulan</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center text-rose-700">Potongan Provisi (1x Bunga):</span>
                <span className="font-semibold text-rose-700">- Rp {formatNumber(liveCalc.provision)}</span>
              </div>
              <div className="flex justify-between border-b border-teal-100 pb-2">
                <span className="flex items-center text-rose-700">Potongan CRK (1x Angsuran):</span>
                <span className="font-semibold text-rose-700">- Rp {formatNumber(liveCalc.crk)}</span>
              </div>

              <div className="flex justify-between pt-1 font-bold text-gray-900">
                <span>Sisa Diterima Peminjam:</span>
                <span className="text-teal-700 text-lg">Rp {formatNumber(liveCalc.receivedAmount)}</span>
              </div>

              <div className="border-t border-teal-200 my-4 pt-3 space-y-2">
                <p className="text-xs text-gray-500 font-semibold uppercase">Detail Kewajiban Bulanan</p>
                <div className="flex justify-between">
                  <span>Angsuran Pokok:</span>
                  <span>Rp {formatNumber(formDataVal.amount / formDataVal.tenor)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bunga Berjalan ({formDataVal.interestRate}%):</span>
                  <span>Rp {formatNumber(liveCalc.monthlyInterest)}</span>
                </div>
                <div className="flex justify-between border-t border-teal-100 pt-2 font-bold text-teal-900">
                  <span>Angsuran per Bulan:</span>
                  <span>Rp {formatNumber(liveCalc.installmentAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : tab === "detail" ? (
        <div className="p-6 space-y-6">
          {selectedLoan && (
            <div>
              {/* Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kartu Angsuran Pinjaman</p>
                  <h2 className="text-xl font-bold text-gray-900">
                    [{selectedLoan.member.no}] {selectedLoan.member.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Status Pinjaman</p>
                  <span
                    className={`inline-flex rounded-md border px-3 py-1 text-sm font-bold ${
                      selectedLoan.status === "ACTIVE"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-green-200 bg-green-50 text-green-800"
                    }`}
                  >
                    {selectedLoan.status === "ACTIVE" ? "AKTIF / BELUM LUNAS" : "LUNAS"}
                  </span>
                </div>
              </div>

              {/* Loan parameters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Hutang Awal</p>
                  <p className="font-semibold text-gray-950">Rp {formatNumber(Number(selectedLoan.amount))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tenor & Bunga</p>
                  <p className="font-semibold text-gray-950">
                    {selectedLoan.tenor} bln @ {Number(selectedLoan.interestRate)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Potongan Provisi</p>
                  <p className="font-semibold text-gray-950">Rp {formatNumber(Number(selectedLoan.provision))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Potongan CRK</p>
                  <p className="font-semibold text-gray-950">Rp {formatNumber(Number(selectedLoan.crk))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Diterima Bersih</p>
                  <p className="font-semibold text-teal-800">Rp {formatNumber(Number(selectedLoan.receivedAmount))}</p>
                </div>
              </div>

              {/* Installments Ledger */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Jadwal Angsuran Bulanan</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-150">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Bulan ke-</th>
                        <th className="px-4 py-3">Jatuh Tempo</th>
                        <th className="px-4 py-3 text-right">Pokok</th>
                        <th className="px-4 py-3 text-right">Bunga</th>
                        <th className="px-4 py-3 text-right">Denda</th>
                        <th className="px-4 py-3 text-right font-bold">Total Tagihan</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Tanggal Bayar</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedLoan.installments.map((inst) => {
                        const monthlyPrincipal = Number(selectedLoan.amount) / selectedLoan.tenor;
                        const monthlyInterest = Number(selectedLoan.amount) * (Number(selectedLoan.interestRate) / 100);
                        const isPaid = inst.status === "PAID";

                        return (
                          <tr key={inst.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-semibold text-gray-900">{inst.monthNumber}</td>
                            <td className="px-4 py-3">
                              {new Intl.DateTimeFormat("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }).format(new Date(inst.dueDate))}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              Rp {formatNumber(isPaid ? Number(inst.principalPaid) : monthlyPrincipal)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              Rp {formatNumber(isPaid ? Number(inst.interestPaid) : monthlyInterest)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-rose-700">
                              Rp {formatNumber(Number(inst.penaltyPaid))}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-teal-800 bg-teal-50/5">
                              Rp {formatNumber(isPaid ? Number(inst.totalPaid) : (monthlyPrincipal + monthlyInterest))}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isPaid ? (
                                <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                                  LUNAS
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                  BELUM BAYAR
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500">
                              {inst.paidAt ? (
                                new Intl.DateTimeFormat("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }).format(new Date(inst.paidAt))
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!isPaid && selectedLoan.status === "ACTIVE" ? (
                                <Button
                                  size="sm"
                                  className="bg-teal-700 text-white hover:bg-teal-800"
                                  onClick={() => openPayModal(selectedLoan, inst)}
                                >
                                  Bayar
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Filters */}
          <div className="flex border-b border-gray-200 p-4">
            <label className="relative flex-1 max-w-md">
              <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama anggota, nomor RAT, status..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-700"
              />
            </label>
          </div>

          {/* Loans List Table */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={PiCoinsDuotone}
              title="Tidak ada data pinjaman"
              description="Pencarian Anda kosong atau belum ada pengajuan pinjaman."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Nama Anggota</th>
                    <th className="px-4 py-3">Tanggal Cair</th>
                    <th className="px-4 py-3 text-right">Nilai Hutang</th>
                    <th className="px-4 py-3 text-center">Tenor</th>
                    <th className="px-4 py-3 text-right">Angsuran / Bln</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Progres</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((l) => {
                    const paidCount = l.installments.filter((i) => i.status === "PAID").length;
                    return (
                      <tr key={l.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{l.member.name}</p>
                          <p className="text-xs text-gray-400">No. RAT {l.member.no}</p>
                        </td>
                        <td className="px-4 py-3">
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(l.dateDisbursed))}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-950">
                          Rp {formatNumber(Number(l.amount))}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{l.tenor} Bln</td>
                        <td className="px-4 py-3 text-right font-bold text-teal-800">
                          Rp {formatNumber(Number(l.installmentAmount))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                              l.status === "ACTIVE"
                                ? "border-rose-200 bg-rose-50 text-rose-800"
                                : "border-green-200 bg-green-50 text-green-800"
                            }`}
                          >
                            {l.status === "ACTIVE" ? "AKTIF" : "LUNAS"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-xs text-gray-500">
                              {paidCount} / {l.tenor}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-teal-600 h-1.5 rounded-full"
                                style={{ width: `${(paidCount / l.tenor) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            className="bg-teal-700 text-white hover:bg-teal-800"
                            onClick={() => {
                              setSelectedLoanId(l.id);
                              setTab("detail");
                            }}
                          >
                            Buka Kartu
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

      {/* Pay Installment Modal */}
      {payModal.isOpen && payModal.installment && payModal.loan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
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

            <h3 className="text-lg font-bold text-gray-900 mb-2">Pencatatan Pembayaran Angsuran</h3>
            <p className="text-sm text-gray-600 mb-4">
              Anggota: <span className="font-semibold text-gray-900">{payModal.loan.member.name}</span> <br />
              Angsuran Ke- <span className="font-semibold text-teal-800">{payModal.installment.monthNumber}</span> dari {payModal.loan.tenor} bulan
            </p>

            <form action={dispatchPay} className="space-y-4">
              <input type="hidden" name="installmentId" value={payModal.installment.id} />
              <input type="hidden" name="principalPaid" value={payModal.principal} />
              <input type="hidden" name="interestPaid" value={payModal.interest} />
              <input type="hidden" name="penaltyPaid" value={payModalTotal.penalty} />

              <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Angsuran Pokok:</span>
                  <span className="font-medium">Rp {formatNumber(payModal.principal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 border-b border-gray-200 pb-2">
                  <span>Bunga (1% flat):</span>
                  <span className="font-medium">Rp {formatNumber(payModal.interest)}</span>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payModal.addPenalty}
                      onChange={(e) => setPayModal({ ...payModal, addPenalty: e.target.checked })}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                      Kenakan Denda Keterlambatan (5%)
                    </span>
                  </label>
                  {payModal.addPenalty && (
                    <div className="flex justify-between text-sm text-rose-700 mt-2 font-medium">
                      <span>Denda (5% dari nominal angsuran):</span>
                      <span>Rp {formatNumber(payModalTotal.penalty)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-gray-900">
                  <span>Total yang Dibayar:</span>
                  <span className="text-teal-700 text-lg">Rp {formatNumber(payModalTotal.total)}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
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
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
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
