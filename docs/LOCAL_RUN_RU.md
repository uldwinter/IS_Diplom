# Полный запуск проекта локально (русская инструкция)

Документ для быстрого и понятного старта с нуля.

---

## 1) Что нужно установить

### Обязательно
- **Git**
- **Docker Desktop** (Windows/macOS) или Docker Engine + Docker Compose plugin (Linux)

### Для запуска без Docker (опционально)
- **Node.js 20+**
- **npm 10+**
- **PostgreSQL 16+**

Проверка:

```bash
git --version
docker --version
docker compose version
node -v
npm -v
```

---

## 2) Клонирование проекта

```bash
git clone <URL_ВАШЕГО_РЕПО>
cd Site
```

---

## 3) Рекомендуемый запуск (через Docker)

Это самый простой и стабильный путь для локальной проверки.

```bash
docker compose up --build
```

После старта будут доступны:
- Frontend: `http://localhost`
- API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

Тестовые пользователи:
- `admin / admin123`
- `curator / curator123`
- `student / student123`

Остановка:

```bash
docker compose down
```

С удалением тома БД:

```bash
docker compose down -v
```

---

## 4) Запуск одной командой (predeploy)

В проекте есть скрипт, который прогоняет проверки и поднимает сервисы.

```bash
chmod +x scripts/predeploy.sh
./scripts/predeploy.sh
```

Скрипт выполняет:
1. проверку Docker / Compose,
2. проверку lockfile,
3. `npm run check:contracts`,
4. `npm run check:store`,
5. `npm run check:types`,
6. `npm run build`,
7. `docker compose config`,
8. `docker compose up -d --build`.

---

## 5) Запуск без Docker (ручной режим)

### 5.1 Backend

```bash
cd server
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

### 5.2 Frontend (в новом терминале)

```bash
cd ..
npm install
npm run dev
```

---

## 6) Проверки перед коммитом/PR

```bash
npm ci
npm run check:contracts
npm run check:store
npm run check:types
npm run build
```

---

## 7) Частые проблемы и решения

### Проблема: `npm ci` падает
- Проверьте, что существует `package-lock.json`.
- Очистите старые зависимости: удалите `node_modules`, затем снова `npm ci`.

### Проблема: API не стартует, ошибка подключения к БД
- Убедитесь, что БД поднята (`docker compose ps`).
- В ручном режиме проверьте `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

### Проблема: порт занят (`80`, `8080`, `5432`)
- Остановите сервис, который занял порт, или поменяйте порты в `docker-compose.yml`.

### Проблема: после изменений “всё сломалось”
- Прогоните базовые проверки из раздела 6.
- Сверьтесь с `docs/PR_STRATEGY.md` и делайте маленькие PR.
