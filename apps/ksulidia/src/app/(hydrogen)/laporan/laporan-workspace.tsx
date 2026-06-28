"use client";

import React, { useMemo, useState } from "react";
import {
  PiPrinterDuotone,
  PiVaultDuotone,
  PiCoinsDuotone,
  PiBookOpenDuotone,
  PiStorefrontDuotone,
  PiMagnifyingGlassBold,
  PiMicrosoftExcelLogoDuotone,
} from "react-icons/pi";
import { formatNumber } from "@/lib/format";
import {
  SAVINGS_TYPES,
  INSTALLMENT_STATUS,
  SAVINGS_TX_TYPES,
} from "@/lib/constants";
import { Table, Button } from "rizzui";
import { utils, writeFile } from "xlsx";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

type Member = {
  id: string;
  no: number;
  name: string;
  savingsAccounts: {
    type: string;
    balance: any;
  }[];
};

type Loan = {
  id: string;
  amount: any;
  provision: any;
  crk: any;
  installmentAmount: any;
  dateDisbursed: any;
  member: {
    no: number;
    name: string;
  };
  installments: {
    status: string;
    principalPaid: any;
    interestPaid: any;
    totalPaid: any;
  }[];
};

type CashBookTx = {
  id: string;
  type: string;
  savingsType: string;
  amount: any;
  description: string | null;
  date: any;
  member: {
    no: number;
    name: string;
  };
};

type StoreTx = {
  id: string;
  type: string;
  totalAmount: any;
  date: any;
};

type LaporanWorkspaceProps = {
  members: Member[];
  loans: Loan[];
  cashBookTxs: CashBookTx[];
  storeTxs: StoreTx[];
};

export default function LaporanWorkspace({
  members,
  loans,
  cashBookTxs,
  storeTxs,
}: LaporanWorkspaceProps) {
  const [tab, setTab] = useState<"savings" | "loans" | "cashbook" | "store">(
    "savings"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- TAB 1: SAVINGS COMPUTATIONS ---
  const savingsData = useMemo(() => {
    return members.map((m) => {
      const pokok =
        Number(
          m.savingsAccounts.find((a) => a.type === SAVINGS_TYPES.POKOK)?.balance
        ) || 0;
      const wajib =
        Number(
          m.savingsAccounts.find((a) => a.type === SAVINGS_TYPES.WAJIB)?.balance
        ) || 0;
      const sukarela =
        Number(
          m.savingsAccounts.find((a) => a.type === SAVINGS_TYPES.SUKARELA)
            ?.balance
        ) || 0;
      const total = pokok + wajib + sukarela;
      return {
        id: m.id,
        no: m.no,
        name: m.name,
        pokok,
        wajib,
        sukarela,
        total,
      };
    });
  }, [members]);

  const filteredSavings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return savingsData;
    return savingsData.filter(
      (s) => s.name.toLowerCase().includes(q) || s.no.toString().includes(q)
    );
  }, [savingsData, searchQuery]);

  const savingsTotals = useMemo(() => {
    return filteredSavings.reduce(
      (acc, s) => {
        acc.pokok += s.pokok;
        acc.wajib += s.wajib;
        acc.sukarela += s.sukarela;
        acc.total += s.total;
        return acc;
      },
      { pokok: 0, wajib: 0, sukarela: 0, total: 0 }
    );
  }, [filteredSavings]);

  // --- TAB 2: LOANS COMPUTATIONS ---
  const loansData = useMemo(() => {
    let filtered = loans;
    if (startDate || endDate) {
      filtered = loans.filter((l) => {
        const txDate = dayjs(l.dateDisbursed);
        if (startDate && endDate) {
          return txDate.isBetween(startDate, dayjs(endDate).endOf('day'), 'day', '[]');
        }
        if (startDate) {
          return txDate.isAfter(dayjs(startDate).subtract(1, 'day'), 'day');
        }
        if (endDate) {
          return txDate.isBefore(dayjs(endDate).add(1, 'day'), 'day');
        }
        return true;
      });
    }

    return filtered.map((l) => {
      const amount = Number(l.amount) || 0;
      const provision = Number(l.provision) || 0;
      const crk = Number(l.crk) || 0;
      const installmentAmount = Number(l.installmentAmount) || 0;

      const paidInstallments = l.installments.filter(
        (i) => i.status === INSTALLMENT_STATUS.PAID
      );
      const totalPrincipalPaid = paidInstallments.reduce(
        (sum, i) => sum + (Number(i.principalPaid) || 0),
        0
      );
      const remainingBalance = amount - totalPrincipalPaid;

      return {
        id: l.id,
        no: l.member.no,
        name: l.member.name,
        amount,
        provision,
        crk,
        installmentAmount,
        paidMonths: paidInstallments.length,
        remainingBalance,
        date: new Date(l.dateDisbursed).toLocaleDateString("id-ID"),
      };
    });
  }, [loans, startDate, endDate]);

  const filteredLoans = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return loansData;
    return loansData.filter(
      (l) => l.name.toLowerCase().includes(q) || l.no.toString().includes(q)
    );
  }, [loansData, searchQuery]);

  const loansTotals = useMemo(() => {
    return filteredLoans.reduce(
      (acc, l) => {
        acc.amount += l.amount;
        acc.provision += l.provision;
        acc.crk += l.crk;
        acc.remainingBalance += l.remainingBalance;
        return acc;
      },
      { amount: 0, provision: 0, crk: 0, remainingBalance: 0 }
    );
  }, [filteredLoans]);

  // --- TAB 3: CASH BOOK LEDGER ---
  const filteredCashBook = useMemo(() => {
    let filtered = cashBookTxs;
    if (startDate || endDate) {
      filtered = cashBookTxs.filter((tx) => {
        const txDate = dayjs(tx.date);
        if (startDate && endDate) {
          return txDate.isBetween(startDate, dayjs(endDate).endOf('day'), 'day', '[]');
        }
        if (startDate) {
          return txDate.isAfter(dayjs(startDate).subtract(1, 'day'), 'day');
        }
        if (endDate) {
          return txDate.isBefore(dayjs(endDate).add(1, 'day'), 'day');
        }
        return true;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return filtered;
    return filtered.filter(
      (t) =>
        t.member.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [cashBookTxs, searchQuery, startDate, endDate]);

  // --- TAB 4: STORE P&L ---
  const storeData = useMemo(() => {
    let filtered = storeTxs;
    if (startDate || endDate) {
      filtered = storeTxs.filter((tx) => {
        const txDate = dayjs(tx.date);
        if (startDate && endDate) {
          return txDate.isBetween(startDate, dayjs(endDate).endOf('day'), 'day', '[]');
        }
        if (startDate) {
          return txDate.isAfter(dayjs(startDate).subtract(1, 'day'), 'day');
        }
        if (endDate) {
          return txDate.isBefore(dayjs(endDate).add(1, 'day'), 'day');
        }
        return true;
      });
    }
    return filtered;
  }, [storeTxs, startDate, endDate]);

  const handleExportExcel = () => {
    // We will export all data in multiple sheets
    const wb = utils.book_new();

    // 1. Rekap Simpanan
    const wsSavings = utils.json_to_sheet(
      savingsData.map((s) => ({
        "No. Anggota": s.no,
        "Nama": s.name,
        "Simpanan Pokok": s.pokok,
        "Simpanan Wajib": s.wajib,
        "Simpanan Sukarela": s.sukarela,
        "Total Saldo": s.total,
      }))
    );
    utils.book_append_sheet(wb, wsSavings, "Rekap_Simpanan");

    // 2. Daftar Pinjaman
    const wsLoans = utils.json_to_sheet(
      loansData.map((l) => ({
        "No. Anggota": l.memberNo,
        "Nama": l.memberName,
        "Tgl Cair": l.dateDisbursedFormatted,
        "Pinjaman Awal": l.amount,
        "Total Bayar Pokok": l.totalPrincipalPaid,
        "Total Bayar Bunga": l.totalInterestPaid,
        "Sisa Saldo Pinjaman": l.remainingBalance,
        "Laba Jasa (Total)": l.expectedProfit,
      }))
    );
    utils.book_append_sheet(wb, wsLoans, "Daftar_Pinjaman");

    // 3. Mutasi Kas
    const wsCashBook = utils.json_to_sheet(
      cashBookTxs.map((t) => ({
        "Tanggal": new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(t.date)),
        "Tipe": t.type,
        "Jenis Simpanan": t.savingsType,
        "Nominal": t.amount,
        "Keterangan": t.description || "-",
        "Anggota": t.member.name,
      }))
    );
    utils.book_append_sheet(wb, wsCashBook, "Buku_Kas");

    // Generate and download
    writeFile(wb, "Laporan_Keuangan_KSU_LIDIA.xlsx");
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">
            Laporan Keuangan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Rekapitulasi Simpanan, Pinjaman, Buku Kas, dan Transaksi Toko Lidia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="solid"
            onClick={handleExportExcel}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <PiDownloadSimpleBold className="mr-2 h-4 w-4" />
            Ekspor Excel
          </Button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <PiPrinterDuotone className="h-4.5 w-4.5" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Filter Tanggal */}
      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none transition focus:border-red-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Tanggal Akhir</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none transition focus:border-red-700"
          />
        </div>
        {(startDate || endDate) && (
          <Button
            variant="outline"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="text-gray-600 h-9"
          >
            Reset Tanggal
          </Button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => {
            setTab("savings");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "savings"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PiVaultDuotone className="h-4.5 w-4.5" />
          Simpanan Anggota
        </button>
        <button
          onClick={() => {
            setTab("loans");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "loans"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PiCoinsDuotone className="h-4.5 w-4.5" />
          Saldo Pinjaman Aktif
        </button>
        <button
          onClick={() => {
            setTab("cashbook");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "cashbook"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PiBookOpenDuotone className="h-4.5 w-4.5" />
          Buku Kas SP
        </button>
        <button
          onClick={() => {
            setTab("store");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "store"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PiStorefrontDuotone className="h-4.5 w-4.5" />
          Rugi/Laba Toko
        </button>
      </div>

      {/* Tab Contents */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Search Header for filterable tabs */}
        {tab !== "store" && (
          <div className="border-b border-gray-200 p-4">
            <div className="relative max-w-md">
              <PiMagnifyingGlassBold className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama anggota atau nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
              />
            </div>
          </div>
        )}

        {/* Tab 1: Savings Table */}
        {tab === "savings" && (
          <div className="overflow-x-auto">
            <Table
              variant="modern"
              className="w-full text-left text-sm text-gray-500"
            >
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    No. Anggota
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Nama Lengkap
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Simpanan Pokok
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Simpanan Wajib
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Simpanan Sukarela
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right font-bold text-gray-900"
                  >
                    Total Simpanan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSavings.map((s) => (
                  <tr key={s.id} className="transition hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      #{s.no}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-950">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatIDR(s.pokok)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatIDR(s.wajib)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatIDR(s.sukarela)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-800">
                      {formatIDR(s.total)}
                    </td>
                  </tr>
                ))}
                {filteredSavings.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Tidak ada data simpanan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredSavings.length > 0 && (
                <tfoot className="border-t border-gray-200 bg-red-50/50 font-bold text-gray-950">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-left">
                      JUMLAH REKAPITULASI
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatIDR(savingsTotals.pokok)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatIDR(savingsTotals.wajib)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatIDR(savingsTotals.sukarela)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-900">
                      {formatIDR(savingsTotals.total)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </Table>
          </div>
        )}

        {/* Tab 2: Loans Table */}
        {tab === "loans" && (
          <div className="overflow-x-auto">
            <Table
              variant="modern"
              className="w-full text-left text-sm text-gray-500"
            >
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    No. Anggota
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Nama Lengkap
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Tgl Cair
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Jumlah Pinjaman
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Provisi
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Cad. Resiko
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Sisa Hutang Pokok
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLoans.map((l) => (
                  <tr key={l.id} className="transition hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      #{l.no}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-950">
                      {l.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{l.date}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatIDR(l.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatIDR(l.provision)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatIDR(l.crk)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-800">
                      {formatIDR(l.remainingBalance)}
                    </td>
                  </tr>
                ))}
                {filteredLoans.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Tidak ada data pinjaman aktif ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredLoans.length > 0 && (
                <tfoot className="border-t border-gray-200 bg-red-50/50 font-bold text-gray-950">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-left">
                      JUMLAH REKAPITULASI
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatIDR(loansTotals.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatIDR(loansTotals.provision)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatIDR(loansTotals.crk)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-900">
                      {formatIDR(loansTotals.remainingBalance)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </Table>
          </div>
        )}

        {/* Tab 3: Cash Book Ledger */}
        {tab === "cashbook" && (
          <div className="overflow-x-auto">
            <Table
              variant="modern"
              className="w-full text-left text-sm text-gray-500"
            >
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Anggota
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Keterangan
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Penerimaan (Debet)
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Pengeluaran (Kredit)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCashBook.map((t) => {
                  const isDeposit = t.type === SAVINGS_TX_TYPES.DEPOSIT;
                  return (
                    <tr key={t.id} className="transition hover:bg-gray-50/70">
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(t.date).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {t.member.name} (#{t.member.no})
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {t.description || `${t.type} - ${t.savingsType}`}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-700">
                        {isDeposit ? formatIDR(Number(t.amount)) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-rose-700">
                        {!isDeposit ? formatIDR(Number(t.amount)) : "-"}
                      </td>
                    </tr>
                  );
                })}
                {filteredCashBook.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Tidak ada transaksi buku kas ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Tab 4: Rugi/Laba Toko P&L */}
        {tab === "store" && (
          <div className="overflow-x-auto p-6">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-gray-200">
              <Table
                variant="modern"
                className="w-full text-left text-sm text-gray-950"
              >
                <thead className="bg-red-800 text-xs font-bold uppercase text-white">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Uraian Rugi / Laba Toko
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Januari 2026
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Februari 2026
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Maret 2026
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* PENERIMAAN SECTION */}
                  <tr className="bg-red-50/30 font-bold text-red-900">
                    <td
                      colSpan={4}
                      className="px-6 py-3 text-xs uppercase tracking-wider"
                    >
                      I. Penerimaan
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 pl-10 text-gray-700">
                      Penjualan Barang Toko
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold">
                      {formatIDR(storePlData.jan.sales)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold">
                      {formatIDR(storePlData.feb.sales)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold">
                      {formatIDR(storePlData.mar.sales)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 pl-10 text-gray-700">
                      Penerimaan Lain (Laba Konsinyasi)
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-700">
                      {formatIDR(storePlData.jan.consignment)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-700">
                      {formatIDR(storePlData.feb.consignment)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-700">
                      {formatIDR(storePlData.mar.consignment)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="px-6 py-3.5 pl-6">Total Penerimaan</td>
                    <td className="px-6 py-3.5 text-right">
                      {formatIDR(storePlData.jan.totalReceipts)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {formatIDR(storePlData.feb.totalReceipts)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {formatIDR(storePlData.mar.totalReceipts)}
                    </td>
                  </tr>

                  {/* HPP SECTION */}
                  <tr className="border-t-2 border-gray-200 bg-red-50/30 font-bold text-red-900">
                    <td
                      colSpan={4}
                      className="px-6 py-3 text-xs uppercase tracking-wider"
                    >
                      II. Harga Pokok Penjualan (HPP)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 pl-10 text-gray-700">
                      Persediaan Awal Barang
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      {formatIDR(storePlData.jan.invStart)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      {formatIDR(storePlData.feb.invStart)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      {formatIDR(storePlData.mar.invStart)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 pl-10 text-gray-700">
                      Pembelian Barang Baru
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      {formatIDR(storePlData.jan.purchases)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      {formatIDR(storePlData.feb.purchases)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      {formatIDR(storePlData.mar.purchases)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 pl-10 text-gray-700">
                      Persediaan Akhir Barang
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      ({formatIDR(storePlData.jan.invEnd)})
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      ({formatIDR(storePlData.feb.invEnd)})
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-600">
                      ({formatIDR(storePlData.mar.invEnd)})
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="px-6 py-3.5 pl-6">
                      Harga Pokok Penjualan (HPP)
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-900">
                      {formatIDR(storePlData.jan.hpp)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-900">
                      {formatIDR(storePlData.feb.hpp)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-gray-900">
                      {formatIDR(storePlData.mar.hpp)}
                    </td>
                  </tr>

                  {/* GROSS PROFIT SECTION */}
                  <tr className="border-gray-250 border-t-2 bg-red-800 font-bold text-white">
                    <td className="px-6 py-4 uppercase">
                      III. Laba Bruto Toko
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-extrabold">
                      {formatIDR(storePlData.jan.grossProfit)}
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-extrabold">
                      {formatIDR(storePlData.feb.grossProfit)}
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-extrabold">
                      {formatIDR(storePlData.mar.grossProfit)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
