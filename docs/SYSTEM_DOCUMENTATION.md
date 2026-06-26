# Dokumentasi Teknis KSU Lidia

Sistem Informasi Koperasi Simpan Pinjam & Toko KSU Lidia GKJ Manahan.

---

## 1. Arsitektur & Teknologi Utama

- **Framework Utama:** Next.js 15.2.6 (App Router)
- **Database ORM:** Prisma ORM dengan basis data MariaDB/MySQL (`ksulidia` database)
- **State Management & UI Components:** React Client Components dengan Tailwind CSS
- **Library Grafik:** Recharts (untuk visualisasi statistik dan data trend)
- **Autentikasi & Keamanan:** Next-Auth dengan Rule-Based Access Control (RBAC)

---

## 2. Matriks Role & Hak Akses (RBAC)

Sistem membatasi hak akses berdasarkan tingkat peran pengguna untuk menjaga keamanan data koperasi:

| Fitur / Modul                      | ADMIN | VIEWER |
| :--------------------------------- | :---: | :----: |
| **Dashboard Back-office**          |  ✅   |   ✅   |
| **Manajemen Simpan Pinjam (View)** |  ✅   |   ✅   |
| **Mutasi Simpan Pinjam (Manage)**  |  ✅   |   ❌   |
| **Katalog & Stok Toko (View)**     |  ✅   |   ✅   |
| **Transaksi Toko (Manage/Input)**  |  ✅   |   ❌   |
| **Master Konfigurasi Koperasi**    |  ✅   |   ❌   |
| **Manajemen User & Log Audit**     |  ✅   |   ❌   |

---

## 3. Logika Perhitungan Kredit & Pinjaman (Simpan Pinjam)

Sesuai dengan ketentuan operasional KSU Lidia, perhitungan kredit dilakukan dengan model potongan di awal (_deducted at source_) dan sistem denda keterlambatan:

1. **Bunga Pinjaman:** Default **1.0%** dari total pokok pinjaman per bulan berjalan.
2. **Biaya Provisi:** Dipotong **1.0%** (setara 1x bunga) dari total pinjaman saat pencairan.
3. **Cadangan Resiko Kredit (CRK):** Dipotong **10.0%** (setara 1x angsuran pada tenor 10 bulan) saat pencairan.
4. **Denda Keterlambatan:** Diterapkan sebesar **5.0%** dari jumlah angsuran bulanan jika terjadi keterlambatan pembayaran.

_Contoh Perhitungan Pinjaman Rp 10.000.000 (Tenor 10 Bulan):_

- Jumlah Diterima Anggota: **Rp 8.900.000** (Dipotong Provisi Rp 100.000 & CRK Rp 1.000.000)
- Angsuran Pokok Bulanan: **Rp 1.000.000 / bulan**
- Bunga Bulanan: **Rp 100.000 / bulan**
- Denda jika terlambat: **Rp 50.000 / bulan**

---

## 4. Modul Toko & Laporan P&L

Modul Toko Lidia dioptimalkan untuk pencatatan inventaris dan rekapan transaksi berkala tanpa kasir realtime:

- **Katalog Produk:** Mengelola kode barang, kategori, stok aktual, harga beli, dan harga jual barang.
- **Pencatatan Transaksi:** Input manual untuk Pembelian Barang (Restock) dan Penjualan Barang (Accumulated Sales).
- **Laporan Rugi/Laba (P&L) Triwulan:** Menyajikan rekapitulasi data penjualan dan pembelian riil bulan Januari s/d Maret 2026:
  - **Januari:** Penjualan Rp 11.052.000 | Pembelian Rp 10.913.741
  - **Februari:** Penjualan Rp 6.399.000 | Pembelian Rp 4.365.033
  - **Maret:** Penjualan Rp 10.565.000 | Pembelian Rp 0

---

## 5. Panduan Instalasi & Menjalankan Sistem

### Persyaratan Awal

- Node.js versi 18 ke atas
- MariaDB / MySQL server berjalan di `localhost:3306`

### Langkah Setup

1. **Salin File Environment:**

   ```bash
   cp .env.example .env
   ```

   _Pastikan konfigurasi `DATABASE_URL` mengarah ke database `ksulidia` (misal: `mysql://root:lerd@localhost:3306/ksulidia`)._

2. **Jalankan Migrasi Database:**

   ```bash
   npx prisma db push --force-reset
   ```

3. **Populasi Data Sampel (Seeding):**

   ```bash
   npx prisma db seed
   ```

   _Seeder akan otomatis mempopulasikan 300 Anggota aktif, 900 Akun Simpanan, 106 Pinjaman Aktif beserta angsuran berjalan, serta produk katalog dan P&L transaksi Toko._

4. **Jalankan Aplikasi:**

   ```bash
   pnpm run dev
   ```

   Aplikasi dapat diakses di [http://localhost:3005](http://localhost:3005).

5. **Akun Pengguna Demo:**
   - **Administrator:** `sugeng.admin@ksulidiagkjmanahan.com`
   - **Viewer:** `sugeng.viewer@ksulidiagkjmanahan.com`
   - **Password (Semua Akun):** `Sugeng@1234`

### Menjalankan Uji Coba (Testing)

Untuk memastikan fungsionalitas logika RBAC dan utilitas sistem tetap aman, jalankan:

```bash
pnpm run test
```
