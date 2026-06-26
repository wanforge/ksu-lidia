#!/usr/bin/env bash
# deploy/setup.sh — Inisialisasi server pertama kali (jalankan sekali saja)
# Prasyarat: Node 20+, pnpm, MariaDB/MySQL 10.6+
# Penggunaan: bash deploy/setup.sh [/path/to/app]
set -euo pipefail

APP_DIR="${1:-/var/www/ksu-lidia}"
APP_NAME="ksuldia"
SERVICE_NAME="ksu-lidia"
NODE_PORT=3005

echo "=== [1/7] Periksa dependensi sistem ==="
command -v node  >/dev/null 2>&1 || { echo "❌  Node.js tidak ditemukan. Install Node 20+."; exit 1; }
command -v pnpm  >/dev/null 2>&1 || { echo "❌  pnpm tidak ditemukan. Install: npm i -g pnpm"; exit 1; }
command -v mysql >/dev/null 2>&1 || { echo "⚠️   mysql client tidak ditemukan (opsional untuk health-check)"; }

echo "   Node : $(node -v)"
echo "   pnpm : $(pnpm -v)"

echo ""
echo "=== [2/7] Buat direktori aplikasi ==="
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo ""
echo "=== [3/7] Clone / pull repository ==="
if [ -d ".git" ]; then
  echo "   Repo sudah ada — pull origin main"
  git pull origin main
else
  echo "   ⚠️  Tidak ada .git di $APP_DIR"
  echo "   Salin source code ke direktori ini terlebih dahulu, lalu jalankan ulang."
  exit 1
fi

echo ""
echo "=== [4/7] Install dependensi ==="
cd apps/ksuldia
pnpm install --frozen-lockfile

echo ""
echo "=== [5/7] Buat file .env jika belum ada ==="
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "   ✅  .env dibuat dari .env.example"
    echo "   ⚠️  Edit .env sebelum melanjutkan (DATABASE_URL, NEXTAUTH_SECRET, dll.)!"
  else
    echo "   ❌  .env.example tidak ditemukan"
    exit 1
  fi
else
  echo "   ℹ️   .env sudah ada"
fi

echo ""
echo "=== [6/7] Generate Prisma Client ==="
pnpm run db:generate

echo ""
echo "=== [7/7] Buat systemd service (opsional) ==="
if command -v systemctl >/dev/null 2>&1; then
  SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
  if [ ! -f "$SERVICE_FILE" ]; then
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=KSU Lidia — Sistem Informasi KSU Lidia
After=network.target mariadb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=${APP_DIR}/apps/ksuldia
ExecStart=$(command -v node) $(pnpm store path 2>/dev/null | head -1)/../../../node_modules/.bin/next start -p ${NODE_PORT}
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/apps/ksuldia/.env
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    echo "   ✅  Service $SERVICE_NAME dibuat dan diaktifkan"
  else
    echo "   ℹ️   Service sudah ada: $SERVICE_FILE"
  fi
else
  echo "   ⚠️  systemctl tidak tersedia — lewati pembuatan service"
fi

echo ""
echo "============================================================"
echo "  Setup selesai! Langkah selanjutnya:"
echo "  1. Edit $APP_DIR/apps/ksuldia/.env"
echo "  2. Buat database: CREATE DATABASE ksu_lidia CHARACTER SET utf8mb4;"
echo "  3. Jalankan migrasi: cd $APP_DIR/apps/ksuldia && pnpm run db:migrate:deploy"
echo "  4. Seed data: pnpm run db:seed"
echo "  5. Build: pnpm run build"
echo "  6. Start: systemctl start $SERVICE_NAME"
echo "============================================================"
