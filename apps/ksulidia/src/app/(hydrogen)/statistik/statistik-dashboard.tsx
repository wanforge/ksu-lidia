"use client";

import React from "react";
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
} from "react-icons/pi";
import { formatNumber } from "@/lib/format";

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
};

type ChartDataPoint = {
  monthName: string;
  sales: number;
  purchases: number;
};

type Props = {
  metrics: Metrics;
  chartData: ChartDataPoint[];
};

export default function StatistikDashboard({ metrics, chartData }: Props) {
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

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            Dashboard & Statistik
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            Statistik & Dashboard Analisis
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Monitor perkembangan total tabungan anggota, saldo pinjaman aktif
            perkreditan, penjualan toko kelontong, dan laba berjalan koperasi.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
        >
          <PiPrinterDuotone className="h-4.5 w-4.5" />
          Cetak Statistik
        </button>
      </section>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Members */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Anggota
            </span>
            <div className="rounded-lg bg-red-50 p-2 text-red-700">
              <PiUsersDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.totalMembers)}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Anggota aktif terdaftar
            </p>
          </div>
        </div>

        {/* Card 2: Savings */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Simpanan
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <PiVaultDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatIDR(metrics.totalSavings)}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Pokok, wajib & sukarela
            </p>
          </div>
        </div>

        {/* Card 3: Saldo Pinjaman Aktif */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Saldo Pinjaman Aktif
            </span>
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <PiCoinsDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatIDR(metrics.totalLoanRemaining)}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Dari {metrics.loanCount} pinjaman aktif
            </p>
          </div>
        </div>

        {/* Card 4: Toko Sales */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Penjualan Toko
            </span>
            <div className="rounded-lg bg-red-50 p-2 text-red-800">
              <PiShoppingCartDuotone className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatIDR(metrics.totalStoreSales)}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Periode Triwulan I 2026
            </p>
          </div>
        </div>
      </div>

      {/* Auxiliary profit card */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-red-100 bg-gradient-to-br from-red-50/40 to-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-red-800 p-3 text-white">
            <PiTrendUpDuotone className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              Total Laba Simpan Pinjam
            </h4>
            <p className="mt-0.5 text-sm text-gray-600">
              Akumulasi laba bruto simpan pinjam yang berasal dari pendapatan
              Bunga, Provisi, dan Denda Anggota.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-red-850 text-3xl font-extrabold">
            {formatIDR(metrics.totalSpProfit)}
          </span>
          <p className="mt-1 text-xs text-gray-500">
            Waktu nyata dari transaksi berjalan
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Toko Sales / Purchases Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-6 text-base font-bold text-gray-950">
            Tren Penjualan & Pembelian Toko Lidia
          </h3>
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
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), ""]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Penjualan"
                  stroke="#991b1b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name="Pembelian Stok"
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purchGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Composition */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="mb-2 text-base font-bold text-gray-950">
              Komposisi Dana Simpanan
            </h3>
            <p className="mb-4 text-xs text-gray-500">
              Rasio alokasi dana pokok, wajib, dan sukarela anggota.
            </p>
          </div>
          <div className="flex h-60 w-full items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={savingsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {savingsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {savingsPieData.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: d.color }}
                  ></span>
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
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
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-base font-bold text-gray-950">
            Simpanan vs Saldo Pinjaman Aktif
          </h3>
          <p className="mb-6 text-xs text-gray-500">
            Likuiditas simpan pinjam anggota berjalan.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compareBarData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                />
                <Legend iconType="square" />
                <Bar dataKey="Simpanan" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pinjaman" fill="#991b1b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products stock list */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-gray-950">
            Daftar Produk Terlaris & Stok Terkini
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Kode
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Nama Produk
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Kategori
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Stok
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Harga Jual
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-950">
                    IND-01
                  </td>
                  <td className="px-4 py-3">Indomie Goreng (Dus)</td>
                  <td className="px-4 py-3">Sembako</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    45
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatIDR(115000)}
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-950">
                    BRS-01
                  </td>
                  <td className="px-4 py-3">Beras Ramos Premium 5kg</td>
                  <td className="px-4 py-3">Sembako</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    120
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatIDR(72000)}
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-950">
                    GLA-01
                  </td>
                  <td className="px-4 py-3">Gula Pasir Gulaku 1kg</td>
                  <td className="px-4 py-3">Sembako</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    150
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatIDR(17500)}
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-950">
                    MYK-01
                  </td>
                  <td className="px-4 py-3">Minyak Goreng Bimoli 2L</td>
                  <td className="px-4 py-3">Sembako</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    85
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatIDR(36000)}
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-950">
                    TEH-01
                  </td>
                  <td className="px-4 py-3">Teh Celup Sariwangi 25s</td>
                  <td className="px-4 py-3">Minuman</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    200
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatIDR(7500)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
