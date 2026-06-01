#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_FILE="${1:-"$ROOT_DIR/migrations/000_supabase_current_schema_snapshot.sql"}"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is required."
  echo "Use a Postgres connection string, for example:"
  echo "  export SUPABASE_DB_URL='postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres'"
  exit 1
fi

mkdir -p "$(dirname "$OUT_FILE")"

supabase db dump \
  --db-url "$SUPABASE_DB_URL" \
  --schema public \
  --file "$OUT_FILE"

echo "Schema snapshot written to $OUT_FILE"
