#!/usr/bin/env bash
# deploy/rollback.sh — Rollback ke commit sebelumnya
# Penggunaan: bash deploy/rollback.sh [/path/to/app] [commit-hash]
set -euo pipefail

APP_DIR="${1:-/var/www/ksu-lidia}"
TARGET_COMMIT="${2:-HEAD~1}"
SERVICE_NAME="ksu-lidia"
APP_SUBDIR="apps/ksuldia"

echo "=== Rollback KSU Lidia ==="
echo "  Dir    : $APP_DIR"
echo "  Target : $TARGET_COMMIT"
echo ""

read -r -p "Lanjutkan rollback ke $TARGET_COMMIT? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Dibatalkan."
  exit 0
fi

cd "$APP_DIR"

echo "[1/5] Reset ke commit $TARGET_COMMIT..."
git stash 2>/dev/null || true
git checkout "$TARGET_COMMIT" -- .
echo "   Commit: $(git rev-parse --short HEAD)"

echo ""
echo "[2/5] Install dependensi..."
cd "$APP_SUBDIR"
pnpm install --frozen-lockfile

echo ""
echo "[3/5] Generate Prisma Client..."
pnpm run db:generate

echo ""
echo "[4/5] Build..."
NODE_ENV=production pnpm run build

echo ""
echo "[5/5] Restart service..."
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
  sudo systemctl restart "$SERVICE_NAME"
elif command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$SERVICE_NAME" 2>/dev/null || true
fi

echo ""
echo "============================================================"
echo "  ✅  Rollback selesai ke: $(git rev-parse --short HEAD)"
echo "  ⚠️  CATATAN: Migrasi database TIDAK di-rollback otomatis."
echo "      Rollback manual schema diperlukan jika ada migrasi baru."
echo "============================================================"
