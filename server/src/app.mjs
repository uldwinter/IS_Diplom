import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  fileType,
  createBackup,
  restoreBackup,
  MAX_DOCUMENT_BYTES,
} from './backup.mjs';
import {
  HttpError,
  fail,
  parse,
  currentUser,
  publicUser,
  snapshot,
  register,
  executeCommand,
  audit,
  timestamp,
  requireSessionUser,
  documentReference,
  normalized,
} from './domain.mjs';

const SESSION_COOKIE = 'achievement_session';
const MAX_RESTORE_BYTES = 4 * 1024 * 1024;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const loginSchema = z.object({
  login: z.string().trim().min(1).max(100),
  password: z
    .string()
    .min(1)
    .refine((value) => Buffer.byteLength(value) <= 72),
});

function sessionHash(req) {
  const cookie = (req.headers.cookie || '')
    .split(';')
    .map((item) => item.trim());
  const token = cookie
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? hashToken(token) : null;
}

function* backupChunks(payload) {
  const jsonChunks = function* (value) {
    const bytes = Buffer.from(JSON.stringify(value));
    for (let offset = 0; offset < bytes.length; offset += 32768) {
      yield bytes.subarray(offset, offset + 32768);
    }
  };
  yield '{"format":"achievement-bank-backup-v1","exportedAt":';
  yield* jsonChunks(payload.exportedAt);
  yield ',"state":';
  yield* jsonChunks(payload.state);
  yield ',"documents":[';
  for (const [index, document] of payload.documents.entries()) {
    if (index > 0) yield ',';
    yield* jsonChunks(document);
  }
  yield ']}';
}

export function createApp({
  repository,
  production = process.env.NODE_ENV === 'production',
  appOrigin = process.env.APP_ORIGIN,
  sessionHours = 12,
  rateLimit = true,
} = {}) {
  if (!repository) throw new Error('repository is required');
  if (production && !appOrigin)
    throw new Error('APP_ORIGIN is required in production');
  if (appOrigin) {
    const origin = new URL(appOrigin);
    if (
      origin.origin !== appOrigin ||
      (production && origin.protocol !== 'https:')
    ) {
      throw new Error('APP_ORIGIN must be an HTTPS origin in production');
    }
  }

  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'same-origin');
    next();
  });
  app.use('/api/v1', (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    const expectedOrigin = appOrigin || `${req.protocol}://${req.get('host')}`;
    if (
      req.get('sec-fetch-site') === 'cross-site' ||
      (origin && origin !== expectedOrigin)
    ) {
      return next(new HttpError(403, 'Запрос с постороннего сайта запрещён'));
    }
    next();
  });

  // Per-process throttling supplements account lockout stored in PostgreSQL.
  const attempts = new Map();
  const throttle = (req, res, next) => {
    if (!rateLimit) return next();
    const now = Date.now();
    const key = `${req.path}:${req.ip || 'unknown'}`;
    let entry = attempts.get(key);
    if (!entry || entry.until <= now) {
      if (attempts.size >= 10000) {
        for (const [address, value] of attempts)
          if (value.until <= now) attempts.delete(address);
        if (attempts.size >= 10000)
          attempts.delete(attempts.keys().next().value);
      }
      entry = { count: 0, until: now + 15 * 60 * 1000 };
      attempts.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > 60)
      return res
        .status(429)
        .json({ ok: false, message: 'Слишком много попыток. Повторите позже' });
    next();
  };
  const authenticate = asyncRoute(async (req, _res, next) => {
    const hash = sessionHash(req);
    const session = hash ? await repository.readSession(hash) : null;
    if (!session) fail(401, 'Войдите в систему');
    req.sessionHash = hash;
    req.state = session.state;
    req.actor = currentUser(session.state, session.userId);
    next();
  });
  const requireAdmin = (req, _res, next) => {
    if (req.actor.role !== 'admin')
      return next(new HttpError(403, 'Недостаточно прав'));
    next();
  };
  const cookieOptions = {
    httpOnly: true,
    secure: production,
    sameSite: 'strict',
    path: '/api',
  };

  app.get(
    '/health',
    asyncRoute(async (_req, res) => {
      await repository.health();
      res.json({ ok: true, database: 'connected' });
    }),
  );
  app.get(
    '/api/v1/bootstrap',
    asyncRoute(async (_req, res) => {
      const { classCatalog, scoringRules, scoringVersion } =
        await repository.read();
      res.json({ classCatalog, scoringRules, scoringVersion });
    }),
  );

  app.post(
    '/api/v1/documents',
    authenticate,
    express.raw({ type: () => true, limit: MAX_DOCUMENT_BYTES }),
    asyncRoute(async (req, res) => {
      if (!Buffer.isBuffer(req.body) || !req.body.length)
        fail(400, 'Файл пуст');
      let name;
      try {
        name = decodeURIComponent(req.get('x-file-name') || '');
      } catch {
        fail(400, 'Некорректное имя файла');
      }
      if (!name || Buffer.byteLength(name) > 255 || /[\x00-\x1f/\\]/.test(name))
        fail(400, 'Некорректное имя файла');
      const mime = fileType(req.body);
      if (req.get('content-type')?.split(';')[0] !== mime)
        fail(400, 'Тип файла не совпадает с содержимым');

      const id = randomUUID();
      await repository.withState(async (state, context) => {
        const actor = await requireSessionUser(state, context, req.sessionHash);
        await context.putDocument({
          id,
          ownerId: actor.id,
          name,
          mime,
          content: req.body,
        });
        audit(state, actor, 'Загрузка', 'Документы', `Загружен ${name}`);
      });
      res.status(201).json({ ok: true, document: documentReference(id, name) });
    }),
  );
  app.get(
    '/api/v1/documents/:id',
    authenticate,
    asyncRoute(async (req, res) => {
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          req.params.id,
        )
      )
        fail(404, 'Документ не найден');
      const document = await repository.getDocument(req.params.id);
      if (!document) fail(404, 'Документ не найден');
      if (req.actor.role === 'student' && req.actor.id !== document.ownerId)
        fail(403, 'Нет доступа к документу');
      const fileName = encodeURIComponent(document.name).replace(
        /['()*]/g,
        (character) => `%${character.charCodeAt(0).toString(16)}`,
      );
      res.set('Content-Type', document.mime);
      res.set(
        'Content-Disposition',
        `attachment; filename="document"; filename*=UTF-8''${fileName}`,
      );
      res.send(document.content);
    }),
  );
  app.get(
    '/api/v1/backup',
    authenticate,
    requireAdmin,
    asyncRoute(async (req, res) => {
      const payload = await createBackup(
        repository,
        req.actor.id,
        req.sessionHash,
      );
      res.set(
        'Content-Disposition',
        `attachment; filename="backup-${timestamp().slice(0, 10)}.json"`,
      );
      res.set('Content-Type', 'application/json; charset=utf-8');
      await pipeline(Readable.from(backupChunks(payload)), res);
    }),
  );
  app.post(
    '/api/v1/restore',
    authenticate,
    requireAdmin,
    express.json({ limit: MAX_RESTORE_BYTES }),
    asyncRoute(async (req, res) => {
      await restoreBackup(repository, req.body, req.actor.id, req.sessionHash);
      res.clearCookie(SESSION_COOKIE, cookieOptions);
      res.json({ ok: true, requiresLogin: true });
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.post(
    '/api/v1/auth/login',
    throttle,
    asyncRoute(async (req, res) => {
      const credentials = parse(loginSchema, req.body);
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(
        Date.now() + sessionHours * 3600000,
      ).toISOString();
      const outcome = await repository.withState(async (state, context) => {
        const user = state.users.find(
          (candidate) =>
            normalized(candidate.login) === normalized(credentials.login),
        );
        if (!user || user.status !== 'active' || user.archivedAt)
          return { error: 401 };
        if (user.lockedUntil && Date.parse(user.lockedUntil) > Date.now())
          return { error: 423 };
        if (!(await bcrypt.compare(credentials.password, user.passwordHash))) {
          const count = (user.failedLoginAttempts ?? 0) + 1;
          user.failedLoginAttempts = count >= 5 ? 0 : count;
          if (count >= 5)
            user.lockedUntil = new Date(
              Date.now() + 15 * 60 * 1000,
            ).toISOString();
          audit(
            state,
            user,
            'Неудачный вход',
            'Авторизация',
            'Неверные учётные данные',
          );
          return { error: 401 };
        }
        const previousHash = sessionHash(req);
        if (previousHash) await context.deleteSession(previousHash);
        await context.createSession(hashToken(token), user.id, expiresAt);
        user.failedLoginAttempts = 0;
        delete user.lockedUntil;
        user.lastLogin = timestamp();
        audit(state, user, 'Вход', 'Авторизация', 'Выполнен вход в систему');
        return { user: publicUser(user), state: snapshot(state, user) };
      });
      if (outcome.error)
        fail(
          outcome.error,
          outcome.error === 423
            ? 'Аккаунт временно заблокирован'
            : 'Неверный логин или пароль',
        );
      res.cookie(SESSION_COOKIE, token, {
        ...cookieOptions,
        maxAge: sessionHours * 3600000,
      });
      res.json({ ok: true, ...outcome });
    }),
  );
  app.post(
    '/api/v1/auth/logout',
    asyncRoute(async (req, res) => {
      const hash = sessionHash(req);
      if (hash)
        await repository.withState((_state, context) =>
          context.deleteSession(hash),
        );
      res.clearCookie(SESSION_COOKIE, cookieOptions);
      res.json({ ok: true });
    }),
  );
  app.get('/api/v1/auth/me', authenticate, (req, res) =>
    res.json({ ok: true, user: publicUser(req.actor) }),
  );
  app.get('/api/v1/state', authenticate, (req, res) =>
    res.json(snapshot(req.state, req.actor)),
  );
  app.post(
    '/api/v1/registrations',
    throttle,
    asyncRoute(async (req, res) => {
      const result = await repository.withState((state) =>
        register(state, req.body),
      );
      res.status(201).json({ ok: true, ...result });
    }),
  );
  app.post(
    '/api/v1/commands',
    authenticate,
    asyncRoute(async (req, res) => {
      const { name, args } = parse(
        z.object({
          name: z.string().max(100),
          args: z.array(z.unknown()).max(10),
        }),
        req.body,
      );
      const outcome = await repository.withState(async (state, context) => {
        const actor = await requireSessionUser(state, context, req.sessionHash);
        const result = await executeCommand(state, actor, name, args, context);
        return { ok: true, ...result, state: snapshot(state, actor) };
      });
      if (name === 'changeCurrentUserPassword')
        res.clearCookie(SESSION_COOKIE, cookieOptions);
      res.json(outcome);
    }),
  );
  app.use('/api', (_req, res) =>
    res.status(404).json({ ok: false, message: 'Маршрут API не найден' }),
  );
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === 'entity.too.large')
      return res
        .status(413)
        .json({ ok: false, message: 'Превышен допустимый размер запроса' });
    if (error instanceof SyntaxError && 'body' in error)
      return res.status(400).json({ ok: false, message: 'Некорректный JSON' });
    const status = error instanceof HttpError ? error.status : 500;
    if (status >= 500)
      console.error('API request failed:', error.code || error.name);
    res
      .status(status)
      .json({
        ok: false,
        message:
          status >= 500
            ? 'Сервис временно недоступен. Изменения не сохранены'
            : error.message,
      });
  });
  return app;
}
