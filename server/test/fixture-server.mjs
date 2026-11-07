import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.mjs';
import { migrate } from '../src/migrate.mjs';
import { PostgresRepository } from '../src/repository.mjs';
import { createTestPool } from './pglite-pool.mjs';

const pool = await createTestPool();
await migrate(pool, { production: false });
const repository = new PostgresRepository(pool);
await repository.withState(async (state) => {
  const passwordHash = await bcrypt.hash('fixture-password-2026', 4);
  state.users.push(
    {
      id: 1,
      login: 'admin',
      name: 'Тестовый администратор',
      role: 'admin',
      status: 'active',
      email: 'admin@example.test',
      passwordHash,
      lastLogin: '',
    },
    {
      id: 2,
      login: 'curator',
      name: 'Тестовый куратор',
      role: 'curator',
      status: 'active',
      email: 'curator@example.test',
      passwordHash,
      lastLogin: '',
    },
  );
});
const app = createApp({
  repository,
  production: false,
  appOrigin: process.env.FIXTURE_ORIGIN,
  rateLimit: false,
});
const server = app.listen(
  Number(process.env.FIXTURE_PORT || 8080),
  '127.0.0.1',
  () => {
    console.log(
      `Local PostgreSQL fixture listening at http://127.0.0.1:${server.address().port}`,
    );
  },
);
process.on('SIGTERM', () =>
  server.close(() => pool.end().finally(() => process.exit(0))),
);
