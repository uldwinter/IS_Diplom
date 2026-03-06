# Банк одарённых детей — полноценная информационная система

Репозиторий содержит:
- **Frontend (React + Vite)**
- **Backend API (Node.js + Express)**
- **База данных PostgreSQL**
- **Миграции, seed, API-контракт (OpenAPI), CI**

Это позволяет скачать проект и развернуть его на хостинге как единую систему.

---

## Архитектура

- `src/` — клиентское приложение (кабинеты: админ/куратор/ученик)
- `server/src/` — сервер API
- `server/migrations/` — SQL-миграции БД
- `server/contracts/openapi.yaml` — API-контракт
- `docker-compose.yml` — единый запуск `web + api + db`

---

## Быстрый старт (рекомендуется)

### 1) Требования
- Docker + Docker Compose

### 2) Запуск
```bash
docker compose up --build
```

Сервисы:
- Frontend: `http://localhost`
- API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

При старте API автоматически:
1. применяет миграции,
2. выполняет seed начальных пользователей.

### 3) Тестовые учетные данные
- admin / admin123
- curator / curator123
- student / student123

---

## Локальный запуск без Docker

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

---

## Безопасность и hardening (реализовано)

- Хранение паролей в БД в виде `password_hash` (bcrypt)
- JWT access + refresh
- Таблица refresh-сессий
- Ограничение попыток входа + временная блокировка
- RBAC на защищённых endpoint’ах
- Аудит действий входа/создания достижений и пр.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) проверяет:
- `npm run check:contracts`
- `npm run check:store`
- `npm run build`

---

## Что публиковать на хостинг

Для VPS/облака достаточно:
1. склонировать репозиторий,
2. выполнить `docker compose up -d --build`,
3. настроить домен/SSL на reverse proxy.

Система готова к публикации как full-stack приложение.



## Запуск одной командой (для новичка)

Если хотите минимизировать ручные шаги, используйте скрипт predeploy:

```bash
chmod +x scripts/predeploy.sh
./scripts/predeploy.sh
```

Скрипт автоматически:
1. проверит наличие Docker и Docker Compose,
2. проверит наличие `package-lock.json`,
3. выполнит `npm run check:contracts` и `npm run check:store`,
4. выполнит `npm run build`,
5. проверит `docker compose config`,
6. запустит `docker compose up -d --build`.

## Диагностика типичных проблем запуска

- Если в CI падает шаг `npm ci`, проверьте, что в корне репозитория есть `package-lock.json`.
- Если API стартует раньше PostgreSQL и завершается с ошибкой подключения, используйте `docker compose` из этого репозитория (в нём добавлен `healthcheck` БД и запуск API только после готовности базы).
- Перед публикацией рекомендуется локально выполнить:

```bash
npm run check:contracts
npm run check:store
npm run build
```
