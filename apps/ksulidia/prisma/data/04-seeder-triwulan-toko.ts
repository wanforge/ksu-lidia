import {
  PrismaClient,
  FinancialReportEntity,
  FinancialReportType,
} from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

export async function seedLaporanTriwulanToko(prisma: PrismaClient) {
  console.log("Seeding: Laporan Triwulan Toko 2026...");
  const filePath = path.join(
    process.cwd(),
    "../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/Lap Rugi laba 1 Jan sd 31 Maret 2026 (LAPORAN TRIWULAN TOKO).xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets["Sheet1"];
  if (sheet) {
    const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    const periodDate = new Date(2026, 2, 31); // March 2026

    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const category = row[0];
      if (typeof category !== "string" || category.trim() === "") continue;

      // Look for amount in the last few columns
      let amount = 0;
      for (let j = row.length - 1; j >= 1; j--) {
        if (typeof row[j] === "number") {
          amount = row[j];
          break;
        }
      }

      if (amount > 0) {
        await prisma.financialReport.create({
          data: {
            periodDate,
            entity: FinancialReportEntity.TOKO,
            reportType: FinancialReportType.RUGI_LABA,
            category: category.trim(),
            amount: amount,
          },
        });
      }
    }
  }
}
