#!/usr/bin/env bash
# Chạy một lần khi volume pgdata còn trống (docker-entrypoint-initdb.d).
# Đặt lại password theo POSTGRES_PASSWORD để đảm bảo hash SCRAM-SHA-256 nhất quán.
set -euo pipefail

escaped_password="${POSTGRES_PASSWORD//\'/\'\'}"
psql -v ON_ERROR_STOP=1 \
  --username "${POSTGRES_USER}" \
  --dbname "${POSTGRES_DB}" \
  -c "ALTER USER \"${POSTGRES_USER}\" WITH PASSWORD '${escaped_password}';"
