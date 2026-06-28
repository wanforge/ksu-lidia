import { PrismaClient, SavingsType, SavingsTxType, LoanStatus, InstallmentStatus } from "@prisma/client";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

export async function seedLaporanBulanan(prisma: PrismaClient) {
  console.log("📂 Seeding Laporan Bulanan Simpan Pinjam...");

  const dataPath = path.join(__dirname, "../../../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Excel file not found at: ${dataPath}`);
    return;
  }

  const workbook = xlsx.readFile(dataPath);
  const sheetName = "MEI 2026"; // Assuming we want the latest data
  
  if (!workbook.SheetNames.includes(sheetName)) {
     console.error(`❌ Sheet '${sheetName}' not found in the excel file.`);
     return;
  }

  const sheet = workbook.Sheets[sheetName];
  // Parse rows starting from row 4
  const jsonOptions = { header: 1, range: 3 }; 
  const rows = xlsx.utils.sheet_to_json(sheet, jsonOptions) as any[];

  let memberCount = 0;
  let savingsCount = 0;
  let txCount = 0;
  let loanCount = 0;

  for (const row of rows) {
    const rawNo = row[0]; // A
    const rawName = row[1]; // B

    if (!rawNo || typeof rawNo !== "number" || !rawName || String(rawName).trim() === "") {
      continue; // Skip invalid rows
    }

    const no = rawNo;
    let name = String(rawName).trim();
    
    // Normalize data: check if deceased
    const deceasedIndicator = "(meninggal)";
    const isDeceased = name.toLowerCase().includes(deceasedIndicator.toLowerCase());
    
    if (isDeceased) {
      // Remove the (meninggal) part from the name
      name = name.replace(/\(\s*meninggal\s*\)/i, "").trim();
    }

    const debt = Number(row[2]) || 0; // C: S. Awal Hutang
    const installment = Number(row[3]) || 0; // D: Angsuran
    const interest = Number(row[4]) || 0; // E: Bunga
    const penalty = Number(row[5]) || 0; // F: Denda

    const tab_pokok = Number(row[6]) || 0; // G: Pokok
    const tab_wajib = Number(row[7]) || 0; // H: Wajib
    const tab_sukarela = Number(row[8]) || 0; // I: Sukarela

    const s_awal_wajib = Number(row[10]) || 0; // K: S. Awal Wajib
    const wd_wajib = Number(row[11]) || 0; // L: Pengambilan Wajib
    const s_akhir_wajib = Number(row[12]) || 0; // M: S. Akhir Wajib

    const s_awal_sukarela = Number(row[13]) || 0; // N: S. Awal Sukarela
    const wd_sukarela = Number(row[14]) || 0; // O: Pengambilan Sukarela
    const s_akhir_sukarela = Number(row[15]) || 0; // P: S. Akhir Sukarela

    const new_loan = Number(row[16]) || 0; // Q: Pinjaman Baru
    const provision = Number(row[17]) || 0; // R: Provisi
    const crk = Number(row[18]) || 0; // S: Cad. Resiko Kredit

    // 1. Create or update Member
    const member = await prisma.member.upsert({
      where: { no: no },
      update: {
        name: name,
        isActive: !isDeceased,
        isDeceased: isDeceased,
      },
      create: {
        no: no,
        name: name,
        isActive: !isDeceased,
        isDeceased: isDeceased,
      },
    });
    memberCount++;

    // 2. Setup Savings Accounts
    const hasPokok = tab_pokok > 0 || s_akhir_wajib > 0 || s_akhir_sukarela > 0;
    const balancePokok = hasPokok ? 100000 : 0;

    await prisma.savingsAccount.upsert({
      where: { memberId_type: { memberId: member.id, type: SavingsType.POKOK } },
      update: { balance: balancePokok },
      create: { memberId: member.id, type: SavingsType.POKOK, balance: balancePokok },
    });
    savingsCount++;

    await prisma.savingsAccount.upsert({
      where: { memberId_type: { memberId: member.id, type: SavingsType.WAJIB } },
      update: { balance: s_akhir_wajib },
      create: { memberId: member.id, type: SavingsType.WAJIB, balance: s_akhir_wajib },
    });
    savingsCount++;

    await prisma.savingsAccount.upsert({
      where: { memberId_type: { memberId: member.id, type: SavingsType.SUKARELA } },
      update: { balance: s_akhir_sukarela },
      create: { memberId: member.id, type: SavingsType.SUKARELA, balance: s_akhir_sukarela },
    });
    savingsCount++;

    // 3. Log Savings Transactions for this month
    if (tab_pokok > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.POKOK,
          amount: tab_pokok,
          description: "Setoran Simpanan Pokok",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (tab_wajib > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.WAJIB,
          amount: tab_wajib,
          description: "Setoran Simpanan Wajib Bulanan",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (tab_sukarela > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.SUKARELA,
          amount: tab_sukarela,
          description: "Setoran Simpanan Sukarela",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (wd_wajib > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.WITHDRAWAL,
          savingsType: SavingsType.WAJIB,
          amount: wd_wajib,
          description: "Penarikan Simpanan Wajib",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (wd_sukarela > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.WITHDRAWAL,
          savingsType: SavingsType.SUKARELA,
          amount: wd_sukarela,
          description: "Penarikan Simpanan Sukarela",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    // 4. Create Loan if active
    const hasLoan = new_loan > 0 || debt > 0;
    if (hasLoan) {
      const isNew = new_loan > 0;
      const loanAmount = isNew ? new_loan : debt;
      const calcProvision = isNew ? provision : loanAmount * 0.01;
      const calcCrk = isNew ? crk : loanAmount * 0.1;
      const receivedAmount = loanAmount - calcProvision - calcCrk;
      const interestRate = 1.0; // 1% flat
      const tenor = 10; // 10 months default
      const installmentAmount = loanAmount / tenor + loanAmount * (interestRate / 100);

      const loan = await prisma.loan.create({
        data: {
          memberId: member.id,
          amount: loanAmount,
          interestRate,
          tenor,
          provision: calcProvision,
          crk: calcCrk,
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
        const isPaidThisMonth = i === 1 && (installment > 0 || interest > 0);

        await prisma.loanInstallment.create({
          data: {
            loanId: loan.id,
            monthNumber: i,
            principalPaid: isPaidThisMonth ? installment : 0,
            interestPaid: isPaidThisMonth ? interest : 0,
            penaltyPaid: isPaidThisMonth ? penalty : 0,
            totalPaid: isPaidThisMonth ? installment + interest + penalty : 0,
            dueDate,
            paidAt: isPaidThisMonth ? new Date("2026-05-15") : null,
            status: isPaidThisMonth ? InstallmentStatus.PAID : InstallmentStatus.UNPAID,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded Laporan Bulanan: ${memberCount} Members, ${savingsCount} Savings Accounts, ${txCount} Savings Transactions, ${loanCount} Loans.`);
}
