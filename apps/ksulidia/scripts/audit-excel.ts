import { readFile, utils } from "xlsx";
import path from "path";
import fs from "fs";

const excelFile = path.join(
  __dirname,
  "../../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx"
);
const reportFile = path.join(__dirname, "../../../docs/audit_report.md");

function num(val: any): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    // Remove formatting like commas, dots or Rp
    const cleaned = val.replace(/Rp|\.|,/gi, "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function runDeepAudit() {
  if (!fs.existsSync(excelFile)) {
    console.error("File not found:", excelFile);
    return;
  }

  console.log("=== MEMULAI DEEP AUDIT EXCEL KSU LIDIA ===");
  const workbook = readFile(excelFile);
  const sheetNames = workbook.SheetNames;
  
  let reportMarkdown = `# Laporan Audit Matematis Excel KSU Lidia\n\n`;
  reportMarkdown += `Waktu Audit: ${new Date().toISOString()}\n\n`;
  reportMarkdown += `File: LAPORAN BULANAN SIMPAN PINJAM.xlsx\n\n`;
  
  let totalAnomalies = 0;
  let interestRates = new Set<string>();

  for (const sheetName of sheetNames) {
    // Skip chart sheets
    if (sheetName.toLowerCase().includes("chart")) continue;

    console.log(`Auditing sheet: ${sheetName}...`);
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet, { header: 1 });
    
    let sheetAnomalies: string[] = [];

    // Typically, data starts around row 4 (index 3)
    for (let i = 3; i < data.length; i++) {
      const row: any = data[i];
      if (!row || row.length < 2) continue;
      
      const no = row[0];
      const nama = typeof row[1] === "string" ? row[1].trim() : String(row[1] || "");
      
      // Stop if we hit the total row
      if (!nama || nama.toLowerCase().includes("jumlah") || nama.toLowerCase().includes("total")) {
          // It could just be an empty row, continue or break based on "jumlah"
          if (nama.toLowerCase().includes("jumlah")) break;
          continue;
      }

      // Column Mapping
      const sAwalHutang = num(row[2]);
      const angsuran = num(row[3]);
      const bunga = num(row[4]);
      const denda = num(row[5]);
      
      const pinjamanBaru = num(row[16]);
      const sAkhirHutang = num(row[19]);
      
      const setoranWajib = num(row[7]);
      const sAwalWajib = num(row[10]);
      const ambilWajib = num(row[11]);
      const sAkhirWajib = num(row[12]);

      const setoranSukarela = num(row[8]);
      const sAwalSukarela = num(row[13]);
      const ambilSukarela = num(row[14]);
      const sAkhirSukarela = num(row[15]);

      // 1. Validasi Hutang
      // Excel definition: S.Akhir = S.Awal - Angsuran + Pinjaman Baru
      const expectedHutang = sAwalHutang - angsuran + pinjamanBaru;
      if (Math.abs(expectedHutang - sAkhirHutang) > 1) { // tolerance 1 for floating points
        sheetAnomalies.push(`- **${nama}**: Hutang tidak balance. Awal(${sAwalHutang}) - Angsuran(${angsuran}) + PinjamanBaru(${pinjamanBaru}) = ${expectedHutang}. Tercatat di Excel: ${sAkhirHutang}. Beda: ${Math.abs(expectedHutang - sAkhirHutang)}`);
      }

      // 2. Validasi Tabungan Wajib
      const expectedWajib = sAwalWajib + setoranWajib - ambilWajib;
      if (Math.abs(expectedWajib - sAkhirWajib) > 1 && (sAwalWajib > 0 || setoranWajib > 0)) {
        sheetAnomalies.push(`- **${nama}**: Tabungan Wajib tidak balance. Awal(${sAwalWajib}) + Setoran(${setoranWajib}) - Ambil(${ambilWajib}) = ${expectedWajib}. Tercatat: ${sAkhirWajib}.`);
      }

      // 3. Validasi Tabungan Sukarela
      const expectedSukarela = sAwalSukarela + setoranSukarela - ambilSukarela;
      if (Math.abs(expectedSukarela - sAkhirSukarela) > 1 && (sAwalSukarela > 0 || setoranSukarela > 0)) {
        sheetAnomalies.push(`- **${nama}**: Tabungan Sukarela tidak balance. Awal(${sAwalSukarela}) + Setoran(${setoranSukarela}) - Ambil(${ambilSukarela}) = ${expectedSukarela}. Tercatat: ${sAkhirSukarela}.`);
      }

      // 4. Analisa Bunga
      if (bunga > 0 && sAwalHutang > 0) {
        // Did they charge interest on the original amount, the remaining amount, or the new loan?
        // Let's just calculate effective rate on Awal Hutang
        const rate = (bunga / sAwalHutang) * 100;
        // round to 2 decimals
        const roundedRate = Math.round(rate * 100) / 100;
        if (roundedRate > 0 && roundedRate < 20) {
            interestRates.add(`${roundedRate}%`);
        }
      }
    }

    if (sheetAnomalies.length > 0) {
      totalAnomalies += sheetAnomalies.length;
      reportMarkdown += `### Bulan: ${sheetName}\n`;
      reportMarkdown += sheetAnomalies.join("\n") + "\n\n";
    }
  }

  reportMarkdown += `## Kesimpulan\n`;
  reportMarkdown += `- Total Anomali Ditemukan: ${totalAnomalies}\n`;
  reportMarkdown += `- Variasi Rate Bunga Ditemukan (Estimasi terhadap Saldo Awal): ${Array.from(interestRates).join(', ')}\n`;

  fs.writeFileSync(reportFile, reportMarkdown);
  console.log(`\nAudit selesai. Laporan ditulis ke: ${reportFile}`);
  console.log(`Total anomali: ${totalAnomalies}`);
}

runDeepAudit().catch(console.error);
