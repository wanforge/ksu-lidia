import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/authz";
import { routes } from "@/config/routes";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";
import QuickAction from "@/app/(hydrogen)/_components/quick-action";
import {
  PiUserCircleDuotone,
  PiUserGearDuotone,
  PiClockCountdownDuotone,
  PiClockCounterClockwiseDuotone,
  PiPulseDuotone,
  PiUsersDuotone,
  PiCoinsDuotone,
  PiReceiptDuotone,
  PiShoppingCartDuotone,
  PiCubeDuotone,
  PiWarningCircleDuotone,
  PiStorefrontDuotone,
  PiUsersThreeDuotone,
  PiTrendDownDuotone,
  PiTrendUpDuotone,
  PiArrowRightBold,
} from "react-icons/pi";

export const dynamic = "force-dynamic";

function greeting(now: Date) {
  const h = now.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function Home() {
  const session = await getSession();
  const now = new Date();
  const role = session?.user?.role;
  const firstName = (session?.user?.name ?? "").trim().split(/\s+/)[0] || "";

  // 1. Fetch real-time aggregates and activity from database
  const [
    memberCount,
    activeLoanCount,
    productCount,
    lowStockProductCount,
    savingsAccounts,
    activeLoans,
    salesTransactions,
    recentSavingsTx,
    recentSalesTx,
    recentLoans,
    userCount,
    activeUserCount,
  ] = await Promise.all([
    // Total members
    prisma.member.count({ where: { deletedAt: null } }),
    // Active loans count
    prisma.loan.count({ where: { status: "ACTIVE" } }),
    // Total products
    prisma.product.count({ where: { isActive: true } }),
    // Low stock products count
    prisma.product.count({ where: { isActive: true, stock: { lt: 10 } } }),
    // Savings accounts balances
    prisma.savingsAccount.findMany({
      select: { balance: true },
    }),
    // Active loans balances
    prisma.loan.findMany({
      where: { status: "ACTIVE" },
      select: { amount: true },
    }),
    // Total store sales transactions
    prisma.productTransaction.findMany({
      where: { type: "SALE" },
      select: { totalAmount: true },
    }),
    // Recent savings transactions
    prisma.savingsTransaction.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: {
        member: { select: { name: true } },
      },
    }),
    // Recent store transactions
    prisma.productTransaction.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    }),
    // Recent loans disbursed
    prisma.loan.findMany({
      take: 5,
      orderBy: { dateDisbursed: "desc" },
      include: {
        member: { select: { name: true } },
      },
    }),
    // Total users
    prisma.user.count({ where: { deletedAt: null } }),
    // Active users
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
  ]);

  // 2. Calculations
  const totalSavings = savingsAccounts.reduce(
    (acc, account) => acc + Number(account.balance),
    0
  );
  const totalLoans = activeLoans.reduce(
    (acc, loan) => acc + Number(loan.amount),
    0
  );
  const totalSales = salesTransactions.reduce(
    (acc, tx) => acc + Number(tx.totalAmount),
    0
  );

  // Quick actions gated by permission
  const quickActions = [
    {
      label: "Portal Saya",
      hint: "Akses profil dan akun pribadi Anda",
      href: routes.me.dashboard,
      icon: PiUserCircleDuotone,
      tone: "blue" as const,
      show: can(role, PERMISSIONS.PORTAL_VIEW),
    },
    {
      label: "Manajemen Pengguna",
      hint: "Kelola akun pengguna dan hak akses",
      href: routes.users.list,
      icon: PiUserGearDuotone,
      tone: "rose" as const,
      show: can(role, PERMISSIONS.USER_MANAGE),
    },
    {
      label: "Audit Log",
      hint: "Lihat log riwayat aktivitas sistem",
      href: routes.audit.list,
      icon: PiClockCountdownDuotone,
      tone: "slate" as const,
      show: can(role, PERMISSIONS.AUDIT_VIEW),
    },
    {
      label: "Log Perubahan Data",
      hint: "Pantau riwayat perubahan detail data",
      href: routes.dataChangeLog,
      icon: PiClockCounterClockwiseDuotone,
      tone: "amber" as const,
      show: can(role, PERMISSIONS.DATA_CHANGE_LOG_VIEW),
    },
    {
      label: "Diagnostik Sistem",
      hint: "Periksa status kesehatan sistem",
      href: routes.system,
      icon: PiPulseDuotone,
      tone: "teal" as const,
      show: can(role, PERMISSIONS.SYSTEM_VIEW),
    },
  ].filter((a) => a.show);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Welcome Hero Banner */}
      <section className="relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-950 via-red-950 to-amber-900 p-6 text-white shadow-md">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500 opacity-10 blur-3xl"></div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
          KSU Lidia GKJ Manahan
        </p>
        <h1 className="text-2xl font-bold md:text-3xl">
          {greeting(now)}, {firstName ? `${firstName} 👋` : "Rekan Kerja 👋"}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-amber-100/90">
          Selamat bekerja kembali di Sistem Informasi Manajemen KSP &amp; Toko
          Lidia. Semua transaksi tercatat aman secara otomatis pada log audit.
        </p>
      </section>

      {/* Main Stats Aggregates Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card 1: Total Simpanan */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Total Simpanan Anggota
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
              <PiCoinsDuotone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Rp {formatNumber(totalSavings)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-600">
              <PiTrendUpDuotone className="h-3.5 w-3.5" />
              <span>Dari seluruh rekening tabungan</span>
            </p>
          </div>
        </div>

        {/* Metric Card 2: Outstanding Pinjaman */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Outstanding Pinjaman
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
              <PiReceiptDuotone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Rp {formatNumber(totalLoans)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
              <PiTrendDownDuotone className="h-3.5 w-3.5" />
              <span>Penyaluran pinjaman aktif ({activeLoanCount} kontrak)</span>
            </p>
          </div>
        </div>

        {/* Metric Card 3: Omzet Penjualan Toko */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Omzet Penjualan Toko
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
              <PiShoppingCartDuotone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Rp {formatNumber(totalSales)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600">
              <PiStorefrontDuotone className="h-3.5 w-3.5" />
              <span>Akumulasi transaksi penjualan</span>
            </p>
          </div>
        </div>

        {/* Metric Card 4: Total Anggota */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Anggota Terdaftar
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
              <PiUsersDuotone className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(memberCount)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
              <PiUsersThreeDuotone className="h-3.5 w-3.5" />
              <span>Anggota terintegrasi aktif</span>
            </p>
          </div>
        </div>
      </section>

      {/* Auxiliary Info Panel: Toko & System Info */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Toko Lidia Inventory Alert */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <PiCubeDuotone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Kesehatan Inventori Toko
                </h3>
                <p className="text-xs text-gray-500">
                  Stok produk ritel &amp; toko KSU
                </p>
              </div>
            </div>
            <Link
              href="/toko/produk"
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline"
            >
              <span>Detail Katalog</span>
              <PiArrowRightBold className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <span className="block text-xs text-gray-500">
                Total Item Katalog
              </span>
              <span className="mt-1 block text-xl font-bold text-gray-900">
                {productCount} Jenis Produk
              </span>
            </div>
            <div
              className={`rounded-xl p-4 ${lowStockProductCount > 0 ? "bg-red-50 text-red-900" : "bg-gray-50 text-gray-900"}`}
            >
              <span className="block text-xs text-gray-500">
                Stok Menipis (&lt; 10)
              </span>
              <span className="mt-1 block flex items-center gap-1.5 text-xl font-bold">
                {lowStockProductCount > 0 && (
                  <PiWarningCircleDuotone className="h-5 w-5 animate-pulse text-red-600" />
                )}
                {lowStockProductCount} Item
              </span>
            </div>
          </div>
        </div>

        {/* System & Access Status */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <PiPulseDuotone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Keamanan &amp; Akses Pengguna
                </h3>
                <p className="text-xs text-gray-500">
                  Status kelayakan server &amp; hak akses
                </p>
              </div>
            </div>
            <Link
              href="/sistem"
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline"
            >
              <span>Status Server</span>
              <PiArrowRightBold className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <span className="block text-xs text-gray-500">
                Pengguna Sistem
              </span>
              <span className="mt-1 block text-xl font-bold text-gray-900">
                {userCount} Akun Terdaftar
              </span>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <span className="block text-xs text-gray-500">
                Status Sesi Aktif
              </span>
              <span className="mt-1 block text-xl font-bold text-gray-900">
                {activeUserCount} Online / Aktif
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Column 1: Simpanan Terbaru */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-semibold text-gray-900">
              Setoran &amp; Penarikan
            </h3>
            <p className="text-xs text-gray-500">
              Mutasi simpanan anggota teranyar
            </p>
          </div>
          <div className="mt-4 divide-y divide-gray-50">
            {recentSavingsTx.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Belum ada transaksi
              </p>
            ) : (
              recentSavingsTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-gray-900">
                      {tx.member.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.savingsType} •{" "}
                      {new Date(tx.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      tx.type === "DEPOSIT" ? "text-teal-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? "+" : "-"} Rp{" "}
                    {formatNumber(Number(tx.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Pinjaman Baru */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-semibold text-gray-900">
              Pinjaman Baru Disalurkan
            </h3>
            <p className="text-xs text-gray-500">
              Akad pembiayaan kredit terbaru
            </p>
          </div>
          <div className="mt-4 divide-y divide-gray-50">
            {recentLoans.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Belum ada penyaluran
              </p>
            ) : (
              recentLoans.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-gray-900">
                      {l.member.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tenor {l.tenor} Bln •{" "}
                      {new Date(l.dateDisbursed).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    Rp {formatNumber(Number(l.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Penjualan Toko Terbaru */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-semibold text-gray-900">
              Penjualan Kasir Toko
            </h3>
            <p className="text-xs text-gray-500">
              Catatan omzet penjualan ritel terbaru
            </p>
          </div>
          <div className="mt-4 divide-y divide-gray-50">
            {recentSalesTx.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Belum ada transaksi toko
              </p>
            ) : (
              recentSalesTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-gray-900">
                      {tx.notes || "Transaksi Toko"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.items.length} item •{" "}
                      {new Date(tx.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="font-semibold text-teal-600">
                    Rp {formatNumber(Number(tx.totalAmount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Quick Access Menu Options */}
      {quickActions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-950">
            Akses Cepat Pengaturan
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {quickActions.map((a) => (
              <QuickAction
                key={a.label}
                label={a.label}
                hint={a.hint}
                href={a.href}
                icon={a.icon}
                tone={a.tone}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
