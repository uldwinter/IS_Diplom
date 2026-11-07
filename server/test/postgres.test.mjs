import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.mjs';
import { createBackup, restoreBackup } from '../src/backup.mjs';
import { migrate } from '../src/migrate.mjs';
import { PostgresRepository } from '../src/repository.mjs';
import { createTestPool } from './pglite-pool.mjs';

async function startApi(t, repository) {
  const server = createApp({
    repository,
    production: false,
    rateLimit: false,
  }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return async (
    path,
    { body, method = 'GET', cookie, headers = {}, raw } = {},
  ) => {
    const response = await fetch(`${origin}${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
    return {
      status: response.status,
      cookie: response.headers.get('set-cookie')?.split(';')[0],
      body: response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : Buffer.from(await response.arrayBuffer()),
    };
  };
}

test('PostgreSQL migration preserves historical data and deactivates matching legacy demo logins once', async (t) => {
  const pool = await createTestPool();
  t.after(() => pool.end());
  await pool.query(
    await fs.readFile(
      new URL('../migrations/001_init.sql', import.meta.url),
      'utf8',
    ),
  );
  const demoHash = await bcrypt.hash('admin123', 4);
  const privateHash = await bcrypt.hash('private-password-123', 4);
  await pool.query(
    `insert into users (login, password_hash, name, email, role, class_name, created_at) values
    ('admin', $1, 'Прежний администратор', 'demo@example.test', 'admin', null, '2025-09-01'),
    ('school-admin', $2, 'Администратор школы', 'admin@example.test', 'admin', null, '2025-09-01'),
    ('pupil', $2, 'Ученик', 'pupil@example.test', 'student', '8-2', '2025-09-01')`,
    [demoHash, privateHash],
  );
  await pool.query(`insert into achievements (student_user_id, title, category, points, status, event_date, created_at)
    values (3, 'Олимпиада', 'Олимпиада', 55, 'approved', '2026-01-15', '2026-01-20')`);
  await pool.query(
    `insert into registrations (last_name, first_name, middle_name, email, class_name, login, password_hash)
    values ('Иванов', 'Пётр', 'Сергеевич', 'legacy@example.test', '4-2', 'legacy-request', $1)`,
    [privateHash],
  );

  await migrate(pool, { production: true });
  const repository = new PostgresRepository(pool);
  const state = await repository.read();
  assert.equal(
    state.users.find((user) => user.login === 'admin').status,
    'inactive',
  );
  assert.equal(
    state.users.find((user) => user.login === 'school-admin').passwordHash,
    privateHash,
  );
  assert.equal(
    state.users.find((user) => user.login === 'school-admin').status,
    'active',
  );
  assert.equal(state.achievements[0].date, '2026-01-15');
  assert.equal(state.achievements[0].academicYear, '2025-2026');
  assert.equal(state.achievements[0].expectedPoints, 55);
  assert.deepEqual(state.achievements[0].documents, []);
  assert.ok(state.classCatalog.includes('4-2'));
  assert.equal(
    (await pool.query("select status from users where login = 'admin'")).rows[0]
      .status,
    'active',
  );

  await migrate(pool, { production: true });
  assert.deepEqual(await repository.read(), state);
  const backup = await createBackup(repository, 2);
  await restoreBackup(repository, backup, 2);
  assert.equal((await repository.read()).achievements[0].expectedPoints, 55);
});

test('separate browser sessions complete registration, submission, moderation and backup using PostgreSQL', async (t) => {
  const pool = await createTestPool();
  t.after(() => pool.end());
  await migrate(pool);
  const repository = new PostgresRepository(pool);
  const staffPassword = 'fixture-password-2026';
  await repository.withState(async (state) => {
    const passwordHash = await bcrypt.hash(staffPassword, 4);
    state.users.push(
      {
        id: 1,
        login: 'admin',
        role: 'admin',
        status: 'active',
        name: 'Администратор',
        email: 'admin@example.test',
        passwordHash,
        lastLogin: '',
      },
      {
        id: 2,
        login: 'curator',
        role: 'curator',
        status: 'active',
        name: 'Куратор',
        email: 'curator@example.test',
        passwordHash,
        lastLogin: '',
      },
    );
  });
  const request = await startApi(t, repository);
  const signIn = async (login, password) => {
    const result = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { login, password },
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result.cookie;
  };
  const command = (cookie, name, args) =>
    request('/api/v1/commands', {
      method: 'POST',
      cookie,
      body: { name, args },
    });
  const curator = await signIn('curator', staffPassword);
  const admin = await signIn('admin', staffPassword);
  const registration = await request('/api/v1/registrations', {
    method: 'POST',
    body: {
      lastName: 'Сидоров',
      firstName: 'Пётр',
      middleName: 'Игоревич',
      login: 'peter',
      password: 'peter-password-123',
      email: 'peter@example.test',
      phone: '+79000000000',
      class: '10-1',
      birthDate: '2010-01-15',
      parentEmail: 'parent@example.test',
      parentPhone: '+79000000001',
    },
  });
  assert.equal(registration.status, 201);
  const queue = await request('/api/v1/state', { cookie: curator });
  assert.equal(queue.body.registrations[0].parentEmail, 'parent@example.test');
  assert.equal(
    (
      await command(curator, 'processRegistration', [
        registration.body.id,
        'approve',
        '',
      ])
    ).status,
    200,
  );
  const student = await signIn('peter', 'peter-password-123');
  const studentId = (await request('/api/v1/auth/me', { cookie: student })).body
    .user.id;
  const file = Buffer.from('%PDF-1.4\nfixture\n%%EOF');
  const upload = await request('/api/v1/documents', {
    method: 'POST',
    cookie: student,
    raw: file,
    headers: {
      'Content-Type': 'application/pdf',
      'X-File-Name': encodeURIComponent('Грамота.pdf'),
    },
  });
  assert.equal(upload.status, 201, JSON.stringify(upload.body));
  const payload = {
    name: 'Олимпиада',
    category: 'Учебные достижения',
    level: 'Школьный',
    result: 'Призёр',
    date: new Date().toISOString().slice(0, 10),
    documents: [upload.body.document],
    points: 9999,
  };
  const submission = await command(student, 'submitAchievement', [
    studentId,
    payload,
  ]);
  assert.equal(submission.status, 200, JSON.stringify(submission.body));
  const submitted = (await request('/api/v1/state', { cookie: curator })).body
    .achievements[0];
  assert.equal(submitted.expectedPoints, 10);
  assert.equal(submitted.status, 'pending');
  const decisions = await Promise.all([
    command(curator, 'processAchievement', [submitted.id, 'approve', '', 1]),
    command(admin, 'processAchievement', [submitted.id, 'approve', '', 1]),
  ]);
  assert.deepEqual(
    decisions.map((decision) => decision.status).sort(),
    [200, 409],
  );
  const saved = (await request('/api/v1/state', { cookie: student })).body
    .achievements[0];
  assert.equal(saved.status, 'approved');
  assert.equal(saved.expectedPoints, 10);
  assert.equal(
    (await command(student, 'submitAchievement', [studentId, payload])).status,
    409,
  );

  const backup = await request('/api/v1/backup', { cookie: admin });
  assert.equal(backup.status, 200);
  assert.equal(backup.body.documents[0].content, file.toString('base64'));
  await assert.rejects(
    repository.withState(async (state, context) => {
      state.achievements.length = 0;
      await context.replaceDocuments([]);
      throw new Error('transaction abort');
    }),
    /transaction abort/,
  );
  assert.equal((await repository.read()).achievements.length, 1);
  const documentId = upload.body.document.split('::')[1];
  assert.deepEqual((await repository.getDocument(documentId)).content, file);
  assert.equal(
    (
      await request('/api/v1/restore', {
        method: 'POST',
        cookie: admin,
        body: backup.body,
      })
    ).status,
    200,
  );
  assert.equal(
    (await request('/api/v1/state', { cookie: student })).status,
    401,
  );
  const restoredSession = await signIn('peter', 'peter-password-123');
  const download = await request(`/api/v1/documents/${documentId}`, {
    cookie: restoredSession,
  });
  assert.equal(download.status, 200);
  assert.deepEqual(download.body, file);
});
