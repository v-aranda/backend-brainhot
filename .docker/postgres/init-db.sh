#!/bin/bash
# Este script é executado automaticamente pelo contêiner do Postgres
set -e

# Cria o banco de teste SE ele não existir.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE meubanco_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'meubanco_test')\gexec
EOSQL