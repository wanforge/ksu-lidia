import { PrismaClient, SavingsType, SavingsTxType } from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

// Helper to convert sheet names like "JAN 2019" to Date
function parseMonthYear(sheetName: string): Date {
  const parts = sheetName.trim().split(/\s+/);
  const monthStr = parts[0];
  const yearStr = parts[parts.length - 1];
  const year = parseInt(yearStr);
  const months: { [key: string]: number } = {
    JAN: 0, JANUARI: 0,
    PEB: 1, PEBRUARI: 1,
    MAR: 2, MARET: 2,
    APR: 3, APRIL: 3,
    MEI: 4,
    JUN: 5, JUNI: 5,
    JUL: 6, JULI: 6,
    AGU: 7, AGUSTUS: 7,
    SEP: 8, SEPT: 8, SEPTEMBER: 8,
    OKT: 9, OKTOBER: 9,
    NOP: 10, NOPEMBER: 10,
    DES: 11, DESEMBER: 11
  };
  
  const m = monthStr.toUpperCase();
  const monthIdx = months[m] !== undefined ? months[m] : 0;
  return new Date(year, monthIdx, 15); // Middle of the month
}

export async function seedBulananSimpanPinjam(prisma: PrismaClient) {
  console.log("Seeding: Laporan Bulanan Simpan Pinjam (89 sheets)...");
  const filePath = path.join(
    process.cwd(),
    "../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const workbook = xlsx.readFile(filePath);
  
  // Create AppSetting Defaults first if not exist
  await prisma.appSetting.upsert({
    where: { key: 'DEFAULT_INTEREST_RATE' },
    update: {},
    create: { key: 'DEFAULT_INTEREST_RATE', value: '1.50', description: 'Bunga Pinjaman Default (%)' }
  });
  await prisma.appSetting.upsert({
    where: { key: 'DEFAULT_PENALTY_RATE' },
    update: {},
    create: { key: 'DEFAULT_PENALTY_RATE', value: '5.00', description: 'Denda Keterlambatan Default (%)' }
  });
  await prisma.appSetting.upsert({
    where: { key: 'PROVISION_RATE' },
    update: {},
    create: { key: 'PROVISION_RATE', value: '100.00', description: 'Provisi (Persentase thd nominal Bunga)' }
  });
  await prisma.appSetting.upsert({
    where: { key: 'CRK_RATE' },
    update: {},
    create: { key: 'CRK_RATE', value: '10.00', description: 'Cadangan Risiko Kredit (Persentase thd total pinjaman)' }
  });

  const memberMap = new Map<string, string>(); // name to UUID

  for (const sheetName of workbook.SheetNames) {
    if (sheetName.toLowerCase().startsWith('chart')) continue;
    
    const date = parseMonthYear(sheetName);
    console.log(`Processing sheet: ${sheetName} -> ${date.toISOString().split('T')[0]}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    
    // Process rows
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const rawNo = row[0];
      const rawName = row[1];
      
      if (!rawNo || !rawName || String(rawName).trim() === '' || String(rawNo).toLowerCase() === 'jumlah') {
        continue; // Skip summary or empty rows
      }

      let name = String(rawName).trim();
      let isDeceased = false;
      if (name.toLowerCase().includes("(meninggal)")) {
        isDeceased = true;
        name = name.replace(/\(meninggal\)/i, "").trim();
      }

      const no = parseInt(String(rawNo));
      if (isNaN(no)) continue;

      // Ensure Member exists
      let memberId = memberMap.get(name);
      if (!memberId) {
        const member = await prisma.member.upsert({
          where: { no: no },
          update: { name: name, isDeceased },
          create: { no, name, isDeceased }
        });
        memberId = member.id;
        memberMap.set(name, memberId);
        
        // Ensure Savings Accounts
        const savingsTypes = [SavingsType.POKOK, SavingsType.WAJIB, SavingsType.SUKARELA];
        for (const type of savingsTypes) {
          await prisma.savingsAccount.upsert({
            where: { memberId_type: { memberId, type } },
            update: {},
            create: { memberId, type, balance: 0 }
          });
        }
      }

      // Read values
      const tabPokok = parseFloat(row[6]) || 0;
      const tabWajib = parseFloat(row[7]) || 0;
      const tabSukarela = parseFloat(row[8]) || 0;
      
      const pinjamanBaru = parseFloat(row[16]) || 0;
      const provisi = parseFloat(row[17]) || 0;
      const crk = parseFloat(row[18]) || 0;
      const bunga = parseFloat(row[4]) || 0;
      const sAwal = parseFloat(row[2]) || 0;
      const angsuran = parseFloat(row[3]) || 0;

      // Savings Transactions
      if (tabPokok > 0) {
        await createSavingsTx(prisma, memberId, SavingsType.POKOK, tabPokok, SavingsTxType.DEPOSIT, date, sheetName);
      }
      if (tabWajib > 0) {
        await createSavingsTx(prisma, memberId, SavingsType.WAJIB, tabWajib, SavingsTxType.DEPOSIT, date, sheetName);
      }
      if (tabSukarela > 0) {
        await createSavingsTx(prisma, memberId, SavingsType.SUKARELA, tabSukarela, SavingsTxType.DEPOSIT, date, sheetName);
      }

      const wdWajib = parseFloat(row[11]) || 0;
      const wdSukarela = parseFloat(row[14]) || 0;
      if (wdWajib > 0) {
        await createSavingsTx(prisma, memberId, SavingsType.WAJIB, wdWajib, SavingsTxType.WITHDRAWAL, date, sheetName);
      }
      if (wdSukarela > 0) {
        await createSavingsTx(prisma, memberId, SavingsType.SUKARELA, wdSukarela, SavingsTxType.WITHDRAWAL, date, sheetName);
      }
      
      // Loans
      if (pinjamanBaru > 0) {
        // Calculate applied rates from the data
        let interestRateApplied = 1.5; // fallback
        if (bunga > 0 && pinjamanBaru > 0) {
           interestRateApplied = (bunga / pinjamanBaru) * 100;
        } else if (bunga > 0 && sAwal > 0) {
           interestRateApplied = (bunga / sAwal) * 100;
        }

        if (interestRateApplied === 0 || !isFinite(interestRateApplied)) interestRateApplied = 1.5;

        await prisma.loan.create({
          data: {
            memberId,
            amount: pinjamanBaru,
            interestRate: interestRateApplied,
            penaltyRate: 5.0,
            provisionRate: 100.0,
            crkRate: 10.0,
            tenor: 10, 
            provision: provisi,
            crk: crk,
            receivedAmount: pinjamanBaru - provisi - crk,
            installmentAmount: (pinjamanBaru / 10),
            dateDisbursed: date,
            status: 'ACTIVE'
          }
        });
      }
    }
  }
}

async function createSavingsTx(prisma: PrismaClient, memberId: string, savingsType: SavingsType, amount: number, txType: SavingsTxType, date: Date, ref: string) {
  await prisma.$transaction(async (tx) => {
    await tx.savingsTransaction.create({
      data: {
        memberId,
        savingsType,
        type: txType,
        amount,
        date,
        description: `Seeded from ${ref}`
      }
    });

    const increment = txType === SavingsTxType.DEPOSIT ? amount : -amount;
    await tx.savingsAccount.update({
      where: { memberId_type: { memberId, type: savingsType } },
      data: { balance: { increment } }
    });
  });
}
