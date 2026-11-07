#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
npm ci
npm ci --prefix server
npm run check
docker compose config --quiet
docker compose build
printf '%s\n' 'Проверки и сборка прошли. Для переноса базы и запуска см. docs/PRODUCTION.md.'
