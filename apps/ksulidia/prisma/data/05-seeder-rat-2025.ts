import {
  PrismaClient,
  FinancialReportEntity,
  FinancialReportType,
} from "@prisma/client";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

export async function seedLaporanRat(prisma: PrismaClient) {
  console.log("Seeding: Laporan RAT 2025...");
  const filePath = path.join(
    process.cwd(),
    "../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN RAT 2025.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const workbook = xlsx.readFile(filePath);

  // 1. Process SHU
  const shuSimpananSheet = workbook.Sheets["SHU Simpanan"];
  const shuPinjamanSheet = workbook.Sheets["SHU Pinjaman "]; // Note the space based on audit

  const shuDataMap = new Map<string, { simpanan: number; pinjaman: number }>();

  if (shuSimpananSheet) {
    const data = xlsx.utils.sheet_to_json<any[]>(shuSimpananSheet, {
      header: 1,
    });
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const rawName = row[1];
      if (!rawName || String(rawName).trim() === "") continue;

      let name = String(rawName).trim();
      if (name.toLowerCase().includes("(meninggal)")) {
        name = name.replace(/\(meninggal\)/i, "").trim();
      }

      const shuDibagi = parseFloat(row[7]) || 0;
      if (shuDibagi > 0) {
        shuDataMap.set(name, { simpanan: shuDibagi, pinjaman: 0 });
      }
    }
  }

  if (shuPinjamanSheet) {
    const data = xlsx.utils.sheet_to_json<any[]>(shuPinjamanSheet, {
      header: 1,
    });
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const rawName = row[1];
      if (!rawName || String(rawName).trim() === "") continue;

      let name = String(rawName).trim();
      if (name.toLowerCase().includes("(meninggal)")) {
        name = name.replace(/\(meninggal\)/i, "").trim();
      }

      const shuDibagi = parseFloat(row[7]) || 0;
      if (shuDibagi > 0) {
        const existing = shuDataMap.get(name) || { simpanan: 0, pinjaman: 0 };
        existing.pinjaman = shuDibagi;
        shuDataMap.set(name, existing);
      }
    }
  }

  // Insert SHU records
  for (const [name, shu] of Array.from(shuDataMap.entries())) {
    // Find member
    const member = await prisma.member.findFirst({
      where: { name: { equals: name } },
    });

    if (member) {
      await prisma.shuDistribution.upsert({
        where: { memberId_year: { memberId: member.id, year: 2025 } },
        update: {
          shuSimpanan: shu.simpanan,
          shuPinjaman: shu.pinjaman,
          totalShu: shu.simpanan + shu.pinjaman,
        },
        create: {
          memberId: member.id,
          year: 2025,
          shuSimpanan: shu.simpanan,
          shuPinjaman: shu.pinjaman,
          totalShu: shu.simpanan + shu.pinjaman,
        },
      });
    }
  }

  // 2. Process Neraca & Rugi Laba
  const periodDate = new Date(2025, 11, 31);
  const reports = [
    { sheet: "Neraca", type: FinancialReportType.NERACA },
    { sheet: "Rugi Laba", type: FinancialReportType.RUGI_LABA },
    { sheet: "NERACA PAJAK", type: FinancialReportType.PAJAK },
    { sheet: "RUGI LABA PAJAK", type: FinancialReportType.PAJAK },
  ];

  for (const report of reports) {
    const sheet = workbook.Sheets[report.sheet];
    if (!sheet) continue;

    const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const category = row[0] || row[1]; // Often in first or second col
      if (typeof category !== "string" || category.trim() === "") continue;

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
            entity: FinancialReportEntity.KSP,
            reportType: report.type,
            category: category.trim(),
            amount: amount,
          },
        });
      }
    }
  }
}
