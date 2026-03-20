# Развертывание на хостинге (VPS) + рекомендации

Документ описывает безопасный и воспроизводимый деплой проекта на сервер.

---

## 1) Базовая стратегия деплоя

Рекомендуемый путь:
1. VPS (Linux) + Docker + Docker Compose,
2. запуск проекта через `docker compose up -d --build`,
3. reverse proxy (Nginx/Caddy/Traefik),
4. HTTPS (Let's Encrypt).

---

## 2) Подготовка сервера

### 2.1 Установить Docker и Compose plugin

Проверьте:

```bash
docker --version
docker compose version
```

### 2.2 Создать пользователя для деплоя

Рекомендуется запускать деплой не из-под root.

### 2.3 Открыть firewall-порты
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

Порты БД наружу лучше не открывать в production.

---

## 3) Загрузка проекта на VPS

```bash
git clone <URL_ВАШЕГО_РЕПО>
cd Site
```

Для обновлений:

```bash
git pull
```

---

## 4) Преддеплой-проверка

```bash
chmod +x scripts/predeploy.sh
./scripts/predeploy.sh
```

Если не хотите автозапуск из скрипта, можно вручную:

```bash
npm ci
npm run check:contracts
npm run check:store
npm run check:types
npm run build
docker compose config
```

---

## 5) Запуск в production

```bash
docker compose up -d --build
docker compose ps
```

Проверка API:

```bash
curl http://localhost:8080/health
```

Логи:

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db
```

---

## 6) Reverse proxy и HTTPS (рекомендовано)

### Вариант через Nginx
- Поднимите отдельный Nginx (или системный),
- проксируйте домен на `web` (порт 80 контейнера),
- получите SSL сертификат через certbot.

Рекомендуется скрыть внутренние сервисы за proxy и не отдавать лишние порты наружу.

---

## 7) Рекомендации по безопасности

1. Замените дефолтные секреты (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
2. Не используйте дефолтные пароли Postgres в production.
3. Отключите внешний доступ к БД (удалите публикацию `5432:5432`, если не нужна).
4. Регулярно обновляйте образы:
   ```bash
   docker compose pull
   docker compose up -d
   ```
5. Настройте резервные копии БД (ежедневно).

---

## 8) Резервное копирование PostgreSQL

Пример дампа:

```bash
docker exec -t $(docker compose ps -q db) pg_dump -U postgres gifted_children > backup.sql
```

Восстановление:

```bash
cat backup.sql | docker exec -i $(docker compose ps -q db) psql -U postgres -d gifted_children
```

---

## 9) Обновление без простоя (практика)

Минимальный безопасный порядок:
1. `git pull`
2. прогоны проверок,
3. `docker compose up -d --build`
4. проверка `health` и логов.

При критичных изменениях схемы БД сначала протестируйте на staging.

---

## 10) Когда нужен staging

Обязательно добавьте staging-среду, если:
- вносятся изменения в миграции,
- меняется auth/roles,
- меняется логика регистраций/достижений,
- меняется схема API-контрактов.
