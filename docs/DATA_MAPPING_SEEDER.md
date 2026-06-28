# Pemetaan Data Seeder KSU Lidia

Dokumen ini menjelaskan rincian pemetaan data yang digunakan oleh 6 seeder terpisah berdasarkan 6 file Excel sumber data dari koperasi.

## 1. Laporan Bulanan Simpan Pinjam (`01-seeder-bulanan-simpan-pinjam.ts`)

Seeder ini merupakan seeder utama yang membangun data historis anggota, tabungan, dan pinjaman.
*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx`
*   **Sheet yang Digunakan:** **Seluruh 89 Sheets** (Mulai dari `JAN 2019` hingga `MEI 2026`).
*   **Logika Data:**
    *   **Anggota:** Kolom "No" dan "Nama". String `(meninggal)` akan ditandai flag khusus.
    *   **Pinjaman:** Kolom S. Awal Hutang, Angsuran, Bunga, Denda, Pinjaman Baru. 
        * *Note:* Seeder akan menyimpan snapshot persentase (Bunga/Denda/Provisi/CRK) di tabel `Loan` saat `Pinjaman Baru` muncul.
    *   **Tabungan:** Simpanan Pokok, Wajib, Sukarela dan penarikannya dipetakan ke `SavingsTransaction`.
    *   **Catatan Audit:** Kami telah melakukan proses audit secara komputasional terhadap seluruh 89 sheet dan seluruh 6 file excel yang ada. Mayoritas data berkesinambungan dan sesuai rumus matematis (Bunga 1-5% dinamis tiap anggota, penambahan saldo bulan ke bulan konsisten). Satu-satunya anomali matematis yang tidak dapat dijelaskan secara rumus ditemukan di sheet Mei 2026 (saldo Ani Widiyana), namun sistem *seed* mengimpornya apa adanya sebagai *truth* historis.

## 2. Buku Kas Koperasi 2019 (`02-seeder-buku-kas-koperasi.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN KAS/KAS KSU LIDIA 2019 new dok.xlsx`
*   **Tujuan:** Mengisi data historis `CashTransaction` (Buku Kas).
*   **Sheet Utama:** 
    * `KAS 2022`: Data buku kas dengan format Penerimaan, Pengeluaran, Saldo. Entitas = `KOPERASI`.
    * `Laporan SRI`: Rekapan buku kas untuk program spesifik. Entitas = `SRI_NETHERLAND`.

## 3. Buku Kas Toko (`03-seeder-buku-kas-toko.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN KAS/TOKO LIDIA STM.xlsx`
*   **Tujuan:** Mengisi data historis `CashTransaction` (Buku Kas Toko).
*   **Sheet Utama:** `KAS`. Mencatat setiap penerimaan (penjualan) dan pengeluaran (kulakan) Toko Lidia STM. Entitas = `TOKO`.

## 4. Laporan Triwulan Toko (`04-seeder-triwulan-toko.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/Lap Rugi laba 1 Jan sd 31 Maret 2026 (LAPORAN TRIWULAN TOKO).xlsx`
*   **Tujuan:** Mengisi data `FinancialReport` (Buku Besar/Laba Rugi Agregat Toko).
*   **Sheet Utama:** `Sheet1`.
*   **Penyesuaian:** Membaca item laba-rugi triwulan (Penjualan, Harga Pokok, dll) dan menyimpannya sebagai agregat `FinancialReportEntity.TOKO`.

## 5. Laporan RAT 2025 (`05-seeder-rat-2025.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN RAT 2025.xlsx`
*   **Tujuan:** Mengisi Laporan Keuangan Tahunan dan Rincian SHU per anggota.
*   **Sheet Utama:**
    *   `Neraca`, `Rugi Laba`, `NERACA PAJAK`, `RUGI LABA PAJAK`: Dimasukkan ke dalam `FinancialReport` dengan tipe yang bersesuaian.
    *   `SHU Simpanan` & `SHU Pinjaman`: Di-_join_ berdasar Nama Anggota dan dimasukkan ke tabel `ShuDistribution` (Tahun 2025).

## 6. Laporan Konsolidasi 2026 (`06-seeder-konsolidasi-2026.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LK Konsolidasi 2026 (LAPORAN KONSOLIDASI PER TRI WULAN).xlsx`
*   **Tujuan:** Menyimpan versi gabungan antara Keuangan Koperasi dan Toko.
*   **Sheet Utama:** `NERACA`, `RUGI LABA`.
*   **Penyesuaian:** Disimpan ke `FinancialReport` dengan entitas `FinancialReportEntity.KONSOLIDASI`.
