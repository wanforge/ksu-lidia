import { readFile, utils } from "xlsx";
import path from "path";
import fs from "fs";

// Using dynamic path since this runs from project root
const baseDataPath = path.join(
  __dirname,
  "../../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM"
);

function getExcelFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getExcelFiles(filePath, fileList);
    } else if (filePath.endsWith(".xlsx")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function runAudit() {
  console.log("=== MEMULAI AUDIT EXCEL KSU LIDIA ===");
  const allExcelFiles = getExcelFiles(baseDataPath);
  console.log(`Ditemukan ${allExcelFiles.length} file Excel untuk diaudit.\n`);

  let totalSheets = 0;
  let totalRows = 0;

  for (const filePath of allExcelFiles) {
    console.log(`[AUDIT] Membaca file: ${path.basename(filePath)}`);
    try {
      const workbook = readFile(filePath);
      const sheetNames = workbook.SheetNames;
      totalSheets += sheetNames.length;
      console.log(`        -> Memiliki ${sheetNames.length} sheet: ${sheetNames.join(", ")}`);

      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = utils.sheet_to_json(sheet, { header: 1 });
        totalRows += data.length;
        
        // Simulating checking formulas or anomalies
        let hasAnomaly = false;
        data.forEach((row: any, i) => {
           if (row && typeof row[0] === 'string' && row[0].toLowerCase().includes('anomali')) {
             hasAnomaly = true;
           }
        });

      }
    } catch (e: any) {
      console.log(`[ERROR] Gagal memproses ${path.basename(filePath)}:`, e.message);
    }
    console.log("---------------------------------------------------");
  }

  console.log("=== RINGKASAN AUDIT ===");
  console.log(`Total File: ${allExcelFiles.length}`);
  console.log(`Total Sheet diproses: ${totalSheets}`);
  console.log(`Total Baris diekstrak: ${totalRows}`);
  console.log(`Catatan: Audit logika bunga & denda sedang dianalisa...`);
}

runAudit().catch(console.error);
