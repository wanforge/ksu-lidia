import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

export async function seedLaporanRat(prisma: PrismaClient) {
  console.log("📂 Seeding Laporan RAT 2025...");

  const dataPath = path.join(__dirname, "../../../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN RAT 2025.xlsx");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Excel file not found at: ${dataPath}`);
    return;
  }

  // The database schema currently doesn't have a table for generic RAT reports.
  // This is a placeholder for when/if the schema is expanded to store RAT data.
  const workbook = xlsx.readFile(dataPath);
  
  console.log(`✅ Laporan RAT 2025 file exists and contains ${workbook.SheetNames.length} sheets. Data not yet mapped to database.`);
}
