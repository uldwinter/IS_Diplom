import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPool } from './db.mjs';
import { PostgresRepository } from './repository.mjs';
import { audit, nextId, timestamp } from './domain.mjs';
const login = process.env.ADMIN_LOGIN;
const password = process.env.ADMIN_PASSWORD;
const email = process.env.ADMIN_EMAIL;
if (
  !login ||
  login.trim().length < 3 ||
  !password ||
  password.length < 12 ||
  Buffer.byteLength(password) > 72 ||
  !email?.includes('@')
)
  throw new Error(
    'Set ADMIN_LOGIN, ADMIN_EMAIL and ADMIN_PASSWORD (12–72 bytes) for one-time bootstrap',
  );
const pool = createPool();
try {
  await new PostgresRepository(pool).withState(async (state) => {
    if (state.users.some((u) => u.role === 'admin' && u.status === 'active'))
      throw new Error(
        'An active administrator already exists; bootstrap does not overwrite accounts',
      );
    if (
      state.users.some(
        (u) => u.login.trim().toLowerCase() === login.trim().toLowerCase(),
      )
    )
      throw new Error(
        'ADMIN_LOGIN already exists; choose a new login to preserve the archived account',
      );
    const user = {
      id: nextId(state.users),
      login: login.trim(),
      passwordHash: await bcrypt.hash(password, 12),
      name: process.env.ADMIN_NAME || 'Администратор',
      email,
      role: 'admin',
      status: 'active',
      lastLogin: '',
    };
    state.users.push(user);
    audit(
      state,
      user,
      'Инициализация',
      'Пользователи',
      'Создан первый администратор',
    );
  });
  console.log(
    'Administrator created. Remove ADMIN_PASSWORD from the environment.',
  );
} finally {
  await pool.end();
}
