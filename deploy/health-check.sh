#!/usr/bin/env bash
# deploy/health-check.sh — Cek kesehatan aplikasi KSU Lidia
# Penggunaan: bash deploy/health-check.sh [--pre-deploy]
set -euo pipefail

HOST="${HEALTH_CHECK_HOST:-localhost}"
PORT="${HEALTH_CHECK_PORT:-3002}"
BASE_URL="http://${HOST}:${PORT}"
MAX_RETRIES=10
RETRY_DELAY=3

PRE_DEPLOY=false
if [ "${1:-}" = "--pre-deploy" ]; then
  PRE_DEPLOY=true
fi

echo "=== Health Check KSU Lidia ==="
echo "  URL    : $BASE_URL"
echo ""

# ── 1. Cek apakah port terbuka ───────────────────────────────────────────────
echo "[1] Cek koneksi HTTP..."
retry=0
until curl -sf --max-time 5 -o /dev/null "$BASE_URL" 2>/dev/null; do
  retry=$((retry + 1))
  if [ $retry -ge $MAX_RETRIES ]; then
    if $PRE_DEPLOY; then
      echo "   ⚠️  Aplikasi belum berjalan (wajar sebelum deploy)"
      break
    fi
    echo "   ❌  Aplikasi tidak merespons setelah $MAX_RETRIES percobaan"
    exit 1
  fi
  echo "   ⏳  Tunggu ($retry/$MAX_RETRIES)..."
  sleep $RETRY_DELAY
done
echo "   ✅  HTTP OK"

if $PRE_DEPLOY; then
  echo ""
  echo "Pre-deploy check selesai."
  exit 0
fi

# ── 2. Cek halaman login ─────────────────────────────────────────────────────
echo ""
echo "[2] Cek halaman login..."
STATUS=$(curl -sf --max-time 10 -o /dev/null -w "%{http_code}" "${BASE_URL}/signin" 2>/dev/null || echo "000")
if [[ "$STATUS" == "200" || "$STATUS" == "307" || "$STATUS" == "302" ]]; then
  echo "   ✅  Login page: HTTP $STATUS"
else
  echo "   ❌  Login page gagal: HTTP $STATUS"
  exit 1
fi

# ── 3. Cek API sistem ────────────────────────────────────────────────────────
echo ""
echo "[3] Cek API /api/ksulidia/system..."
API_STATUS=$(curl -sf --max-time 10 -o /dev/null -w "%{http_code}" "${BASE_URL}/api/ksulidia/system" 2>/dev/null || echo "000")
if [[ "$API_STATUS" == "200" || "$API_STATUS" == "401" || "$API_STATUS" == "403" ]]; then
  echo "   ✅  API endpoint: HTTP $API_STATUS (auth required = normal)"
else
  echo "   ❌  API endpoint gagal: HTTP $API_STATUS"
  exit 1
fi

# ── 4. Cek proses node ───────────────────────────────────────────────────────
echo ""
echo "[4] Cek proses Node.js..."
if pgrep -f "next start" >/dev/null 2>&1; then
  echo "   ✅  Proses next start berjalan"
elif pgrep -f "node.*${PORT}" >/dev/null 2>&1; then
  echo "   ✅  Proses Node.js di port $PORT berjalan"
else
  echo "   ⚠️  Proses Node.js tidak terdeteksi via pgrep"
fi

echo ""
echo "============================================================"
echo "  ✅  Health check LULUS — KSU Lidia berjalan normal"
echo "  URL: $BASE_URL"
echo "============================================================"
