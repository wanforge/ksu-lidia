import {
  PrismaClient,
  FinancialReportEntity,
  FinancialReportType,
} from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

export async function seedLaporanKonsolidasi(prisma: PrismaClient) {
  console.log("Seeding: Laporan Konsolidasi 2026...");
  const filePath = path.join(
    process.cwd(),
    "../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LK Konsolidasi 2026 (LAPORAN KONSOLIDASI PER TRI WULAN).xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const workbook = xlsx.readFile(filePath);
  const periodDate = new Date(2026, 2, 31); // March 31, 2026

  const reports = [
    { sheet: "NERACA", type: FinancialReportType.NERACA },
    { sheet: "RUGI LABA", type: FinancialReportType.RUGI_LABA },
  ];

  for (const report of reports) {
    const sheet = workbook.Sheets[report.sheet];
    if (!sheet) continue;

    const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const category = row[1];
      if (typeof category !== "string" || category.trim() === "") continue;

      const valKoperasi = parseFloat(row[2]) || 0;
      const valToko = parseFloat(row[3]) || 0;
      const valKonsolidasi = parseFloat(row[4]) || 0;

      if (valKonsolidasi !== 0) {
        await prisma.financialReport.create({
          data: {
            periodDate,
            entity: FinancialReportEntity.KONSOLIDASI,
            reportType: report.type,
            category: category.trim(),
            amount: valKonsolidasi,
          },
        });
      }
    }
  }
}
