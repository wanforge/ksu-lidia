#!/usr/bin/env bash
# deploy/deploy.sh — Deploy / update aplikasi KSU Lidia ke server
# Penggunaan: bash deploy/deploy.sh [/path/to/app] [branch]
# Contoh:    bash deploy/deploy.sh /var/www/ksu-lidia main
set -euo pipefail

APP_DIR="${1:-/var/www/ksu-lidia}"
BRANCH="${2:-main}"
SERVICE_NAME="ksu-lidia"
APP_SUBDIR="apps/ksulidia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/deploy_${TIMESTAMP}.log"

echo "=== Deploy KSU Lidia ==="
echo "  Dir    : $APP_DIR"
echo "  Branch : $BRANCH"
echo "  Log    : $LOG_FILE"
echo ""

# ── Fungsi rollback darurat ──────────────────────────────────────────────────
rollback() {
  echo ""
  echo "❌  Deploy gagal! Jalankan rollback:"
  echo "   bash ${APP_DIR}/deploy/rollback.sh ${APP_DIR}"
  exit 1
}
trap rollback ERR

cd "$APP_DIR"

echo "[1/8] Pull latest code ($BRANCH)..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo "   Commit: $(git rev-parse --short HEAD)"

echo ""
echo "[2/8] Install dependensi..."
cd "$APP_SUBDIR"
pnpm install --frozen-lockfile 2>&1 | tee -a "$LOG_FILE"

echo ""
echo "[3/8] Generate Prisma Client..."
pnpm run db:generate 2>&1 | tee -a "$LOG_FILE"

echo ""
echo "[4/8] Jalankan migrasi database..."
pnpm run db:migrate:deploy 2>&1 | tee -a "$LOG_FILE"

echo ""
echo "[5/8] Build Next.js..."
NODE_ENV=production pnpm run build 2>&1 | tee -a "$LOG_FILE"

echo ""
echo "[6/8] Health check sebelum restart..."
cd "$APP_DIR"
if [ -f "deploy/health-check.sh" ]; then
  bash deploy/health-check.sh --pre-deploy || true
fi

echo ""
echo "[7/8] Restart service..."
cd "$APP_SUBDIR"
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
  sudo systemctl restart "$SERVICE_NAME"
  echo "   ✅  Service $SERVICE_NAME di-restart"
elif command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$SERVICE_NAME" 2>/dev/null || pm2 start "pnpm run start" --name "$SERVICE_NAME"
  echo "   ✅  PM2 process $SERVICE_NAME di-restart"
else
  echo "   ⚠️  Tidak ada service manager. Start manual: pnpm run start"
fi

echo ""
echo "[8/8] Health check pasca deploy..."
sleep 3
cd "$APP_DIR"
if [ -f "deploy/health-check.sh" ]; then
  bash deploy/health-check.sh || { echo "❌  Health check gagal!"; exit 1; }
fi

echo ""
echo "============================================================"
echo "  ✅  Deploy berhasil!"
echo "  Commit : $(cd $APP_DIR && git rev-parse --short HEAD)"
echo "  Waktu  : $(date)"
echo "  Log    : $LOG_FILE"
echo "============================================================"
