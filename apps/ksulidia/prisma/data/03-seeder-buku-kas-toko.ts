import { PrismaClient, CashEntity, CashTxType } from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

export async function seedBukuKasToko(prisma: PrismaClient) {
  console.log("Seeding: Buku Kas Toko...");
  const filePath = path.join(
    process.cwd(),
    "../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN KAS/TOKO LIDIA STM.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const workbook = xlsx.readFile(filePath);

  const kasSheet = workbook.Sheets["KAS"];
  if (kasSheet) {
    const data = xlsx.utils.sheet_to_json<any[]>(kasSheet, { header: 1 });

    let currentMonth = 3; // April based on the data sample

    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const inMonthStr = row[0];
      const inDesc = row[1];
      const inAmount = parseFloat(row[2]) || parseFloat(row[3]);

      const outMonthStr = row[4];
      const outDesc = row[5];
      const outAmount = parseFloat(row[6]) || parseFloat(row[7]);

      // Parse Month
      if (typeof inMonthStr === "string") {
        const m = inMonthStr.toLowerCase();
        if (m === "januari") currentMonth = 0;
        else if (m === "pebruari") currentMonth = 1;
        else if (m === "maret") currentMonth = 2;
        else if (m === "april") currentMonth = 3;
        else if (m === "mei") currentMonth = 4;
        else if (m === "juni") currentMonth = 5;
        else if (m === "juli") currentMonth = 6;
        else if (m === "agustus") currentMonth = 7;
        else if (m === "september") currentMonth = 8;
        else if (m === "oktober") currentMonth = 9;
        else if (m === "nopember") currentMonth = 10;
        else if (m === "desember") currentMonth = 11;
      }

      const txDate = new Date(2022, currentMonth, 15);

      if (inDesc && inAmount > 0) {
        await prisma.cashTransaction.create({
          data: {
            date: txDate,
            entity: CashEntity.TOKO,
            type: CashTxType.IN,
            amount: inAmount,
            description: String(inDesc).trim(),
            referenceId: "KAS_TOKO",
          },
        });
      }

      if (outDesc && outAmount > 0) {
        await prisma.cashTransaction.create({
          data: {
            date: txDate,
            entity: CashEntity.TOKO,
            type: CashTxType.OUT,
            amount: outAmount,
            description: String(outDesc).trim(),
            referenceId: "KAS_TOKO",
          },
        });
      }
    }
  }
}
