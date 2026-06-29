"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  PiUsersDuotone,
  PiVaultDuotone,
  PiCoinsDuotone,
  PiShoppingCartDuotone,
  PiTrendUpDuotone,
  PiPrinterDuotone,
  PiCaretRightBold,
  PiWarningDuotone,
  PiMedalDuotone,
} from "react-icons/pi";
import { formatNumber } from "@/lib/format";
import { Table } from "rizzui";

type Metrics = {
  totalMembers: number;
  totalSavings: number;
  totalPokok: number;
  totalWajib: number;
  totalSukarela: number;
  totalLoanDisbursed: number;
  totalLoanRemaining: number;
  totalStoreSales: number;
  totalStorePurchases: number;
  totalSpProfit: number;
  loanCount: number;
  totalInventoryValue: number;
  lowStockCount: number;
  totalProducts: number;
};

type ChartDataPoint = {
  monthName: string;
  sales: number;
  purchases: number;
};

type CashFlowDataPoint = {
  monthName: string;
  cashIn: number;
  cashOut: number;
};

type FinancialReportDataPoint = {
  id: string;
  periodDate: Date;
  entity: string;
  reportType: string;
  category: string;
  amount: number;
};

type TopProduct = {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  sellingPrice: number;
};

type ShuYear = {
  year: number;
  totalShu: number;
};

type DueSoonInstallment = {
  id: string;
  memberNo: number;
  memberName: string;
  dueDate: string | null;
  monthNumber: number;
  loanAmount: number;
};

type MemberWithDenda = {
  memberNo: number;
  memberName: string;
  totalDenda: number;
  count: number;
};

type Props = {
  metrics: Metrics;
  chartData: ChartDataPoint[];
  cashFlowData: CashFlowDataPoint[];
  financialReportData: FinancialReportDataPoint[];
  topProducts: TopProduct[];
  shuByYear: ShuYear[];
  dueSoonInstallments: DueSoonInstallment[];
  membersWithDenda: MemberWithDenda[];
};

export default function StatistikDashboard({
  metrics,
  chartData,
  cashFlowData,
  financialReportData,
  topProducts,
  shuByYear,
  dueSoonInstallments,
  membersWithDenda,
}: Props) {
  const router = useRouter();

  // Format to IDR Rupiah currency format
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const savingsPieData = [
    { name: "Simpanan Pokok", value: metrics.totalPokok, color: "#d4af37" },
    { name: "Simpanan Wajib", value: metrics.totalWajib, color: "#991b1b" },
    {
      name: "Simpanan Sukarela",
      value: metrics.totalSukarela,
      color: "#ea580c",
    },
  ];

  const compareBarData = [
    {
      name: "Simpan Pinjam",
      Simpanan: metrics.totalSavings,
      Pinjaman: metrics.totalLoanRemaining,
    },
  ];

  // Prepare Financial Report Pie Chart Data (e.g. Asset distribution)
  const reportPieData = React.useMemo(() => {
    // just a simple grouping by category for visualization
    const grouped = financialReportData.reduce(
      (acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = 0;
        acc[curr.category] += curr.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const colors = [
      "#0284c7",
      "#059669",
      "#d97706",
      "#dc2626",
      "#7c3aed",
      "#4f46e5",
    ];
    return Object.entries(grouped)
      .map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length],
      }))
      .filter((x) => x.value > 0);
  }, [financialReportData]);

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Dashboard & Statistik
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Statistik & Dashboard Analisis
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Monitor perkembangan total tabungan anggota, saldo pinjaman aktif
            perkreditan, penjualan toko kelontong, dan laba berjalan koperasi
            secara interaktif.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex h-fit items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          <PiPrinterDuotone className="h-5 w-5" />
          Cetak Statistik
        </button>
      </section>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Members */}
        <Link
          href="/users"
          className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-red-600 to-red-800 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/20"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-white/10 p-8 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-100">
              Total Anggota
            </span>
            <div className="rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-sm transition-transform group-hover:rotate-6 group-hover:scale-110">
              <PiUsersDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-3xl font-extrabold text-white">
              {formatNumber(metrics.totalMembers)}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-sm font-medium text-red-100">
              Lihat daftar anggota{" "}
              <PiCaretRightBold className="transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

        {/* Card 2: Savings */}
        <Link
          href="/simpan-pinjam"
          className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-white/10 p-8 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-50">
              Total Simpanan
            </span>
            <div className="rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-sm transition-transform group-hover:rotate-6 group-hover:scale-110">
              <PiVaultDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-3xl font-extrabold text-white">
              {formatIDR(metrics.totalSavings)}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-sm font-medium text-amber-50">
              Rincian data simpanan{" "}
              <PiCaretRightBold className="transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

        {/* Card 3: Saldo Pinjaman Aktif */}
        <Link
          href="/simpan-pinjam/pinjaman"
          className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/20"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-white/10 p-8 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-50">
              Saldo Pinjaman Aktif
            </span>
            <div className="rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-sm transition-transform group-hover:rotate-6 group-hover:scale-110">
              <PiCoinsDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-3xl font-extrabold text-white">
              {formatIDR(metrics.totalLoanRemaining)}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-sm font-medium text-orange-50">
              Kelola pinjaman aktif{" "}
              <PiCaretRightBold className="transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </Link>

        {/* Card 4: Toko Sales */}
        <Link
          href="/toko/transaksi"
          className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-white/10 p-8 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Penjualan Toko
            </span>
            <div className="rounded-xl bg-white/20 p-2.5 text-white backdrop-blur-sm transition-transform group-hover:rotate-6 group-hover:scale-110">
              <PiShoppingCartDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-3xl font-extrabold text-white">
              {formatIDR(metrics.totalStoreSales)}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-100">
              Cek riwayat transaksi{" "}
              <PiCaretRightBold className="transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </Link>
      </div>

      {/* Inventory Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Produk Aktif
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatNumber(metrics.totalProducts)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            item terdaftar di katalog
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Nilai Inventaris
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatIDR(metrics.totalInventoryValue)}
          </p>
          <p className="mt-1 text-xs text-gray-400">modal stok tersimpan</p>
        </div>
        <div
          className={`rounded-xl border p-5 shadow-sm ${metrics.lowStockCount > 0 ? "border-rose-200 bg-rose-50" : "border-gray-200 bg-white"}`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${metrics.lowStockCount > 0 ? "text-rose-600" : "text-gray-500"}`}
          >
            Stok Hampir Habis
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${metrics.lowStockCount > 0 ? "text-rose-700" : "text-gray-900"}`}
          >
            {metrics.lowStockCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            produk perlu restock segera
          </p>
        </div>
      </div>

      {/* Auxiliary profit card */}
      <Link href="/laporan" className="group block outline-none">
        <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-400 hover:shadow-xl hover:shadow-red-900/10 md:flex-row md:items-center">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-red-100/30 to-transparent"></div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="rounded-2xl bg-red-800 p-3.5 text-white shadow-md transition-transform group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-red-900/20">
              <PiTrendUpDuotone className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-red-900">
                Total Laba Simpan Pinjam
              </h4>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
                Akumulasi laba bruto simpan pinjam yang berasal dari pendapatan
                Bunga, Provisi, dan Denda Anggota berjalan saat ini. Klik untuk
                melihat laporan komprehensif.
              </p>
            </div>
          </div>
          <div className="relative z-10 text-left md:text-right">
            <span className="block text-3xl font-black tracking-tight text-red-800 lg:text-4xl">
              {formatIDR(metrics.totalSpProfit)}
            </span>
            <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-red-700 opacity-90 md:justify-end">
              Lihat laporan laba rugi{" "}
              <PiCaretRightBold className="transition-transform group-hover:translate-x-1" />
            </p>
          </div>
        </div>
      </Link>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Toko Sales / Purchases Trend */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                Tren Penjualan & Pembelian Toko Lidia
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Perbandingan grafik pendapatan kotor dengan pembelian suplai
                stok.
              </p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#991b1b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#991b1b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="monthName"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), ""]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: 500,
                  }}
                  cursor={{
                    stroke: "#fca5a5",
                    strokeWidth: 2,
                    strokeDasharray: "5 5",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 13,
                    fontWeight: 500,
                    paddingTop: 15,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Penjualan Toko"
                  stroke="#991b1b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#991b1b" }}
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name="Pembelian Stok"
                  stroke="#ea580c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purchGrad)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#ea580c" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Composition */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div>
            <h3 className="mb-2 text-lg font-bold text-gray-950">
              Komposisi Dana Simpanan
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Rasio alokasi dana pokok, wajib, dan sukarela keseluruhan anggota
              koperasi.
            </p>
          </div>
          <div className="flex min-h-[400px] w-full items-center justify-center pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={savingsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {savingsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), ""]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: 500,
                  }}
                  itemStyle={{ color: "#111827" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {savingsPieData.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: d.color }}
                  ></span>
                  <span className="text-sm font-medium text-gray-700">
                    {d.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatIDR(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison & Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Simpanan vs Pinjaman */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-950">
                Simpanan vs Saldo Pinjaman
              </h3>
              <p className="text-sm text-gray-500">
                Likuiditas simpan pinjam berjalan.
              </p>
            </div>
            <Link
              href="/simpan-pinjam"
              className="rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
              title="Lihat Detail"
            >
              <PiCaretRightBold />
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compareBarData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), ""]}
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: 500,
                  }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
                />
                <Bar
                  dataKey="Simpanan"
                  fill="#d4af37"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="Pinjaman"
                  fill="#991b1b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Reports Pie Chart */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md lg:col-span-2">
          <div>
            <h3 className="mb-2 text-lg font-bold text-gray-950">
              Ringkasan Laporan Keuangan
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Distribusi saldo berdasarkan kategori laporan keuangan.
            </p>
          </div>
          <div className="flex min-h-[400px] w-full items-center justify-center pt-4">
            {reportPieData.every((d) => d.value === 0) ? (
              <div className="text-gray-400">
                Belum ada data laporan keuangan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {reportPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatIDR(Number(value)), ""]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontWeight: 500,
                    }}
                    itemStyle={{ color: "#111827" }}
                  />
                  <Legend
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Cash Flow Row */}
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                Arus Kas (Cash Flow)
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Perbandingan Kas Masuk (Debit) dan Kas Keluar (Kredit) bulanan.
              </p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cashFlowData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cashInGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cashOutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="monthName"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), ""]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: 500,
                  }}
                  cursor={{
                    stroke: "#9ca3af",
                    strokeWidth: 2,
                    strokeDasharray: "5 5",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 13,
                    fontWeight: 500,
                    paddingTop: 15,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cashIn"
                  name="Kas Masuk"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cashInGrad)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#059669" }}
                />
                <Area
                  type="monotone"
                  dataKey="cashOut"
                  name="Kas Keluar"
                  stroke="#dc2626"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cashOutGrad)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#dc2626" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Products + SHU Trend + Due Soon */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Produk stok rendah (dari DB) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                Stok Produk (Prioritas Restock)
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Diurutkan berdasarkan stok terendah.
              </p>
            </div>
            <Link
              href="/toko/produk"
              className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-red-700 transition-colors hover:text-red-900"
            >
              Lihat Semua
              <PiCaretRightBold />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Belum ada produk aktif.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <Table variant="modern" className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Kode</th>
                    <th className="px-4 py-3 font-semibold">Nama</th>
                    <th className="px-4 py-3 text-right font-semibold">Stok</th>
                    <th className="px-4 py-3 text-right font-semibold">Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProducts.map((p) => {
                    const low = p.stock <= p.minStock;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => router.push("/toko/produk")}
                        className="group cursor-pointer bg-white transition-colors hover:bg-red-50/50"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-950 group-hover:text-red-800">
                          {p.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {p.name}
                          {p.category && p.category !== "-" && (
                            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                              {p.category}
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${low ? "text-red-700" : "text-gray-900"}`}
                        >
                          {low && (
                            <PiWarningDuotone className="mr-1 inline text-red-500" />
                          )}
                          {p.stock}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {p.minStock}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* SHU Trend tahunan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-950">
              Trend SHU Tahunan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Total Sisa Hasil Usaha yang didistribusikan per tahun.
            </p>
          </div>
          {shuByYear.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400">
              Belum ada data SHU terdistribusi.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shuByYear}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="year"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatIDR(Number(value)),
                      "Total SHU",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontWeight: 500,
                    }}
                    cursor={{ fill: "#f3f4f6" }}
                  />
                  <Bar
                    dataKey="totalShu"
                    name="Total SHU"
                    fill="#d4af37"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <Link
            href="/simpan-pinjam/shu"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-900"
          >
            <PiMedalDuotone className="text-base" />
            Kelola Distribusi SHU
            <PiCaretRightBold className="text-xs" />
          </Link>
        </div>
      </div>

      {/* Cicilan Jatuh Tempo */}
      {dueSoonInstallments.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <PiWarningDuotone className="text-xl" />
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Cicilan Jatuh Tempo 7 Hari ke Depan
              </h3>
              <p className="text-sm text-amber-700">
                {dueSoonInstallments.length} cicilan segera jatuh tempo — segera
                proses pembayaran.
              </p>
            </div>
            <Link
              href="/simpan-pinjam/pinjaman"
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-950"
            >
              Proses <PiCaretRightBold />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-amber-200">
            <Table variant="modern" className="w-full text-left text-sm">
              <thead className="bg-amber-100 text-xs uppercase text-amber-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">No.</th>
                  <th className="px-4 py-3 font-semibold">Nama Anggota</th>
                  <th className="px-4 py-3 font-semibold">Bulan ke-</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Jatuh Tempo
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Jml Pinjaman
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {dueSoonInstallments.map((inst) => {
                  const due = inst.dueDate ? new Date(inst.dueDate) : null;
                  const today = new Date();
                  const diffDays = due
                    ? Math.ceil((due.getTime() - today.getTime()) / 86400000)
                    : null;
                  return (
                    <tr key={inst.id} className="bg-white hover:bg-amber-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-950">
                        {inst.memberNo}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {inst.memberName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {inst.monthNumber}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            diffDays !== null && diffDays <= 2
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {due
                            ? due.toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                          {diffDays !== null && ` (${diffDays}h)`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatIDR(inst.loanAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      )}
      {/* Anggota Denda Tertunggak */}
      {membersWithDenda.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <PiWarningDuotone className="text-xl" />
            </span>
            <div>
              <h3 className="text-base font-bold text-red-900">
                Anggota dengan Denda Tertunggak
              </h3>
              <p className="text-sm text-red-700">
                {membersWithDenda.length} anggota memiliki denda yang belum
                lunas.
              </p>
            </div>
            <Link
              href="/simpan-pinjam/pinjaman"
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-950"
            >
              Lihat Pinjaman <PiCaretRightBold />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-red-200">
            <Table variant="modern" className="w-full text-left text-sm">
              <thead className="bg-red-100 text-xs uppercase text-red-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">No.</th>
                  <th className="px-4 py-3 font-semibold">Nama Anggota</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Jml Cicilan
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Denda
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {membersWithDenda.map((m, idx) => (
                  <tr key={idx} className="bg-white hover:bg-red-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-950">
                      {m.memberNo}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {m.memberName}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {m.count}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-800">
                      {formatIDR(m.totalDenda)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
