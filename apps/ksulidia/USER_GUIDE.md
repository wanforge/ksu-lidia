# Panduan Penggunaan Aplikasi KSU Lidia

Selamat datang di aplikasi manajemen Koperasi Serba Usaha (KSU) Lidia. Aplikasi ini dirancang untuk memudahkan pengelolaan data anggota, simpan pinjam, dan pencatatan transaksi harian.

## 1. Akses dan Login
- Buka aplikasi di browser (alamat sesuai konfigurasi server).
- Pada halaman login, masukkan **Email** dan **Password** Anda.
- Untuk mengingat sesi pada browser perangkat Anda, centang opsi **"Ingat saya"** (blok warna akan muncul tanpa ikon centang).
- Klik tombol **Sign In** untuk masuk ke Dashboard utama.

## 2. Dashboard
Setelah login, Anda akan masuk ke halaman Dashboard yang menampilkan:
- Ringkasan statistik (jumlah anggota, saldo, dll).
- Navigasi utama di bagian samping kiri (sidebar) untuk berpindah antar modul.

## 3. Manajemen Anggota (Simpan Pinjam)
Menu ini digunakan untuk mengelola data anggota koperasi.
- **Tambah Anggota**: Anda dapat menambah anggota baru atau melakukan proses *import* massal.
- **Daftar Anggota**: Menampilkan seluruh anggota yang terdaftar. Anda bisa melakukan pencarian dan memfilter data anggota.

## 4. Modul Audit
Fitur ini mencatat semua aktivitas dan perubahan yang terjadi dalam sistem (terletak pada menu **Audit**):
- **Aktivitas Sistem**: Mencatat proses login, penambahan data, penghapusan, dll.
- **Riwayat Perubahan Data**: Mencatat perubahan detail (*diff*) dari nilai sebelumnya (sebelum diedit) menjadi nilai yang baru.
Kedua log ini disatukan dalam satu halaman untuk memudahkan pelacakan histori sistem secara utuh.

## 5. Modul Sistem (Diagnostik)
Bagi administrator, menu **Sistem** berfungsi untuk memantau kesehatan server dan aplikasi:
- **Konfigurasi**: Mengecek status ketersediaan variabel lingkungan seperti Database URL, Penyimpanan (S3/Lokal), dll.
- **Perbandingan Waktu**: Melihat selisih (drift) waktu antara perangkat Anda, server NodeJS, database MySQL, dan jam atom (NTP).
- **Runtime, CPU, dan Memori**: Melihat pemakaian RAM, beban CPU (load average), versi Node/Prisma, uptime, hingga daftar IP Address (Network Interfaces) yang aktif di server.
- **Environment Variables**: Menyediakan daftar variabel konfigurasi secara lengkap (data sensitif akan otomatis disembunyikan).

## 6. Tips Keamanan
- Pastikan logout jika Anda menggunakan perangkat bersama (publik).
- Selalu pantau halaman Audit secara berkala untuk memastikan tidak ada aktivitas mencurigakan.

---
*Dibuat untuk RSUD Trenggalek / Pengguna KSU Lidia.*
