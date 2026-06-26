import { PrismaClient, SavingsType, SavingsTxType, LoanStatus, InstallmentStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

type ExtractedMember = {
  no: number;
  name: string;
  s_awal_hutang: number;
  angsuran: number;
  bunga: number;
  denda: number;
  tab_pokok: number;
  tab_wajib: number;
  tab_sukarela: number;
  s_awal_wajib: number;
  pengambilan_wajib: number;
  s_akhir_wajib: number;
  s_awal_sukarela: number;
  pengambilan_sukarela: number;
  s_akhir_sukarela: number;
  pinjaman_baru: number;
  provisi: number;
  cad_resiko_kredit: number;
};

export async function seedKsuLidiaData(prisma: PrismaClient) {
  console.log("📂  Seeding KSU Lidia member data...");

  const dataPath = path.join(__dirname, "extracted_members.json");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌  Extracted members file not found at: ${dataPath}`);
    return;
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const extractedMembers: ExtractedMember[] = JSON.parse(rawData);

  console.log(`Loaded ${extractedMembers.length} members from JSON.`);

  // We will seed in chunks or loop through them
  let memberCount = 0;
  let savingsCount = 0;
  let txCount = 0;
  let loanCount = 0;

  for (const m of extractedMembers) {
    // 1. Create or update Member
    const member = await prisma.member.upsert({
      where: { no: m.no },
      update: {
        name: m.name,
        isActive: true,
      },
      create: {
        no: m.no,
        name: m.name,
        isActive: true,
      },
    });
    memberCount++;

    // 2. Setup Savings Accounts (POKOK, WAJIB, SUKARELA)
    // Pokok savings is usually a fixed 100,000 once when joining
    const hasPokok = m.tab_pokok > 0 || m.s_akhir_wajib > 0 || m.s_akhir_sukarela > 0;
    const balancePokok = hasPokok ? 100000 : 0;

    await prisma.savingsAccount.upsert({
      where: { memberId_type: { memberId: member.id, type: SavingsType.POKOK } },
      update: { balance: balancePokok },
      create: { memberId: member.id, type: SavingsType.POKOK, balance: balancePokok },
    });
    savingsCount++;

    await prisma.savingsAccount.upsert({
      where: { memberId_type: { memberId: member.id, type: SavingsType.WAJIB } },
      update: { balance: m.s_akhir_wajib },
      create: { memberId: member.id, type: SavingsType.WAJIB, balance: m.s_akhir_wajib },
    });
    savingsCount++;

    await prisma.savingsAccount.upsert({
      where: { memberId_type: { memberId: member.id, type: SavingsType.SUKARELA } },
      update: { balance: m.s_akhir_sukarela },
      create: { memberId: member.id, type: SavingsType.SUKARELA, balance: m.s_akhir_sukarela },
    });
    savingsCount++;

    // 3. Log Savings Transactions for this month
    if (m.tab_pokok > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.POKOK,
          amount: m.tab_pokok,
          description: "Setoran Simpanan Pokok",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.tab_wajib > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.WAJIB,
          amount: m.tab_wajib,
          description: "Setoran Simpanan Wajib Bulanan",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.tab_sukarela > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.SUKARELA,
          amount: m.tab_sukarela,
          description: "Setoran Simpanan Sukarela",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.pengambilan_wajib > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.WITHDRAWAL,
          savingsType: SavingsType.WAJIB,
          amount: m.pengambilan_wajib,
          description: "Penarikan Simpanan Wajib",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.pengambilan_sukarela > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.WITHDRAWAL,
          savingsType: SavingsType.SUKARELA,
          amount: m.pengambilan_sukarela,
          description: "Penarikan Simpanan Sukarela",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    // 4. Create Loan if active
    const hasLoan = m.pinjaman_baru > 0 || m.s_awal_hutang > 0;
    if (hasLoan) {
      const isNew = m.pinjaman_baru > 0;
      const loanAmount = isNew ? m.pinjaman_baru : m.s_awal_hutang;
      const provision = isNew ? m.provisi : loanAmount * 0.01;
      const crk = isNew ? m.cad_resiko_kredit : loanAmount * 0.10;
      const receivedAmount = loanAmount - provision - crk;
      const interestRate = 1.0; // 1% flat
      const tenor = 10; // 10 months default
      const installmentAmount = (loanAmount / tenor) + (loanAmount * (interestRate / 100));

      const loan = await prisma.loan.create({
        data: {
          memberId: member.id,
          amount: loanAmount,
          interestRate,
          tenor,
          provision,
          crk,
          receivedAmount,
          installmentAmount,
          status: LoanStatus.ACTIVE,
          dateDisbursed: isNew ? new Date("2026-05-01") : new Date("2026-01-01"),
        },
      });
      loanCount++;

      // Create installments
      for (let i = 1; i <= tenor; i++) {
        const dueDate = new Date(loan.dateDisbursed);
        dueDate.setMonth(dueDate.getMonth() + i);

        // Assume first installment is paid if it was an old loan or if they made a payment this month
        const isPaidThisMonth = i === 1 && (m.angsuran > 0 || m.bunga > 0);
        
        await prisma.loanInstallment.create({
          data: {
            loanId: loan.id,
            monthNumber: i,
            principalPaid: isPaidThisMonth ? m.angsuran : 0,
            interestPaid: isPaidThisMonth ? m.bunga : 0,
            penaltyPaid: isPaidThisMonth ? m.denda : 0,
            totalPaid: isPaidThisMonth ? (m.angsuran + m.bunga + m.denda) : 0,
            dueDate,
            paidAt: isPaidThisMonth ? new Date("2026-05-15") : null,
            status: isPaidThisMonth ? InstallmentStatus.PAID : InstallmentStatus.UNPAID,
          },
        });
      }
    }
  }

  console.log(`✅  Seeded: ${memberCount} Members, ${savingsCount} Savings Accounts, ${txCount} Savings Transactions, ${loanCount} Loans.`);
}
