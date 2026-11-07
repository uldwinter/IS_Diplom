import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { createPool } from './db.mjs';
import { emptyState, academicYear, audit } from './domain.mjs';

const legacyCategories = {
  Олимпиада: 'Учебные достижения',
  'Научная работа': 'Учебные достижения',
  Проект: 'Проектная деятельность',
  Творчество: 'Внеурочная деятельность',
  Спорт: 'Внеурочная деятельность',
  'Общественная деятельность': 'Внеурочная деятельность',
};
const isoTimestamp = (value) => (value ? new Date(value).toISOString() : '');

async function disableLegacyDemoUsers(state) {
  const legacyDefaults = {
    admin: [/^admin$/i, 'admin123'],
    curator: [/^curator(?:0[1-3])?$/i, 'curator123'],
    student: [/^student(?:0[1-9]|1[0-9]|2[0-4])?$/i, 'student123'],
  };
  for (const user of state.users) {
    const [loginPattern, password] = legacyDefaults[user.role] ?? [];
    if (
      user.status === 'active' &&
      loginPattern?.test(user.login) &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      user.status = 'inactive';
      audit(
        state,
        null,
        'Деактивация',
        'Миграция',
        `Отключён демонстрационный аккаунт #${user.id}`,
      );
    }
  }
}

async function importLegacy(client, production) {
  const state = emptyState();
  state.users = (
    await client.query('select * from users order by id')
  ).rows.map((user) => ({
    id: Number(user.id),
    login: user.login,
    passwordHash: user.password_hash,
    name: user.name,
    email: user.email ?? '',
    role: user.role,
    status: user.status,
    class: user.class_name ?? undefined,
    lastLogin: isoTimestamp(user.last_login_at),
    failedLoginAttempts: user.failed_login_attempts,
    lockedUntil: user.locked_until
      ? isoTimestamp(user.locked_until)
      : undefined,
    classHistory: user.class_name
      ? [
          {
            class: user.class_name,
            academicYear: academicYear(user.created_at),
            from: isoTimestamp(user.created_at),
          },
        ]
      : [],
  }));
  state.registrations = (
    await client.query('select * from registrations order by id')
  ).rows.map((request) => ({
    id: Number(request.id),
    lastName: request.last_name,
    firstName: request.first_name,
    middleName: request.middle_name,
    email: request.email,
    phone: '',
    class: request.class_name,
    birthDate: '',
    parentEmail: '',
    parentPhone: '',
    login: request.login,
    passwordHash: request.password_hash,
    status: request.status,
    comment: request.comment ?? '',
    submittedAt: isoTimestamp(request.created_at),
  }));
  state.classCatalog = [
    ...new Set([
      ...state.classCatalog,
      ...state.users.map((user) => user.class).filter(Boolean),
      ...state.registrations.map((request) => request.class).filter(Boolean),
    ]),
  ];
  const usersById = new Map(state.users.map((user) => [user.id, user]));
  state.achievements = (
    await client.query(
      'select *, event_date::text as event_date_text from achievements order by id',
    )
  ).rows.map((entry) => {
    const student = usersById.get(Number(entry.student_user_id));
    const submittedDate = isoTimestamp(entry.created_at).slice(0, 10);
    const date = entry.event_date_text || submittedDate;
    return {
      id: Number(entry.id),
      studentUserId: Number(entry.student_user_id),
      studentName: student?.name ?? 'Архивный ученик',
      studentClass: student?.class ?? '—',
      achievementName: entry.title,
      category: legacyCategories[entry.category] ?? entry.category,
      level: entry.level ?? '-',
      result: entry.result ?? '-',
      expectedPoints: entry.points,
      status: entry.status,
      date,
      academicYear: academicYear(date),
      submittedDate,
      documents: [],
      comment: entry.moderator_comment ?? '',
      history: [],
      scoringVersion: 0,
      imported: true,
    };
  });
  state.auditLogs = (
    await client.query('select * from audit_logs order by id desc')
  ).rows.map((entry) => {
    const actor = usersById.get(Number(entry.actor_user_id));
    return {
      id: Number(entry.id),
      timestamp: isoTimestamp(entry.created_at),
      userId: Number(entry.actor_user_id) || 0,
      user: actor?.name ?? 'Система',
      userRole: actor?.role ?? 'admin',
      action: entry.action,
      entity: entry.entity,
      details: entry.details ?? '',
      device: entry.device,
      ipAddress: entry.ip_address,
    };
  });
  if (production) await disableLegacyDemoUsers(state);
  return state;
}

export async function migrate(
  pool,
  { production = process.env.NODE_ENV === 'production' } = {},
) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('select pg_advisory_xact_lock(68190314)');
    await client.query(
      'create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())',
    );
    const directory = new URL('../migrations/', import.meta.url);
    const files = (await fs.readdir(directory))
      .filter((name) => name.endsWith('.sql'))
      .sort();
    for (const name of files) {
      const applied = await client.query(
        'select name from schema_migrations where name = $1',
        [name],
      );
      if (applied.rowCount) continue;
      await client.query(await fs.readFile(new URL(name, directory), 'utf8'));
      await client.query('insert into schema_migrations (name) values ($1)', [
        name,
      ]);
    }
    if (
      !(await client.query('select id from application_state where id = 1'))
        .rowCount
    ) {
      const state = await importLegacy(client, production);
      await client.query(
        'insert into application_state (id, data) values (1, $1)',
        [JSON.stringify(state)],
      );
    }
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pool = createPool();
  try {
    await migrate(pool);
    console.log('Migrations and legacy import completed');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
