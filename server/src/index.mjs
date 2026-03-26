import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool, query } from './db.mjs';
import { authRequired, requireRoles, signAccessToken } from './auth.mjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

const loginSchema = z.object({ login: z.string().min(1), password: z.string().min(1) });

async function writeAudit(actorUserId, action, entity, details, req) {
  await query(
    `insert into audit_logs (actor_user_id, action, entity, details, device, ip_address)
     values ($1,$2,$3,$4,$5,$6)`,
    [actorUserId ?? null, action, entity, details, req.headers['user-agent'] || 'unknown', req.ip || null]
  );
}

app.get('/health', async (_req, res) => {
  await query('select 1');
  res.json({ ok: true });
});

app.post('/api/v1/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const { login, password } = parsed.data;
  const rs = await query('select * from users where login = $1', [login]);
  if (!rs.rowCount) return res.status(401).json({ message: 'Invalid credentials' });

  const user = rs.rows[0];
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return res.status(423).json({ message: 'Account locked. Try later.' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const attempts = Number(user.failed_login_attempts || 0) + 1;
    const shouldLock = attempts >= 5;
    await query(
      'update users set failed_login_attempts=$1, locked_until=$2 where id=$3',
      [shouldLock ? 0 : attempts, shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null, user.id]
    );
    await writeAudit(user.id, 'LOGIN_FAILED', 'AUTH', `Failed login for ${login}`, req);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  await query('update users set failed_login_attempts=0, locked_until=null, last_login_at=now() where id=$1', [user.id]);

  const payload = { sub: user.id, role: user.role, login: user.login };
  const accessToken = signAccessToken(payload);
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
  const refreshHash = await bcrypt.hash(refreshToken, 10);

  await query(
    `insert into refresh_sessions (user_id, refresh_token_hash, device, ip_address, expires_at)
     values ($1,$2,$3,$4, now() + interval '30 days')`,
    [user.id, refreshHash, req.headers['user-agent'] || 'unknown', req.ip || null]
  );

  await writeAudit(user.id, 'LOGIN_SUCCESS', 'AUTH', `Login success for ${login}`, req);

  res.json({ accessToken, refreshToken, expiresIn: 900 });
});

app.post('/api/v1/auth/refresh', async (req, res) => {
  const token = req.body?.refreshToken;
  if (!token) return res.status(400).json({ message: 'Missing refreshToken' });

  let payload;
  try {
    payload = jwt.verify(token, REFRESH_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const sessions = await query(
    'select * from refresh_sessions where user_id=$1 and revoked_at is null and expires_at > now() order by id desc',
    [payload.sub]
  );

  let matched = null;
  for (const s of sessions.rows) {
    if (await bcrypt.compare(token, s.refresh_token_hash)) {
      matched = s;
      break;
    }
  }

  if (!matched) return res.status(401).json({ message: 'Refresh session not found' });

  const newPayload = { sub: payload.sub, role: payload.role, login: payload.login };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = jwt.sign(newPayload, REFRESH_SECRET, { expiresIn: '30d' });
  const refreshHash = await bcrypt.hash(refreshToken, 10);

  await query('update refresh_sessions set revoked_at=now() where id=$1', [matched.id]);
  await query(
    `insert into refresh_sessions (user_id, refresh_token_hash, device, ip_address, expires_at)
     values ($1,$2,$3,$4, now() + interval '30 days')`,
    [payload.sub, refreshHash, 'refresh-rotation', null]
  );

  res.json({ accessToken, refreshToken, expiresIn: 900 });
});

app.get('/api/v1/users', authRequired, requireRoles('admin', 'curator'), async (_req, res) => {
  const rs = await query('select id, login, name, email, role, status, class_name from users order by id desc');
  res.json(rs.rows);
});

app.post('/api/v1/registrations', async (req, res) => {
  const schema = z.object({
    lastName: z.string().min(1), firstName: z.string().min(1), middleName: z.string().min(1),
    email: z.string().email(), class: z.string().min(1), login: z.string().min(3), password: z.string().min(6)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const d = parsed.data;
  const hash = await bcrypt.hash(d.password, 10);
  await query(
    `insert into registrations (last_name, first_name, middle_name, email, class_name, login, password_hash, status)
     values ($1,$2,$3,$4,$5,$6,$7,'pending')`,
    [d.lastName, d.firstName, d.middleName, d.email, d.class, d.login, hash]
  );
  res.status(201).json({ ok: true });
});

app.get('/api/v1/achievements', authRequired, async (req, res) => {
  const isStudent = req.user.role === 'student';
  const rs = isStudent
    ? await query('select * from achievements where student_user_id=$1 order by id desc', [req.user.sub])
    : await query('select * from achievements order by id desc');
  res.json(rs.rows);
});

app.post('/api/v1/achievements', authRequired, requireRoles('student'), async (req, res) => {
  const schema = z.object({ title: z.string().min(1), category: z.string().min(1), level: z.string().optional(), result: z.string().optional(), points: z.number().int().min(0), eventDate: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });

  const d = parsed.data;
  await query(
    `insert into achievements (student_user_id, title, category, level, result, points, status, event_date)
     values ($1,$2,$3,$4,$5,$6,'pending',$7)`,
    [req.user.sub, d.title, d.category, d.level ?? null, d.result ?? null, d.points, d.eventDate ?? null]
  );
  await writeAudit(req.user.sub, 'ACHIEVEMENT_CREATE', 'ACHIEVEMENTS', d.title, req);
  res.status(201).json({ ok: true });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`API started on :${port}`));

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
