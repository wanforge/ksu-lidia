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
  PiDownloadSimpleBold,
  PiCalendarDuotone,
  PiScalesDuotone,
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

type AllLoan = {
  id: string;
  amount: any;
  interestRate: any;
  tenor: number;
  provision: any;
  crk: any;
  installmentAmount: any;
  status: string;
  dateDisbursed: any;
  member: { id: string; no: number; name: string };
  installments: {
    id: string;
    monthNumber: number;
    principalPaid: any;
    interestPaid: any;
    penaltyPaid: any;
    totalPaid: any;
    dueDate: any;
    paidAt: any;
    status: string;
  }[];
};

type CashKop = {
  id: string;
  date: any;
  type: string;
  amount: any;
  description: string | null;
};

type LaporanWorkspaceProps = {
  members: Member[];
  loans: Loan[];
  cashBookTxs: CashBookTx[];
  storeTxs: StoreTx[];
  allLoans: AllLoan[];
  cashKoperasi: CashKop[];
};

export default function LaporanWorkspace({
  members,
  loans,
  cashBookTxs,
  storeTxs,
  allLoans,
  cashKoperasi,
}: LaporanWorkspaceProps) {
  const [tab, setTab] = useState<
    "savings" | "loans" | "cashbook" | "store" | "bulanan" | "neraca"
  >("savings");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [storeYear, setStoreYear] = useState(currentYear);
  const [storeQuarter, setStoreQuarter] = useState<1 | 2 | 3 | 4>(
    Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4
  );

  // Laporan Bulanan state
  const [bulananYear, setBulananYear] = useState(currentYear);
  const [bulananMonth, setBulananMonth] = useState(currentMonth);

  // Neraca state
  const [neracaYear, setNeracaYear] = useState(currentYear);
  const [neracaMonth, setNeracaMonth] = useState(currentMonth);

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
          return txDate.isBetween(
            startDate,
            dayjs(endDate).endOf("day"),
            "day",
            "[]"
          );
        }
        if (startDate) {
          return txDate.isAfter(dayjs(startDate).subtract(1, "day"), "day");
        }
        if (endDate) {
          return txDate.isBefore(dayjs(endDate).add(1, "day"), "day");
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
      const totalInterestPaid = paidInstallments.reduce(
        (sum, i) => sum + (Number(i.interestPaid) || 0),
        0
      );
      const expectedProfit =
        provision +
        crk +
        l.installments.reduce(
          (sum, i) => sum + (Number(i.interestPaid) || 0),
          0
        );

      return {
        id: l.id,
        memberNo: l.member.no,
        memberName: l.member.name,
        dateDisbursedFormatted: new Date(l.dateDisbursed).toLocaleDateString(
          "id-ID"
        ),
        amount,
        provision,
        crk,
        installmentAmount,
        paidMonths: paidInstallments.length,
        remainingBalance,
        totalPrincipalPaid,
        totalInterestPaid,
        expectedProfit,
        no: l.member.no,
        name: l.member.name,
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
          return txDate.isBetween(
            startDate,
            dayjs(endDate).endOf("day"),
            "day",
            "[]"
          );
        }
        if (startDate) {
          return txDate.isAfter(dayjs(startDate).subtract(1, "day"), "day");
        }
        if (endDate) {
          return txDate.isBefore(dayjs(endDate).add(1, "day"), "day");
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
          return txDate.isBetween(
            startDate,
            dayjs(endDate).endOf("day"),
            "day",
            "[]"
          );
        }
        if (startDate) {
          return txDate.isAfter(dayjs(startDate).subtract(1, "day"), "day");
        }
        if (endDate) {
          return txDate.isBefore(dayjs(endDate).add(1, "day"), "day");
        }
        return true;
      });
    }
    return filtered;
  }, [storeTxs, startDate, endDate]);

  const storePlMonths = useMemo(() => {
    const q = storeQuarter;
    const y = storeYear;
    // months 1-based for each quarter
    const m1 = (q - 1) * 3 + 1;
    return [m1, m1 + 1, m1 + 2].map((month) => {
      const txs = storeTxs.filter((tx) => {
        const d = dayjs(tx.date);
        return d.year() === y && d.month() + 1 === month;
      });
      const sales = txs
        .filter((t) => t.type === "SALE")
        .reduce((s, t) => s + Number(t.totalAmount), 0);
      const purchases = txs
        .filter((t) => t.type === "PURCHASE")
        .reduce((s, t) => s + Number(t.totalAmount), 0);
      return {
        month,
        year: y,
        label: dayjs(`${y}-${String(month).padStart(2, "0")}-01`).format(
          "MMMM YYYY"
        ),
        sales,
        consignment: 0, // konsinyasi dicatat manual via CashTransaction, tidak ada di ProductTx
        purchases,
        // HPP = pembelian (proxy; inventory method butuh stok awal/akhir manual)
        hpp: purchases,
        totalReceipts: sales,
        grossProfit: sales - purchases,
      };
    });
  }, [storeTxs, storeYear, storeQuarter]);

  // --- LAPORAN BULANAN per anggota ---
  const BULAN_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const bulananData = useMemo(() => {
    const y = bulananYear;
    const m = bulananMonth;
    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59);

    return members.map((member) => {
      // Simpanan saldo per akhir bulan ini
      const pokok =
        Number(
          member.savingsAccounts.find((a) => a.type === "POKOK")?.balance
        ) || 0;
      const wajib =
        Number(
          member.savingsAccounts.find((a) => a.type === "WAJIB")?.balance
        ) || 0;
      const sukarela =
        Number(
          member.savingsAccounts.find((a) => a.type === "SUKARELA")?.balance
        ) || 0;

      // Pinjaman aktif bulan ini
      const activeLoan = allLoans.find(
        (l) =>
          l.member.id === member.id &&
          l.status === "ACTIVE" &&
          new Date(l.dateDisbursed) <= endOfMonth
      );

      let sawalHutang = 0;
      let angsuran = 0;
      let bunga = 0;
      let denda = 0;
      let sakhirHutang = 0;

      if (activeLoan) {
        const monthlyPrincipal = Number(activeLoan.amount) / activeLoan.tenor;
        const monthlyInterest =
          Number(activeLoan.amount) * (Number(activeLoan.interestRate) / 100);

        // Cari installment bulan ini
        const inst = activeLoan.installments.find((i) => {
          const due = new Date(i.dueDate);
          return due >= startOfMonth && due <= endOfMonth;
        });

        // Saldo awal = total pinjaman - total pokok yang sudah dibayar sebelum bulan ini
        const paidBefore = activeLoan.installments
          .filter(
            (i) => i.status === "PAID" && new Date(i.paidAt) < startOfMonth
          )
          .reduce((s, i) => s + Number(i.principalPaid), 0);

        sawalHutang = Number(activeLoan.amount) - paidBefore;

        if (inst && inst.status === "PAID") {
          angsuran = Number(inst.principalPaid) || monthlyPrincipal;
          bunga = Number(inst.interestPaid) || monthlyInterest;
          denda = Number(inst.penaltyPaid) || 0;
        } else {
          angsuran = 0;
          bunga = 0;
          denda = 0;
        }
        sakhirHutang = sawalHutang - angsuran;
      }

      return {
        no: member.no,
        name: member.name,
        sawalHutang,
        angsuran,
        bunga,
        denda,
        sakhirHutang,
        tabWajib: wajib,
        tabSukarela: sukarela,
        tabPokok: pokok,
      };
    });
  }, [members, allLoans, bulananYear, bulananMonth]);

  const filteredBulanan = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return bulananData;
    return bulananData.filter(
      (r) => r.name.toLowerCase().includes(q) || r.no.toString().includes(q)
    );
  }, [bulananData, searchQuery]);

  // --- NERACA ---
  const neracaData = useMemo(() => {
    const y = neracaYear;
    const m = neracaMonth;
    const asOf = new Date(y, m, 0, 23, 59, 59); // end of selected month

    // AKTIVA
    // Kas = saldo CashTransaction s/d tanggal
    const kas = cashKoperasi
      .filter((t) => new Date(t.date) <= asOf)
      .reduce(
        (s, t) => s + (t.type === "IN" ? Number(t.amount) : -Number(t.amount)),
        0
      );

    // Simpanan anggota (aset koperasi = tabungan anggota yg disimpan)
    const totalSimpananPokok = members.reduce(
      (s, m) =>
        s +
        (Number(m.savingsAccounts.find((a) => a.type === "POKOK")?.balance) ||
          0),
      0
    );
    const totalSimpananWajib = members.reduce(
      (s, m) =>
        s +
        (Number(m.savingsAccounts.find((a) => a.type === "WAJIB")?.balance) ||
          0),
      0
    );
    const totalSimpananSukarela = members.reduce(
      (s, m) =>
        s +
        (Number(
          m.savingsAccounts.find((a) => a.type === "SUKARELA")?.balance
        ) || 0),
      0
    );

    // Piutang pinjaman = sisa outstanding
    const piutangPinjaman = allLoans
      .filter((l) => l.status === "ACTIVE" && new Date(l.dateDisbursed) <= asOf)
      .reduce((s, l) => {
        const paidPrincipal = l.installments
          .filter((i) => i.status === "PAID")
          .reduce((sum, i) => sum + Number(i.principalPaid), 0);
        return s + (Number(l.amount) - paidPrincipal);
      }, 0);

    // Pendapatan bunga+denda terakumulasi (laba SP)
    const pendapatanBunga = allLoans.reduce(
      (s, l) =>
        s +
        l.installments
          .filter((i) => i.status === "PAID" && new Date(i.paidAt) <= asOf)
          .reduce(
            (sum, i) => sum + Number(i.interestPaid) + Number(i.penaltyPaid),
            0
          ),
      0
    );
    const pendapatanProvisi = allLoans
      .filter((l) => new Date(l.dateDisbursed) <= asOf)
      .reduce((s, l) => s + Number(l.provision), 0);

    const totalAktiva = kas + piutangPinjaman;

    // PASIVA — simpanan anggota (kewajiban koperasi ke anggota)
    const totalSimpanan =
      totalSimpananPokok + totalSimpananWajib + totalSimpananSukarela;
    const labaBersih = pendapatanBunga + pendapatanProvisi;
    // Modal = total aktiva - kewajiban (simpanan)
    const modal = totalAktiva - totalSimpanan;

    return {
      aktiva: { kas, piutangPinjaman, totalAktiva },
      pasiva: {
        simpananPokok: totalSimpananPokok,
        simpananWajib: totalSimpananWajib,
        simpananSukarela: totalSimpananSukarela,
        totalSimpanan,
        modal,
        totalPasiva: totalSimpanan + modal,
      },
      info: { pendapatanBunga, pendapatanProvisi, labaBersih },
    };
  }, [members, allLoans, cashKoperasi, neracaYear, neracaMonth]);

  const handleExportExcel = () => {
    // We will export all data in multiple sheets
    const wb = utils.book_new();

    // 1. Rekap Simpanan
    const wsSavings = utils.json_to_sheet(
      savingsData.map((s) => ({
        "No. Anggota": s.no,
        Nama: s.name,
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
        Nama: l.memberName,
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
        Tanggal: new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(t.date)),
        Tipe: t.type,
        "Jenis Simpanan": t.savingsType,
        Nominal: t.amount,
        Keterangan: t.description || "-",
        Anggota: t.member.name,
      }))
    );
    utils.book_append_sheet(wb, wsCashBook, "Buku_Kas");

    // 4. Laporan Bulanan SP
    const wsBulanan = utils.json_to_sheet(
      bulananData.map((r) => ({
        No: r.no,
        Nama: r.name,
        "S.Awal Hutang": r.sawalHutang,
        Angsuran: r.angsuran,
        Bunga: r.bunga,
        Denda: r.denda,
        "S.Akhir Hutang": r.sakhirHutang,
        "Tab Wajib": r.tabWajib,
        "Tab Sukarela": r.tabSukarela,
        "Tab Pokok": r.tabPokok,
      }))
    );
    const bulananTitle = `Laporan_Bulanan_${BULAN_NAMES[bulananMonth - 1]}_${bulananYear}`;
    utils.book_append_sheet(wb, wsBulanan, bulananTitle.slice(0, 31));

    // 5. Neraca
    const wsNeraca = utils.json_to_sheet([
      { Keterangan: "AKTIVA", Jumlah: "" },
      { Keterangan: "Kas", Jumlah: neracaData.aktiva.kas },
      {
        Keterangan: "Piutang Pinjaman Anggota",
        Jumlah: neracaData.aktiva.piutangPinjaman,
      },
      { Keterangan: "TOTAL AKTIVA", Jumlah: neracaData.aktiva.totalAktiva },
      { Keterangan: "PASIVA - KEWAJIBAN", Jumlah: "" },
      { Keterangan: "Simpanan Pokok", Jumlah: neracaData.pasiva.simpananPokok },
      { Keterangan: "Simpanan Wajib", Jumlah: neracaData.pasiva.simpananWajib },
      {
        Keterangan: "Simpanan Sukarela",
        Jumlah: neracaData.pasiva.simpananSukarela,
      },
      { Keterangan: "Total Simpanan", Jumlah: neracaData.pasiva.totalSimpanan },
      { Keterangan: "EKUITAS", Jumlah: "" },
      {
        Keterangan: "Modal / SHU Terakumulasi",
        Jumlah: neracaData.pasiva.modal,
      },
      {
        Keterangan: "TOTAL PASIVA + EKUITAS",
        Jumlah: neracaData.pasiva.totalPasiva,
      },
      { Keterangan: "INFO LABA SP", Jumlah: "" },
      {
        Keterangan: "Pendapatan Bunga + Denda",
        Jumlah: neracaData.info.pendapatanBunga,
      },
      {
        Keterangan: "Pendapatan Provisi",
        Jumlah: neracaData.info.pendapatanProvisi,
      },
      { Keterangan: "Total Laba SP", Jumlah: neracaData.info.labaBersih },
    ]);
    utils.book_append_sheet(
      wb,
      wsNeraca,
      `Neraca_${BULAN_NAMES[neracaMonth - 1]}_${neracaYear}`
    );

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
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none transition focus:border-red-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            Tanggal Akhir
          </label>
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
            className="h-9 text-gray-600"
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
        <button
          onClick={() => {
            setTab("bulanan");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "bulanan"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PiCalendarDuotone className="h-4.5 w-4.5" />
          Laporan Bulanan
        </button>
        <button
          onClick={() => {
            setTab("neraca");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            tab === "neraca"
              ? "border-red-700 text-red-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PiScalesDuotone className="h-4.5 w-4.5" />
          Neraca
        </button>
      </div>

      {/* Tab Contents */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Search Header for filterable tabs */}
        {tab !== "store" && tab !== "neraca" && (
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
            {/* Period selector */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <select
                value={storeYear}
                onChange={(e) => setStoreYear(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {Array.from({ length: 8 }, (_, i) => currentYear - 3 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
              <select
                value={storeQuarter}
                onChange={(e) =>
                  setStoreQuarter(Number(e.target.value) as 1 | 2 | 3 | 4)
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={1}>Triwulan I (Jan–Mar)</option>
                <option value={2}>Triwulan II (Apr–Jun)</option>
                <option value={3}>Triwulan III (Jul–Sep)</option>
                <option value={4}>Triwulan IV (Okt–Des)</option>
              </select>
            </div>
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
                    {storePlMonths.map((m) => (
                      <th
                        key={m.month}
                        scope="col"
                        className="px-6 py-3.5 text-right"
                      >
                        {m.label}
                      </th>
                    ))}
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
                    {storePlMonths.map((m) => (
                      <td
                        key={m.month}
                        className="px-6 py-3.5 text-right font-semibold"
                      >
                        {formatIDR(m.sales)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 pl-10 text-gray-700">
                      Penerimaan Lain (Laba Konsinyasi)
                    </td>
                    {storePlMonths.map((m) => (
                      <td
                        key={m.month}
                        className="px-6 py-3.5 text-right text-gray-700"
                      >
                        {formatIDR(m.consignment)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="px-6 py-3.5 pl-6">Total Penerimaan</td>
                    {storePlMonths.map((m) => (
                      <td key={m.month} className="px-6 py-3.5 text-right">
                        {formatIDR(m.totalReceipts)}
                      </td>
                    ))}
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
                      Pembelian Barang
                    </td>
                    {storePlMonths.map((m) => (
                      <td
                        key={m.month}
                        className="px-6 py-3.5 text-right text-gray-600"
                      >
                        {formatIDR(m.purchases)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="px-6 py-3.5 pl-6">
                      Harga Pokok Penjualan (HPP)
                    </td>
                    {storePlMonths.map((m) => (
                      <td
                        key={m.month}
                        className="px-6 py-3.5 text-right text-gray-900"
                      >
                        {formatIDR(m.hpp)}
                      </td>
                    ))}
                  </tr>

                  {/* GROSS PROFIT SECTION */}
                  <tr className="border-gray-250 border-t-2 bg-red-800 font-bold text-white">
                    <td className="px-6 py-4 uppercase">
                      III. Laba Bruto Toko
                    </td>
                    {storePlMonths.map((m) => (
                      <td
                        key={m.month}
                        className="px-6 py-4 text-right text-lg font-extrabold"
                      >
                        {formatIDR(m.grossProfit)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 5: Laporan Bulanan Simpan Pinjam */}
        {tab === "bulanan" && (
          <div className="overflow-x-auto p-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <select
                value={bulananYear}
                onChange={(e) => setBulananYear(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {Array.from({ length: 8 }, (_, i) => currentYear - 3 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
              <select
                value={bulananMonth}
                onChange={(e) => setBulananMonth(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {BULAN_NAMES.map((b, i) => (
                  <option key={i + 1} value={i + 1}>
                    {b}
                  </option>
                ))}
              </select>
              <span className="text-sm font-semibold text-gray-700">
                {BULAN_NAMES[bulananMonth - 1]} {bulananYear} —{" "}
                {filteredBulanan.length} anggota
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table variant="modern" className="w-full text-xs text-gray-900">
                <thead className="bg-red-800 text-xs font-bold uppercase text-white">
                  <tr>
                    <th className="px-3 py-3 text-center">No</th>
                    <th className="px-3 py-3">Nama</th>
                    <th className="px-3 py-3 text-right">S.Awal Hutang</th>
                    <th className="px-3 py-3 text-right">Angsuran</th>
                    <th className="px-3 py-3 text-right">Bunga</th>
                    <th className="px-3 py-3 text-right">Denda</th>
                    <th className="px-3 py-3 text-right">S.Akhir Hutang</th>
                    <th className="px-3 py-3 text-right">Tab Wajib</th>
                    <th className="px-3 py-3 text-right">Tab Sukarela</th>
                    <th className="px-3 py-3 text-right">Tab Pokok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBulanan.map((row) => (
                    <tr key={row.no} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-center text-gray-500">
                        {row.no}
                      </td>
                      <td className="px-3 py-2.5 font-medium">{row.name}</td>
                      <td className="px-3 py-2.5 text-right">
                        {row.sawalHutang > 0 ? formatIDR(row.sawalHutang) : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {row.angsuran > 0 ? formatIDR(row.angsuran) : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {row.bunga > 0 ? formatIDR(row.bunga) : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right text-rose-600">
                        {row.denda > 0 ? formatIDR(row.denda) : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold">
                        {row.sakhirHutang > 0
                          ? formatIDR(row.sakhirHutang)
                          : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {formatIDR(row.tabWajib)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {formatIDR(row.tabSukarela)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {formatIDR(row.tabPokok)}
                      </td>
                    </tr>
                  ))}
                  {filteredBulanan.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-10 text-center text-gray-400"
                      >
                        Tidak ada data anggota.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 6: Neraca */}
        {tab === "neraca" && (
          <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <select
                value={neracaYear}
                onChange={(e) => setNeracaYear(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {Array.from({ length: 8 }, (_, i) => currentYear - 3 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
              <select
                value={neracaMonth}
                onChange={(e) => setNeracaMonth(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {BULAN_NAMES.map((b, i) => (
                  <option key={i + 1} value={i + 1}>
                    {b}
                  </option>
                ))}
              </select>
              <span className="text-sm font-semibold text-gray-700">
                Per {BULAN_NAMES[neracaMonth - 1]} {neracaYear}
              </span>
            </div>
            <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-red-800 text-xs font-bold uppercase text-white">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Keterangan</th>
                    <th className="px-6 py-3.5 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* AKTIVA */}
                  <tr className="bg-red-50/40 font-bold text-red-900">
                    <td
                      colSpan={2}
                      className="px-6 py-2.5 text-xs uppercase tracking-wider"
                    >
                      AKTIVA
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">Kas</td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatIDR(neracaData.aktiva.kas)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Piutang Pinjaman Anggota
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatIDR(neracaData.aktiva.piutangPinjaman)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="px-6 py-3">TOTAL AKTIVA</td>
                    <td className="px-6 py-3 text-right text-red-800">
                      {formatIDR(neracaData.aktiva.totalAktiva)}
                    </td>
                  </tr>
                  {/* PASIVA */}
                  <tr className="bg-red-50/40 font-bold text-red-900">
                    <td
                      colSpan={2}
                      className="px-6 py-2.5 text-xs uppercase tracking-wider"
                    >
                      PASIVA — KEWAJIBAN
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Simpanan Pokok Anggota
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatIDR(neracaData.pasiva.simpananPokok)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Simpanan Wajib Anggota
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatIDR(neracaData.pasiva.simpananWajib)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Simpanan Sukarela Anggota
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatIDR(neracaData.pasiva.simpananSukarela)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-3 pl-6">Total Simpanan</td>
                    <td className="px-6 py-3 text-right">
                      {formatIDR(neracaData.pasiva.totalSimpanan)}
                    </td>
                  </tr>
                  <tr className="bg-red-50/40 font-bold text-red-900">
                    <td
                      colSpan={2}
                      className="px-6 py-2.5 text-xs uppercase tracking-wider"
                    >
                      EKUITAS
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Modal / SHU Terakumulasi
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatIDR(neracaData.pasiva.modal)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold text-gray-900">
                    <td className="px-6 py-3">TOTAL PASIVA + EKUITAS</td>
                    <td className="px-6 py-3 text-right text-red-800">
                      {formatIDR(neracaData.pasiva.totalPasiva)}
                    </td>
                  </tr>
                  {/* INFO */}
                  <tr className="bg-red-50/40 font-bold text-red-900">
                    <td
                      colSpan={2}
                      className="px-6 py-2.5 text-xs uppercase tracking-wider"
                    >
                      INFO LABA SIMPAN PINJAM
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Pendapatan Bunga + Denda
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatIDR(neracaData.info.pendapatanBunga)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-3 pl-10 text-gray-700">
                      Pendapatan Provisi
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatIDR(neracaData.info.pendapatanProvisi)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-6 py-3 pl-6 text-green-800">
                      Total Laba SP
                    </td>
                    <td className="px-6 py-3 text-right text-green-800">
                      {formatIDR(neracaData.info.labaBersih)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
