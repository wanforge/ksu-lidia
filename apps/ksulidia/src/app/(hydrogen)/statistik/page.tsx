import {
  SAVINGS_TYPES,
  LOAN_STATUS,
  INSTALLMENT_STATUS,
  CASH_TX_TYPES,
} from "@/lib/constants";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";
import StatistikDashboard from "./statistik-dashboard";

export const dynamic = "force-dynamic";

export default async function StatistikPage() {
  const session = await getSession();

  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.SIMPAN_PINJAM_VIEW)
  ) {
    return (
      <div className="mx-auto w-full max-w-[900px] rounded-md border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
        Hanya pengguna berwenang yang dapat melihat data statistik KSU Lidia.
      </div>
    );
  }

  // 1. Fetch total members count
  const totalMembers = await prisma.member.count({
    where: { deletedAt: null },
  });

  // 2. Fetch savings totals
  const savingsAccounts = await prisma.savingsAccount.findMany();
  let totalPokok = 0;
  let totalWajib = 0;
  let totalSukarela = 0;

  savingsAccounts.forEach((acc) => {
    const bal = Number(acc.balance) || 0;
    if (acc.type === SAVINGS_TYPES.POKOK) totalPokok += bal;
    else if (acc.type === SAVINGS_TYPES.WAJIB) totalWajib += bal;
    else if (acc.type === SAVINGS_TYPES.SUKARELA) totalSukarela += bal;
  });

  const totalSavings = totalPokok + totalWajib + totalSukarela;

  // 3. Fetch active loans and remaining balances
  const loans = await prisma.loan.findMany({
    where: { status: LOAN_STATUS.ACTIVE },
    include: {
      installments: true,
    },
  });

  let totalLoanDisbursed = 0;
  let totalLoanRemaining = 0;
  let totalInterestEarned = 0; // accumulated paid interest
  let totalProvisionEarned = 0; // total provision fees
  let totalPenaltyEarned = 0; // total penalty paid

  loans.forEach((l) => {
    const loanAmt = Number(l.amount) || 0;
    totalLoanDisbursed += loanAmt;
    totalProvisionEarned += Number(l.provision) || 0;

    let principalPaid = 0;
    l.installments.forEach((inst) => {
      if (inst.status === INSTALLMENT_STATUS.PAID) {
        principalPaid += Number(inst.principalPaid) || 0;
        totalInterestEarned += Number(inst.interestPaid) || 0;
        totalPenaltyEarned += Number(inst.penaltyPaid) || 0;
      }
    });
    totalLoanRemaining += loanAmt - principalPaid;
  });

  // Profit from savings & loans (bunga + provisi + denda)
  const totalSpProfit =
    totalInterestEarned + totalProvisionEarned + totalPenaltyEarned;

  // 4. Fetch store products for inventory stats
  const products = await prisma.product.findMany({ where: { isActive: true } });
  const totalInventoryValue = products.reduce(
    (s, p) => s + p.stock * Number(p.purchasePrice),
    0
  );
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // 4b. Fetch store transactions
  const storeTx = await prisma.productTransaction.findMany();
  let totalStoreSales = 0;
  let totalStorePurchases = 0;

  storeTx.forEach((tx) => {
    const amt = Number(tx.totalAmount) || 0;
    if (tx.type === "SALE") {
      totalStoreSales += amt;
    } else if (tx.type === "PURCHASE") {
      totalStorePurchases += amt;
    }
  });

  // Calculate monthly sales & purchases for chart (real database data)
  const monthlyMap: Record<
    number,
    { monthName: string; sales: number; purchases: number }
  > = {
    0: { monthName: "Jan", sales: 0, purchases: 0 },
    1: { monthName: "Feb", sales: 0, purchases: 0 },
    2: { monthName: "Mar", sales: 0, purchases: 0 },
    3: { monthName: "Apr", sales: 0, purchases: 0 },
    4: { monthName: "Mei", sales: 0, purchases: 0 },
    5: { monthName: "Jun", sales: 0, purchases: 0 },
  };

  storeTx.forEach((tx) => {
    const date = new Date(tx.date);
    const month = date.getMonth(); // 0 = Jan, 1 = Feb, etc.
    if (month >= 0 && month <= 5) {
      const amt = Number(tx.totalAmount) || 0;
      if (tx.type === "SALE") {
        monthlyMap[month].sales += amt;
      } else if (tx.type === "PURCHASE") {
        monthlyMap[month].purchases += amt;
      }
    }
  });

  const chartData = Object.values(monthlyMap);

  // 5. Fetch Cash Transactions
  const cashTx = await prisma.cashTransaction.findMany();

  // Calculate monthly cash in and cash out
  const cashMonthlyMap: Record<
    number,
    { monthName: string; cashIn: number; cashOut: number }
  > = {
    0: { monthName: "Jan", cashIn: 0, cashOut: 0 },
    1: { monthName: "Feb", cashIn: 0, cashOut: 0 },
    2: { monthName: "Mar", cashIn: 0, cashOut: 0 },
    3: { monthName: "Apr", cashIn: 0, cashOut: 0 },
    4: { monthName: "Mei", cashIn: 0, cashOut: 0 },
    5: { monthName: "Jun", cashIn: 0, cashOut: 0 },
    6: { monthName: "Jul", cashIn: 0, cashOut: 0 },
    7: { monthName: "Agt", cashIn: 0, cashOut: 0 },
    8: { monthName: "Sep", cashIn: 0, cashOut: 0 },
    9: { monthName: "Okt", cashIn: 0, cashOut: 0 },
    10: { monthName: "Nov", cashIn: 0, cashOut: 0 },
    11: { monthName: "Des", cashIn: 0, cashOut: 0 },
  };

  cashTx.forEach((tx) => {
    const date = new Date(tx.date);
    const month = date.getMonth();
    if (month >= 0 && month <= 11) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "IN") {
        cashMonthlyMap[month].cashIn += amt;
      } else if (tx.type === "OUT") {
        cashMonthlyMap[month].cashOut += amt;
      }
    }
  });

  // Take only until current month to avoid flatlines for future months, but since seed has all year maybe it's fine.
  const cashFlowData = Object.values(cashMonthlyMap).filter(
    (m) => m.cashIn > 0 || m.cashOut > 0 || m.monthName === "Jan"
  );

  // 6. Fetch Financial Reports
  const financialReports = await prisma.financialReport.findMany();

  const financialReportData = financialReports.map((fr) => ({
    id: fr.id,
    periodDate: fr.periodDate,
    entity: fr.entity,
    reportType: fr.reportType,
    category: fr.category,
    amount: Number(fr.amount) || 0,
  }));

  return (
    <StatistikDashboard
      metrics={{
        totalMembers,
        totalSavings,
        totalPokok,
        totalWajib,
        totalSukarela,
        totalLoanDisbursed,
        totalLoanRemaining,
        totalStoreSales,
        totalStorePurchases,
        totalSpProfit,
        loanCount: loans.length,
        totalInventoryValue,
        lowStockCount,
        totalProducts: products.length,
      }}
      chartData={chartData}
      cashFlowData={cashFlowData}
      financialReportData={financialReportData}
    />
  );
}
