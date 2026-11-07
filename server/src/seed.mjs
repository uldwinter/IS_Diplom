import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPool } from './db.mjs';
import { PostgresRepository } from './repository.mjs';
import { nextId, audit, academicYear } from './domain.mjs';
if (
  process.env.NODE_ENV === 'production' ||
  process.env.ALLOW_DEMO_SEED !== 'true'
)
  throw new Error(
    'Demo seed requires ALLOW_DEMO_SEED=true and a non-production database',
  );
const pool = createPool();
try {
  await new PostgresRepository(pool).withState(async (state) => {
    if (state.users.length)
      throw new Error('Demo seed only runs on an empty database');
    for (const [login, password, role, name] of [
      ['admin', 'admin-demo-123', 'admin', 'Демо администратор'],
      ['curator', 'curator-demo-123', 'curator', 'Демо куратор'],
      ['student', 'student-demo-123', 'student', 'Демо ученик'],
    ])
      state.users.push({
        id: nextId(state.users),
        login,
        passwordHash: await bcrypt.hash(password, 12),
        role,
        name,
        email: `${login}@example.test`,
        class: role === 'student' ? '10-1' : undefined,
        status: 'active',
        lastLogin: '',
        classHistory:
          role === 'student'
            ? [
                {
                  class: '10-1',
                  academicYear: academicYear(),
                  from: new Date().toISOString(),
                },
              ]
            : [],
      });
    audit(
      state,
      null,
      'Инициализация',
      'Демо',
      'Явно созданы демонстрационные пользователи без фиктивных достижений',
    );
  });
  console.log(
    'Demo accounts created. Passwords: <login>-demo-123. Never use this database for real student data.',
  );
} finally {
  await pool.end();
}
