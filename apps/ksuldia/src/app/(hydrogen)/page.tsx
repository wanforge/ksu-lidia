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
  PiCalendarCheckDuotone,
  PiHandshakeDuotone,
  PiChartLineUpDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";
import {
  StaggerContainer,
  FadeUp,
  AnimatedCounter,
  PulseRing,
  WavingHand,
  ShimmerBar,
  FloatingOrbs,
  ActivityItem,
  LiveClock,
} from "@/app/(hydrogen)/_components/dashboard-client";

export const dynamic = "force-dynamic";

function greeting(now: Date) {
  const h = now.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function getMotivation(now: Date) {
  const h = now.getHours();
  if (h < 11)
    return "Semangat memulai hari! ☀️ Yuk cek aktivitas terbaru hari ini.";
  if (h < 15)
    return "Tetap produktif di jam sibuk! 💪 Pastikan semua transaksi tercatat.";
  if (h < 19)
    return "Sore yang produktif! 🌅 Saatnya review progres hari ini.";
  return "Terima kasih atas kerja kerasnya hari ini! 🌙 Jangan lupa istirahat.";
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
    <div className="flex w-full flex-col gap-7">
      {/* ╔══════════════════════════════════════════════╗
          ║          HERO WELCOME BANNER                 ║
          ╚══════════════════════════════════════════════╝ */}
      <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-950 via-red-950/90 to-amber-900 p-7 text-white shadow-lg sm:p-8">
        {/* Animated background orbs */}
        <FloatingOrbs />
        {/* Shimmer sweep */}
        <ShimmerBar />

        {/* Decorative mesh pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300 backdrop-blur-sm">
                <PulseRing color="bg-emerald-400" />
                Sistem Aktif
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              {greeting(now)},{" "}
              {firstName ? (
                <>
                  {firstName} <WavingHand />
                </>
              ) : (
                <>
                  Rekan Kerja <WavingHand />
                </>
              )}
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-amber-100/80">
              {getMotivation(now)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <LiveClock />
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-amber-200/70 backdrop-blur-sm">
              KSU Lidia GKJ Manahan
            </p>
          </div>
        </div>

        {/* Quick summary chips */}
        <div className="relative z-10 mt-1 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <PiUsersDuotone className="h-3.5 w-3.5 text-amber-300" />
            {memberCount} Anggota
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <PiHandshakeDuotone className="h-3.5 w-3.5 text-amber-300" />
            {activeLoanCount} Pinjaman Aktif
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <PiCubeDuotone className="h-3.5 w-3.5 text-amber-300" />
            {productCount} Produk Toko
          </span>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════╗
          ║          MAIN STATS GRID                     ║
          ╚══════════════════════════════════════════════╝ */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card 1: Total Simpanan */}
        <FadeUp>
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            {/* Gradient accent bar */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Total Simpanan Anggota
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 ring-1 ring-teal-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-teal-100">
                <PiCoinsDuotone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={totalSavings} prefix="Rp " />
              </h3>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-teal-600">
                <PiTrendUpDuotone className="h-3.5 w-3.5" />
                <span>Dari seluruh rekening tabungan</span>
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Metric Card 2: Outstanding Pinjaman */}
        <FadeUp>
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-rose-400 to-pink-400 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Outstanding Pinjaman
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 ring-1 ring-rose-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-rose-100">
                <PiReceiptDuotone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={totalLoans} prefix="Rp " />
              </h3>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                <PiTrendDownDuotone className="h-3.5 w-3.5" />
                <span>
                  Penyaluran pinjaman aktif ({activeLoanCount} kontrak)
                </span>
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Metric Card 3: Omzet Penjualan Toko */}
        <FadeUp>
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Omzet Penjualan Toko
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-blue-100">
                <PiShoppingCartDuotone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={totalSales} prefix="Rp " />
              </h3>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-blue-600">
                <PiStorefrontDuotone className="h-3.5 w-3.5" />
                <span>Akumulasi transaksi penjualan</span>
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Metric Card 4: Total Anggota */}
        <FadeUp>
          <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Anggota Terdaftar
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-1 ring-amber-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-amber-100">
                <PiUsersDuotone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={memberCount} />
              </h3>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-600">
                <PiUsersThreeDuotone className="h-3.5 w-3.5" />
                <span>Anggota terintegrasi aktif</span>
              </p>
            </div>
          </div>
        </FadeUp>
      </StaggerContainer>

      {/* ╔══════════════════════════════════════════════╗
          ║          INFO PANELS (INVENTORY & SYSTEM)    ║
          ╚══════════════════════════════════════════════╝ */}
      <StaggerContainer
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        delay={0.2}
      >
        {/* Toko Lidia Inventory Alert */}
        <FadeUp>
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-1 ring-amber-100">
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
                className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
              >
                <span>Detail Katalog</span>
                <PiArrowRightBold className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <PiCubeDuotone className="h-3.5 w-3.5" />
                  Total Item Katalog
                </span>
                <span className="mt-2 block text-2xl font-bold text-gray-900">
                  <AnimatedCounter value={productCount} duration={0.8} />
                </span>
                <span className="text-xs text-gray-400">Jenis Produk</span>
              </div>
              <div
                className={`rounded-xl border p-4 ${
                  lowStockProductCount > 0
                    ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
                    : "border-gray-100 bg-gradient-to-br from-gray-50 to-white"
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <PiWarningCircleDuotone
                    className={`h-3.5 w-3.5 ${lowStockProductCount > 0 ? "text-red-500" : ""}`}
                  />
                  Stok Menipis (&lt; 10)
                </span>
                <span
                  className={`mt-2 flex items-center gap-1.5 text-2xl font-bold ${
                    lowStockProductCount > 0 ? "text-red-700" : "text-gray-900"
                  }`}
                >
                  {lowStockProductCount > 0 && (
                    <PiWarningCircleDuotone className="h-5 w-5 animate-pulse text-red-500" />
                  )}
                  <AnimatedCounter
                    value={lowStockProductCount}
                    duration={0.8}
                  />
                </span>
                <span
                  className={`text-xs ${lowStockProductCount > 0 ? "text-red-400" : "text-gray-400"}`}
                >
                  Item perlu restok
                </span>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* System & Access Status */}
        <FadeUp>
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 ring-1 ring-teal-100">
                  <PiShieldCheckDuotone className="h-5 w-5" />
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
                className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
              >
                <span>Status Server</span>
                <PiArrowRightBold className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <PiUserGearDuotone className="h-3.5 w-3.5" />
                  Pengguna Sistem
                </span>
                <span className="mt-2 block text-2xl font-bold text-gray-900">
                  <AnimatedCounter value={userCount} duration={0.8} />
                </span>
                <span className="text-xs text-gray-400">Akun Terdaftar</span>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <PulseRing color="bg-emerald-500" />
                  Status Sesi Aktif
                </span>
                <span className="mt-2 block text-2xl font-bold text-emerald-700">
                  <AnimatedCounter value={activeUserCount} duration={0.8} />
                </span>
                <span className="text-xs text-emerald-500">Online / Aktif</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </StaggerContainer>

      {/* ╔══════════════════════════════════════════════╗
          ║          RECENT ACTIVITIES                   ║
          ╚══════════════════════════════════════════════╝ */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <PiChartLineUpDuotone className="h-5 w-5 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">
            Aktivitas Terbaru
          </h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Column 1: Simpanan Terbaru */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-transparent p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                  <PiCoinsDuotone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Setoran &amp; Penarikan
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Mutasi simpanan anggota teranyar
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-50 px-5">
              {recentSavingsTx.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <PiCalendarCheckDuotone className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">Belum ada transaksi</p>
                </div>
              ) : (
                recentSavingsTx.map((tx, i) => (
                  <ActivityItem
                    key={tx.id}
                    index={i}
                    className="flex items-center justify-between py-3.5 text-sm"
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
                      className={`whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-bold ${
                        tx.type === "DEPOSIT"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? "+" : "−"} Rp{" "}
                      {formatNumber(Number(tx.amount))}
                    </span>
                  </ActivityItem>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Pinjaman Baru */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-rose-50/50 to-transparent p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <PiReceiptDuotone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Pinjaman Baru Disalurkan
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Akad pembiayaan kredit terbaru
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-50 px-5">
              {recentLoans.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <PiHandshakeDuotone className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Belum ada penyaluran
                  </p>
                </div>
              ) : (
                recentLoans.map((l, i) => (
                  <ActivityItem
                    key={l.id}
                    index={i}
                    className="flex items-center justify-between py-3.5 text-sm"
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
                    <span className="whitespace-nowrap rounded-lg bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-700">
                      Rp {formatNumber(Number(l.amount))}
                    </span>
                  </ActivityItem>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Penjualan Toko Terbaru */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <PiShoppingCartDuotone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Penjualan Kasir Toko
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Catatan omzet penjualan ritel terbaru
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-50 px-5">
              {recentSalesTx.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <PiStorefrontDuotone className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Belum ada transaksi toko
                  </p>
                </div>
              ) : (
                recentSalesTx.map((tx, i) => (
                  <ActivityItem
                    key={tx.id}
                    index={i}
                    className="flex items-center justify-between py-3.5 text-sm"
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
                    <span className="whitespace-nowrap rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                      Rp {formatNumber(Number(tx.totalAmount))}
                    </span>
                  </ActivityItem>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════╗
          ║          QUICK ACCESS ACTIONS                ║
          ╚══════════════════════════════════════════════╝ */}
      {quickActions.length > 0 && (
        <StaggerContainer className="space-y-4" delay={0.3}>
          <FadeUp>
            <div className="flex items-center gap-2">
              <PiPulseDuotone className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">
                Akses Cepat Pengaturan
              </h2>
            </div>
          </FadeUp>
          <FadeUp>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          </FadeUp>
        </StaggerContainer>
      )}
    </div>
  );
}
