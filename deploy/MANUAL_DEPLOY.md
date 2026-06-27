# Panduan Manual Deployment KSU Lidia

Dokumentasi ini menjelaskan langkah-langkah manual untuk melakukan deployment aplikasi **KSU Lidia** di server produksi (Ubuntu/Debian Linux).

---

## 1. Kebutuhan Minimum Sistem

- **Sistem Operasi:** Linux (Ubuntu 22.04 LTS / Debian 12 direkomendasikan)
- **Runtime:** Node.js v20.x atau lebih baru
- **Package Manager:** pnpm v9.x atau lebih baru
- **Database:** MariaDB v10.6+ atau MySQL 8.0+
- **Web Server:** Nginx (sebagai Reverse Proxy)
- **Process Manager:** PM2 (jika tidak menggunakan Systemd)

---

## 2. Langkah-Langkah Deployment Awal (First-Time Setup)

### Langkah 1: Persiapan Database

1. Masuk ke console MySQL/MariaDB server Anda:
   ```bash
   mysql -u root -p
   ```
2. Buat database baru khusus untuk KSU Lidia:
   ```sql
   CREATE DATABASE ksulidia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Langkah 2: Menjalankan Script Inisialisasi

Gunakan script `setup.sh` yang tersedia di dalam folder `deploy` untuk mempersiapkan direktori dan dependensi sistem:

```bash
# Penggunaan: bash deploy/setup.sh [path_tujuan_app]
bash deploy/setup.sh /var/www/ksu-lidia
```

Script ini akan secara otomatis:

1. Memeriksa keberadaan Node.js dan pnpm di server.
2. Menginstall dependensi npm (`pnpm install`).
3. Membuat salinan `.env` dari `.env.example`.
4. Mendaftarkan systemd service dengan nama `ksu-lidia.service` (opsional).

### Langkah 3: Konfigurasi Environment (`.env`)

Buka file `/var/www/ksu-lidia/apps/ksulidia/.env` dan sesuaikan parameter berikut:

```env
# Koneksi Database
DATABASE_URL="mysql://username:password@localhost:3306/ksulidia"

# Keamanan Autentikasi
NEXTAUTH_SECRET="buat_random_string_panjang_di_sini"
NEXTAUTH_URL="https://ksulidia.gkjmanahan.or.id"

# Konfigurasi Captcha & Fitur Tambahan
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
RECAPTCHA_SECRET_KEY=""
```

### Langkah 4: Migrasi & Seeding Awal

Setelah environment database diatur dengan benar, lakukan migrasi skema database dan jalankan seeder untuk mempopulasikan data anggota awal:

```bash
cd /var/www/ksu-lidia/apps/ksulidia

# Deploy skema database (Non-destruktif)
pnpm run db:migrate:deploy

# Populasi data anggota dan saldo awal
pnpm run db:seed
```

---

## 3. Proses Deployment / Pembaruan Kode (Continuous Deployment)

Untuk memperbarui aplikasi ke versi terbaru secara aman, gunakan script `deploy.sh`:

```bash
# Penggunaan: bash deploy/deploy.sh [path_app] [branch]
bash deploy/deploy.sh /var/www/ksu-lidia main
```

Alur kerja otomatis dari script `deploy.sh` adalah sebagai berikut:

1. Menarik kode terbaru dari Git Repository (`git pull`).
2. Menginstall dependensi baru jika ada (`pnpm install`).
3. Men-generate type definition Prisma Client (`prisma generate`).
4. Menjalankan migrasi database yang tertunda (`db:migrate:deploy`).
5. Membangun bundle produksi Next.js (`pnpm run build`).
6. Melakukan pre-health check.
7. Merestart Process Manager (Systemd atau PM2).
8. Melakukan post-health check untuk memastikan endpoint merespons dengan status 200 OK.

---

## 4. Konfigurasi Process Manager (Menjaga Aplikasi Tetap Hidup)

Anda dapat memilih antara menggunakan **Systemd Service** (direkomendasikan) atau **PM2**.

### Opsi A: Systemd Service (Direkomendasikan)

Script `setup.sh` telah mendaftarkan service `/etc/systemd/system/ksu-lidia.service`. Anda cukup mengelolanya dengan perintah:

```bash
# Start service
sudo systemctl start ksu-lidia

# Restart service
sudo systemctl restart ksu-lidia

# Stop service
sudo systemctl stop ksu-lidia

# Melihat log aplikasi secara realtime
sudo journalctl -u ksu-lidia -f
```

### Opsi B: PM2 Process Manager

Jika Anda lebih menyukai PM2, jalankan perintah berikut dari direktori `/var/www/ksu-lidia/apps/ksulidia`:

```bash
# Start aplikasi
pm2 start "pnpm run start" --name "ksu-lidia"

# Menyimpan konfigurasi agar otomatis berjalan saat server reboot
pm2 save
pm2 startup
```

---

## 5. Konfigurasi Reverse Proxy Nginx

Buat konfigurasi file baru di Nginx (misal: `/etc/nginx/sites-available/ksu-lidia`):

```nginx
server {
    listen 80;
    server_name ksulidia.gkjmanahan.or.id; # Sesuaikan dengan domain Anda

    # Redirect HTTP ke HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ksulidia.gkjmanahan.or.id;

    # SSL Certificates (Sesuaikan path Let's Encrypt Anda)
    ssl_certificate /etc/letsencrypt/live/ksulidia.gkjmanahan.or.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ksulidia.gkjmanahan.or.id/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logger
    access_log /var/log/nginx/ksu_lidia_access.log;
    error_log /var/log/nginx/ksu_lidia_error.log;

    # Proxy ke aplikasi Next.js (Running di port 3005)
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi Nginx dan muat ulang service:

```bash
sudo ln -s /etc/nginx/sites-available/ksu-lidia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Penanganan Masalah & Rollback

### Pemantauan Health-Check

Untuk memeriksa status kesehatan runtime aplikasi kapan saja secara cepat, jalankan:

```bash
bash /var/www/ksu-lidia/deploy/health-check.sh
```

### Prosedur Rollback Darurat

Jika rilis terbaru gagal di-build atau crash di server produksi, jalankan script rollback untuk mengembalikan commit git ke versi stabil sebelumnya secara instan:

```bash
bash /var/www/ksu-lidia/deploy/rollback.sh /var/www/ksu-lidia
```

Script ini akan melakukan hard reset git commit, menginstall ulang dependensi, dan melakukan restart service ke kondisi operasional terakhir yang stabil.
