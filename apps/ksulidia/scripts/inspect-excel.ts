import { readFile, utils } from "xlsx";
import path from "path";
import fs from "fs";

const excelFile = path.join(
  __dirname,
  "../../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx"
);

async function inspectExcel() {
  if (!fs.existsSync(excelFile)) {
    console.error("File not found:", excelFile);
    return;
  }

  const workbook = readFile(excelFile);
  const sheetNames = workbook.SheetNames;
  
  // Pick one sheet from the middle, e.g. "JANUARI 2024" if it exists, else the first one
  const targetSheetName = sheetNames.find(s => s.includes("2024")) || sheetNames[0];
  console.log(`Inspecting sheet: ${targetSheetName}`);
  
  const sheet = workbook.Sheets[targetSheetName];
  const data = utils.sheet_to_json(sheet, { header: 1 });
  
  // Print first 15 rows to understand the structure
  for (let i = 0; i < Math.min(15, data.length); i++) {
    console.log(`Row ${i + 1}:`, data[i]);
  }
}

inspectExcel().catch(console.error);
