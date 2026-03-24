#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/7] Проверка Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker не найден. Установите Docker Desktop / Docker Engine." >&2
  exit 1
fi

echo "[2/7] Проверка Docker Compose..."
if ! docker compose version >/dev/null 2>&1; then
  echo "❌ Docker Compose plugin не найден (docker compose)." >&2
  exit 1
fi

echo "[3/7] Проверка npm lockfile..."
if [[ ! -f package-lock.json ]]; then
  echo "❌ Не найден package-lock.json в корне проекта." >&2
  exit 1
fi

echo "[4/8] Проверка smoke-тестов..."
npm run check:contracts
npm run check:store

echo "[5/8] TypeScript-проверка..."
npm run check:types

echo "[6/8] Сборка frontend..."
npm run build

echo "[7/8] Проверка compose-конфига..."
docker compose config >/dev/null

echo "[8/8] Запуск контейнеров..."
docker compose up -d --build

echo "\n✅ Готово. Сервисы:"
echo "- Frontend: http://localhost"
echo "- API:      http://localhost:8080/health"
echo "- Postgres: localhost:5432"

echo "\nПроверка статуса:"
docker compose ps
