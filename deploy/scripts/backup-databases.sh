#!/usr/bin/env bash
# Nightly logical backup of both LMS databases (for the on-host MySQL profile).
#
# Dumps DB_NAME + RPI_DB_NAME (edtech_lms + edtech_lms_rpi by default) via the
# running mysql container into BACKUP_DIR as a dated .sql.gz, then prunes
# files older than KEEP_DAYS.
# Install this as a cron entry on the host. Test the restore path
# periodically: a backup that has never been restored is a hope, not a
# backup.
#
# Usage: deploy/scripts/backup-databases.sh
# Requires: docker compose stack up (reads MYSQL_ROOT_PASSWORD from ENV_FILE).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-$(dirname "$SCRIPT_DIR")}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
BACKUP_DIR="${BACKUP_DIR:-$DEPLOY_DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
COMPOSE=(docker compose -f "$DEPLOY_DIR/$COMPOSE_FILE" --env-file "$DEPLOY_DIR/$ENV_FILE")

# shellcheck disable=SC1091
set -a; . "$DEPLOY_DIR/$ENV_FILE"; set +a

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/edtech-$STAMP.sql.gz"

"${COMPOSE[@]}" exec -T mysql mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" \
  --databases "${DB_NAME:-edtech_lms}" "${RPI_DB_NAME:-edtech_lms_rpi}" \
  --single-transaction --routines --triggers \
  | gzip > "$OUT"

# A zero-byte or tiny dump means mysqldump failed upstream of gzip: fail loudly.
MIN_BYTES=10000
SIZE=$(stat -c%s "$OUT")
if [ "$SIZE" -lt "$MIN_BYTES" ]; then
  echo "backup-databases: dump suspiciously small ($SIZE bytes), keeping for forensics, exiting nonzero" >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'edtech-*.sql.gz' -mtime +"$KEEP_DAYS" -delete

echo "backup-databases: OK $OUT ($SIZE bytes)"
