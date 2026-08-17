#!/bin/sh
set -eu

API_DIR="${API_DIR:-/app/backend/api}"

if [ -f "$API_DIR/package.json" ]; then
  cd "$API_DIR"
elif [ -f /app/package.json ]; then
  cd /app
else
  echo "[api] Could not locate API package root" >&2
  exit 1
fi

PRISMA_BIN="./node_modules/.bin/prisma"
if [ ! -x "$PRISMA_BIN" ]; then
  echo "[api] Prisma CLI not found at $PRISMA_BIN" >&2
  exit 1
fi

echo "[api] Applying database migrations in $(pwd)..."
"$PRISMA_BIN" migrate deploy

echo "[api] Starting API..."
exec node dist/main.js
