#!/bin/bash
set -e

echo "Configuring PostgreSQL network access"

echo "listen_addresses='*'" >> "$PGDATA/postgresql.conf"

cat >> "$PGDATA/pg_hba.conf" <<EOF

host    all    all    0.0.0.0/0    scram-sha-256
EOF

pg_restore \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -v \
  /docker-entrypoint-initdb.d/demo_db_dump.gz