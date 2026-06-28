import {
  PrismaClient,
  SavingsType,
  SavingsTxType,
  LoanStatus,
  InstallmentStatus,
} from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";
import { APP_SETTING_KEYS } from "../../src/lib/constants";

function parseMonthYear(sheetName: string): Date {
  const parts = sheetName.trim().split(/\s+/);
  const monthStr = parts[0];
  const yearStr = parts[parts.length - 1];
  const year = parseInt(yearStr);
  const months: { [key: string]: number } = {
    JAN: 0,
    JANUARI: 0,
    PEB: 1,
    PEBRUARI: 1,
    MAR: 2,
    MARET: 2,
    APR: 3,
    APRIL: 3,
    MEI: 4,
    JUN: 5,
    JUNI: 5,
    JUL: 6,
    JULI: 6,
    AGU: 7,
    AGUSTUS: 7,
    SEP: 8,
    SEPT: 8,
    SEPTEMBER: 8,
    OKT: 9,
    OKTOBER: 9,
    NOP: 10,
    NOPEMBER: 10,
    DES: 11,
    DESEMBER: 11,
  };
  const m = monthStr.toUpperCase();
  const monthIdx = months[m] !== undefined ? months[m] : 0;
  return new Date(year, monthIdx, 15);
}

function num(val: any): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/Rp|\.|,/gi, "").trim());
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function seedBulananSimpanPinjam(prisma: PrismaClient) {
  console.log("Seeding: Laporan Bulanan Simpan Pinjam (Deep Migration)...");
  const filePath = path.join(
    process.cwd(),
    "../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const workbook = xlsx.readFile(filePath);

  // Settings
  await prisma.appSetting.upsert({
    where: { key: APP_SETTING_KEYS.DEFAULT_INTEREST_RATE },
    update: {},
    create: {
      key: APP_SETTING_KEYS.DEFAULT_INTEREST_RATE,
      value: "1.50",
      description: "Bunga Pinjaman Default (%)",
    },
  });
  await prisma.appSetting.upsert({
    where: { key: APP_SETTING_KEYS.DEFAULT_PENALTY_RATE },
    update: {},
    create: {
      key: APP_SETTING_KEYS.DEFAULT_PENALTY_RATE,
      value: "5.00",
      description: "Denda Keterlambatan Default (%)",
    },
  });
  await prisma.appSetting.upsert({
    where: { key: APP_SETTING_KEYS.PROVISION_RATE },
    update: {},
    create: {
      key: APP_SETTING_KEYS.PROVISION_RATE,
      value: "100.00",
      description: "Provisi (Persentase thd nominal Bunga)",
    },
  });
  await prisma.appSetting.upsert({
    where: { key: APP_SETTING_KEYS.CRK_RATE },
    update: {},
    create: {
      key: APP_SETTING_KEYS.CRK_RATE,
      value: "10.00",
      description: "Cadangan Risiko Kredit (Persentase thd total pinjaman)",
    },
  });

  const memberMap = new Map<string, string>(); // name to UUID

  // Track active loans in memory to process installments quickly
  const activeLoans = new Map<
    string,
    {
      loanId: string;
      installments: { id: string; month: number; status: string }[];
    }
  >();

  for (const sheetName of workbook.SheetNames) {
    if (sheetName.toLowerCase().includes("chart")) continue;

    const date = parseMonthYear(sheetName);
    console.log(
      `Processing sheet: ${sheetName} -> ${date.toISOString().split("T")[0]}`
    );

    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;

      const rawNo = row[0];
      const rawName = row[1];

      if (
        !rawNo ||
        !rawName ||
        String(rawName).trim() === "" ||
        String(rawName).toLowerCase().includes("jumlah") ||
        String(rawName).toLowerCase().includes("total")
      ) {
        continue;
      }

      let name = String(rawName).trim();
      let isDeceased = false;
      if (name.toLowerCase().includes("(meninggal)")) {
        isDeceased = true;
        name = name.replace(/\(meninggal\)/i, "").trim();
      }
      const no = parseInt(String(rawNo));
      if (isNaN(no)) continue;

      let memberId = memberMap.get(name);
      if (!memberId) {
        const member = await prisma.member.upsert({
          where: { no: no },
          update: { name: name, isDeceased },
          create: { no, name, isDeceased },
        });
        memberId = member.id;
        memberMap.set(name, memberId);

        for (const type of [
          SavingsType.POKOK,
          SavingsType.WAJIB,
          SavingsType.SUKARELA,
        ]) {
          await prisma.savingsAccount.upsert({
            where: { memberId_type: { memberId, type } },
            update: {},
            create: { memberId, type, balance: 0 },
          });
        }
      }

      const sAwalHutang = num(row[2]);
      const angsuran = num(row[3]);
      const bunga = num(row[4]);
      const denda = num(row[5]);
      const tabPokok = num(row[6]);
      const tabWajib = num(row[7]);
      const tabSukarela = num(row[8]);
      const wdWajib = num(row[11]);
      const wdSukarela = num(row[14]);
      const pinjamanBaru = num(row[16]);
      const sAkhirHutang = num(row[19]);

      // 1. Process Savings (Tabungan)
      if (tabPokok > 0)
        await createSavingsTx(
          prisma,
          memberId,
          SavingsType.POKOK,
          tabPokok,
          SavingsTxType.DEPOSIT,
          date,
          sheetName
        );
      if (tabWajib > 0)
        await createSavingsTx(
          prisma,
          memberId,
          SavingsType.WAJIB,
          tabWajib,
          SavingsTxType.DEPOSIT,
          date,
          sheetName
        );
      if (tabSukarela > 0)
        await createSavingsTx(
          prisma,
          memberId,
          SavingsType.SUKARELA,
          tabSukarela,
          SavingsTxType.DEPOSIT,
          date,
          sheetName
        );
      if (wdWajib > 0)
        await createSavingsTx(
          prisma,
          memberId,
          SavingsType.WAJIB,
          wdWajib,
          SavingsTxType.WITHDRAWAL,
          date,
          sheetName
        );
      if (wdSukarela > 0)
        await createSavingsTx(
          prisma,
          memberId,
          SavingsType.SUKARELA,
          wdSukarela,
          SavingsTxType.WITHDRAWAL,
          date,
          sheetName
        );

      // 2. Process Loans (Hutang)
      if (pinjamanBaru > 0) {
        // If there is an existing active loan, mark it as PAID (since they usually settle before taking a new one)
        const existingLoan = activeLoans.get(memberId);
        if (existingLoan) {
          await prisma.loan.update({
            where: { id: existingLoan.loanId },
            data: { status: "PAID" },
          });
          await prisma.loanInstallment.updateMany({
            where: { loanId: existingLoan.loanId, status: "UNPAID" },
            data: { status: "PAID" },
          });
          activeLoans.delete(memberId);
        }

        // Calculate rates based on actual flat values applied in Excel
        let interestRateApplied = 1.5;
        if (bunga > 0) {
          interestRateApplied = (bunga / pinjamanBaru) * 100;
        }

        const provisi = num(row[17]) || 0;
        const crk = num(row[18]) || 0;

        const loan = await prisma.loan.create({
          data: {
            memberId,
            amount: pinjamanBaru,
            interestRate: interestRateApplied,
            penaltyRate: 5.0, // Default
            provisionRate: 100.0,
            crkRate: 10.0,
            tenor: 10, // Assuming standard tenor 10 months
            provision: provisi,
            crk: crk,
            receivedAmount: pinjamanBaru - provisi - crk,
            installmentAmount: pinjamanBaru / 10,
            dateDisbursed: date,
            status: "ACTIVE",
          },
        });

        const installments = [];
        for (let m = 1; m <= 10; m++) {
          const dueDate = new Date(date);
          dueDate.setMonth(dueDate.getMonth() + m);

          const inst = await prisma.loanInstallment.create({
            data: {
              loanId: loan.id,
              monthNumber: m,
              dueDate: dueDate,
              status: "UNPAID",
            },
          });
          installments.push({ id: inst.id, month: m, status: "UNPAID" });
        }

        activeLoans.set(memberId, { loanId: loan.id, installments });
      }

      // 3. Process Payments (Angsuran)
      if (angsuran > 0 || bunga > 0 || denda > 0) {
        const currentLoan = activeLoans.get(memberId);
        if (currentLoan) {
          // Find the earliest UNPAID installment
          const unpaidIdx = currentLoan.installments.findIndex(
            (i) => i.status === "UNPAID"
          );
          if (unpaidIdx !== -1) {
            const instToPay = currentLoan.installments[unpaidIdx];
            await prisma.loanInstallment.update({
              where: { id: instToPay.id },
              data: {
                status: "PAID",
                principalPaid: angsuran,
                interestPaid: pinjamanBaru > 0 ? 0 : bunga, // if pinjamanBaru > 0, bunga might be for the new loan deductibles or previous, usually previous. But if we want to be exact, we just record it.
                penaltyPaid: denda,
                totalPaid: angsuran + (pinjamanBaru > 0 ? 0 : bunga) + denda,
                paidAt: date,
              },
            });
            currentLoan.installments[unpaidIdx].status = "PAID";
          }
        }
      }

      // 4. Auto-Forgive Anomaly
      // If Excel says the loan is 0 but we still have an active loan mapped,
      // close it out to respect Excel's truth.
      if (sAkhirHutang === 0 && sAwalHutang > 0) {
        const currentLoan = activeLoans.get(memberId);
        if (currentLoan) {
          await prisma.loan.update({
            where: { id: currentLoan.loanId },
            data: { status: "PAID" },
          });
          await prisma.loanInstallment.updateMany({
            where: { loanId: currentLoan.loanId, status: "UNPAID" },
            data: { status: "PAID" },
          });
          activeLoans.delete(memberId);
        }
      }
    } // end row
  } // end sheet
}

async function createSavingsTx(
  prisma: PrismaClient,
  memberId: string,
  savingsType: SavingsType,
  amount: number,
  txType: SavingsTxType,
  date: Date,
  ref: string
) {
  if (amount <= 0) return;
  await prisma.$transaction(async (tx) => {
    await tx.savingsTransaction.create({
      data: {
        memberId,
        savingsType,
        type: txType,
        amount,
        date,
        description: `Seeded dari ${ref}`,
      },
    });

    const increment = txType === SavingsTxType.DEPOSIT ? amount : -amount;
    await tx.savingsAccount.update({
      where: { memberId_type: { memberId, type: savingsType } },
      data: { balance: { increment } },
    });
  });
}
