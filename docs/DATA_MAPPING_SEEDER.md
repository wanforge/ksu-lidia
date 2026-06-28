# Pemetaan Data Seeder KSU Lidia

Dokumen ini menjelaskan rincian pemetaan data yang digunakan oleh masing-masing seeder berdasarkan file Excel yang diberikan oleh pengguna.

## 1. Seeder Laporan Bulanan (`seeder-laporan-bulanan.ts`)

Seeder ini adalah seeder utama yang mengambil data riil dari Excel dan memasukkannya ke database secara terstruktur.
*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN BULANAN SIMPAN PINJAM.xlsx`
*   **Sheet yang Digunakan:** `MEI 2026`
*   **Kolom yang Diambil (Mulai Baris ke-4):**
    *   **Kolom A (No):** Nomor Induk Anggota.
    *   **Kolom B (Nama):** Nama Anggota. (Di sini seeder memfilter teks `(meninggal)` untuk melakukan set flag `isDeceased: true` di database, dan membersihkan teks tersebut dari nama asli).
    *   **Kolom C (S. Awal Hutang):** Saldo Awal Hutang / Pinjaman berjalan.
    *   **Kolom D (Angsuran):** Jumlah bayar pokok pinjaman bulan tersebut.
    *   **Kolom E (Bunga):** Jumlah bayar bunga bulan tersebut.
    *   **Kolom F (Denda):** Jumlah bayar denda bulan tersebut.
    *   **Kolom G (Tab. Pokok):** Setoran Simpanan Pokok baru.
    *   **Kolom H (Tab. Wajib):** Setoran Simpanan Wajib baru.
    *   **Kolom I (Tab. Sukarela):** Setoran Simpanan Sukarela baru.
    *   **Kolom K, L, M:** Saldo Awal Wajib, Pengambilan Wajib (WD), dan Saldo Akhir Wajib.
    *   **Kolom N, O, P:** Saldo Awal Sukarela, Pengambilan Sukarela (WD), dan Saldo Akhir Sukarela.
    *   **Kolom Q, R, S:** Pinjaman Baru, Provisi, dan Cadangan Risiko Kredit (CRK).

## 2. Seeder Laporan Toko (`seeder-laporan-toko.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/Lap Rugi laba 1 Jan sd 31 Maret 2026 (LAPORAN TRIWULAN TOKO).xlsx`
*   **Status Implementasi:** File Excel Laba/Rugi (P&L) milik user hanya berisi rekapan akumulasi bulanan, **bukan** detail transaksi per item produk.
*   **Penyesuaian:** Oleh sebab itu, seeder membaca file tersebut namun mengisi tabel database (Tabel `Product`, `ProductTransaction`, dan `ProductTransactionItem`) menggunakan **data rekaan/dummy** yang nilainya dimanipulasi agar persis menghasilkan total laba-rugi sesuai dengan Excel pada bulan Januari - Maret 2026.

## 3. Seeder Laporan RAT (`seeder-laporan-rat.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LAPORAN RAT 2025.xlsx`
*   **Status Implementasi:** File divalidasi dan dibaca via script (memiliki total 7 *sheets*).
*   **Penyesuaian:** Saat ini sistem / aplikasi (skema database Prisma) belum memiliki tabel khusus untuk menampung agregasi RAT secara spesifik. Data dibiarkan sebagai referensi placeholder hingga tabel agregasi terkait (jika dibutuhkan) dibuat.

## 4. Seeder Laporan Konsolidasi (`seeder-laporan-konsolidasi.ts`)

*   **Sumber File:** `docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/LK Konsolidasi 2026 (LAPORAN KONSOLIDASI PER TRI WULAN).xlsx`
*   **Status Implementasi:** Sama seperti RAT, file dibaca (terdeteksi 2 *sheets*) sebagai referensi placeholder.
*   **Penyesuaian:** Akan diimplementasikan lebih jauh ke tabel jika aplikasi membutuhkan menu *dashboard* pembukuan konsolidasi KSU di masa mendatang.
