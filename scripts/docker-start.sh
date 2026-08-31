#!/bin/sh
# Railway / Docker start: migrate, generate, seed if User is empty, then next start.
# Volumes are only mounted at runtime — do not run this as a build or pre-deploy step.
set -eu

cd "$(dirname "$0")/.."
export PATH="$PWD/node_modules/.bin:$PATH"

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="file:/data/prod.db"
fi

if [ -z "${UPLOAD_DIR:-}" ]; then
  export UPLOAD_DIR="/data/uploads"
fi

if [ -z "${NEXTAUTH_URL:-}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
  export NEXTAUTH_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
fi

mkdir -p "$UPLOAD_DIR"

SCHEMA="$(node scripts/prisma-provider.mjs)"

npx prisma migrate deploy --schema="$SCHEMA"
npx prisma generate --schema="$SCHEMA"
# First boot only: seed Francis + MAX A/C when User is empty.
node scripts/seed-if-empty.mjs

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
