import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.mjs';
import { emptyState } from '../src/domain.mjs';
import { MemoryRepository } from '../src/repository.mjs';

async function fixture(t) {
  const state = emptyState();
  const hash = await bcrypt.hash('secret-password', 4);
  state.users = [
    ['admin', 'admin'],
    ['curator', 'curator'],
    ['student', 'student'],
    ['other', 'student'],
  ].map(([login, role], i) => ({
    id: i + 1,
    login,
    role,
    name: login,
    email: `${login}@example.test`,
    passwordHash: hash,
    status: 'active',
    class: role === 'student' ? '10-1' : undefined,
    lastLogin: '',
    classHistory:
      role === 'student' ? [{ class: '10-1', academicYear: '2025-2026' }] : [],
  }));
  const repository = new MemoryRepository(state);
  const server = createApp({
    repository,
    production: false,
    rateLimit: false,
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  t.after(() => new Promise((r) => server.close(r)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = async (
    path,
    { cookie, body, method = 'GET', headers = {} } = {},
  ) => {
    const response = await fetch(`${origin}${path}`, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const type = response.headers.get('content-type') || '';
    return {
      status: response.status,
      cookie: response.headers.get('set-cookie')?.split(';')[0],
      data: type.includes('json')
        ? await response.json()
        : Buffer.from(await response.arrayBuffer()),
      headers: response.headers,
    };
  };
  const signin = async (login) => {
    const result = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { login, password: 'secret-password' },
    });
    assert.equal(result.status, 200);
    return result;
  };
  const command = (cookie, name, args) =>
    request('/api/v1/commands', {
      method: 'POST',
      cookie,
      body: { name, args },
    });
  const upload = async (cookie, bytes = Buffer.from('%PDF-1.4\n%%EOF')) => {
    const response = await fetch(`${origin}/api/v1/documents`, {
      method: 'POST',
      headers: {
        cookie,
        'content-type': 'application/pdf',
        'x-file-name': encodeURIComponent('Грамота.pdf'),
      },
      body: bytes,
    });
    return { status: response.status, data: await response.json() };
  };
  return { repository, request, signin, command, upload, origin };
}
const achievement = (documents) => ({
  name: 'Олимпиада по математике',
  category: 'Учебные достижения',
  level: 'Школьный',
  result: 'Призёр',
  date: '2026-01-15',
  points: 999999,
  documents,
});

test('registration saves all contacts centrally and invalid input is rejected', async (t) => {
  const { request, repository } = await fixture(t);
  assert.equal(
    (
      await request('/api/v1/registrations', {
        method: 'POST',
        body: { login: 'x', password: 'x' },
      })
    ).status,
    400,
  );
  const fields = {
    lastName: 'Иванов',
    firstName: 'Петр',
    middleName: '',
    login: 'petr-new',
    password: 'new-password',
    email: 'petr@example.test',
    class: '10-1',
    birthDate: '2010-04-05',
    parentEmail: 'parent@example.test',
    parentPhone: '+79000000000',
    phone: '+79000000001',
  };
  assert.equal(
    (await request('/api/v1/registrations', { method: 'POST', body: fields }))
      .status,
    201,
  );
  const registration = (await repository.read()).registrations[0];
  assert.equal(registration.parentPhone, fields.parentPhone);
  assert.equal(registration.birthDate, fields.birthDate);
  assert.ok(await bcrypt.compare(fields.password, registration.passwordHash));
  assert.equal(
    (await request('/api/v1/registrations', { method: 'POST', body: fields }))
      .status,
    409,
  );
});

test('independent sessions share state without exposing hashes or private contacts', async (t) => {
  const { signin, request, command, repository } = await fixture(t);
  const admin = await signin('admin');
  const student = await signin('student');
  const curator = await signin('curator');
  assert.match(admin.headers.get('set-cookie'), /HttpOnly/);
  assert.match(admin.headers.get('set-cookie'), /SameSite=Strict/);
  assert.equal(JSON.stringify(student.data).includes('passwordHash'), false);
  assert.equal(
    (
      await command(student.cookie, 'addUser', [
        {
          name: 'bad',
          login: 'bad',
          email: 'bad@example.test',
          password: 'password123',
          role: 'admin',
          status: 'active',
        },
      ])
    ).status,
    403,
  );
  const fields = {
    name: 'New student',
    login: 'new-student',
    email: 'new@example.test',
    password: 'password123',
    role: 'student',
    status: 'active',
    class: '10-1',
  };
  assert.equal((await command(admin.cookie, 'addUser', [fields])).status, 200);
  const shared = await request('/api/v1/state', { cookie: curator.cookie });
  assert.ok(shared.data.users.some((u) => u.login === 'new-student'));
  assert.equal(JSON.stringify(shared.data).includes('passwordHash'), false);
  const privacy = await request('/api/v1/state', { cookie: student.cookie });
  assert.equal(
    privacy.data.users.find((u) => u.login === 'new-student'),
    undefined,
  );
  assert.equal(
    privacy.data.users.find((u) => u.name === 'New student').email,
    '',
  );
  assert.equal((await repository.read()).users.length, 5);
});

test('server computes points, enforces document ownership and blocks approved duplicates', async (t) => {
  const { signin, command, upload, request } = await fixture(t);
  const student = await signin('student');
  const other = await signin('other');
  const curator = await signin('curator');
  const file = await upload(student.cookie);
  assert.equal(file.status, 201);
  const ref = file.data.document;
  assert.equal(
    (await upload(student.cookie, Buffer.from('<script>bad</script>'))).status,
    400,
  );
  assert.equal(
    (await command(other.cookie, 'submitAchievement', [4, achievement([ref])]))
      .status,
    400,
  );
  assert.equal(
    (
      await command(student.cookie, 'submitAchievement', [
        4,
        achievement([ref]),
      ])
    ).status,
    403,
  );
  const create = await command(student.cookie, 'submitAchievement', [
    3,
    achievement([ref]),
  ]);
  assert.equal(create.status, 200);
  const record = create.data.state.achievements[0];
  assert.equal(record.expectedPoints, 10);
  assert.equal(record.scoringVersion, 1);
  assert.equal(
    (
      await command(student.cookie, 'processAchievement', [
        record.id,
        'approve',
        '',
        1,
      ])
    ).status,
    403,
  );
  assert.equal(
    (
      await command(curator.cookie, 'processAchievement', [
        record.id,
        'approve',
        'Проверено',
        1,
      ])
    ).status,
    200,
  );
  assert.equal(
    (
      await command(student.cookie, 'submitAchievement', [
        3,
        { ...achievement([ref]), stage: 'Другой этап' },
      ])
    ).status,
    409,
  );
  assert.equal(
    (
      await command(curator.cookie, 'processAchievement', [
        record.id,
        'reject',
        'Повтор',
        1,
      ])
    ).status,
    409,
  );
  const id = ref.split('::')[1];
  assert.equal(
    (await request(`/api/v1/documents/${id}`, { cookie: other.cookie })).status,
    403,
  );
  assert.equal(
    (await request(`/api/v1/documents/${id}`, { cookie: student.cookie }))
      .status,
    200,
  );
  const publicState = await request('/api/v1/state', { cookie: other.cookie });
  assert.deepEqual(publicState.data.achievements[0].documents, []);
});

test('concurrent moderation has one winner and rejected submissions preserve history', async (t) => {
  const { signin, command, upload } = await fixture(t);
  const student = await signin('student');
  const curator = await signin('curator');
  const admin = await signin('admin');
  const file = await upload(student.cookie);
  const create = await command(student.cookie, 'submitAchievement', [
    3,
    achievement([file.data.document]),
  ]);
  const id = create.data.state.achievements[0].id;
  const outcomes = await Promise.all([
    command(curator.cookie, 'processAchievement', [
      id,
      'reject',
      'Добавьте описание',
      1,
    ]),
    command(admin.cookie, 'processAchievement', [
      id,
      'reject',
      'Другое решение',
      1,
    ]),
  ]);
  assert.deepEqual(outcomes.map((r) => r.status).sort(), [200, 409]);
  const resubmit = await command(student.cookie, 'resubmitAchievement', [
    id,
    { ...achievement([file.data.document]), description: 'Исправлено' },
    2,
  ]);
  assert.equal(resubmit.status, 200);
  assert.equal(resubmit.data.state.achievements[0].history.length, 3);
  assert.equal(
    (
      await command(curator.cookie, 'processAchievement', [
        id,
        'approve',
        '',
        1,
      ])
    ).status,
    409,
  );
  assert.equal(
    (await command(curator.cookie, 'processAchievement', [id, 'approve', '']))
      .status,
    400,
  );
  assert.equal(
    (
      await command(curator.cookie, 'processAchievement', [
        id,
        'approve',
        '',
        3,
      ])
    ).status,
    200,
  );
});

test('archiving preserves achievements and immediately revokes existing sessions', async (t) => {
  const { signin, command, upload, request, repository } = await fixture(t);
  const student = await signin('student');
  const admin = await signin('admin');
  const file = await upload(student.cookie);
  await command(student.cookie, 'submitAchievement', [
    3,
    achievement([file.data.document]),
  ]);
  assert.equal((await command(admin.cookie, 'deleteUser', [3])).status, 200);
  assert.equal((await repository.read()).achievements.length, 1);
  assert.equal(
    (await request('/api/v1/state', { cookie: student.cookie })).status,
    401,
  );
  assert.equal(
    (
      await request('/api/v1/auth/login', {
        method: 'POST',
        body: { login: 'student', password: 'secret-password' },
      })
    ).status,
    401,
  );
  assert.equal((await command(admin.cookie, 'deleteUser', [1])).status, 409);
});

test('full backup restores records and document bytes, retaining audit and revoking sessions', async (t) => {
  const { signin, command, upload, request, repository } = await fixture(t);
  const admin = await signin('admin');
  const student = await signin('student');
  const file = await upload(student.cookie);
  await command(student.cookie, 'submitAchievement', [
    3,
    achievement([file.data.document]),
  ]);
  const backup = await request('/api/v1/backup', { cookie: admin.cookie });
  assert.equal(backup.status, 200);
  assert.equal(backup.data.documents.length, 1);
  assert.equal(
    backup.data.documents[0].content,
    Buffer.from('%PDF-1.4\n%%EOF').toString('base64'),
  );
  const broken = structuredClone(backup.data);
  broken.state.sections = [null];
  assert.equal(
    (
      await request('/api/v1/restore', {
        method: 'POST',
        cookie: student.cookie,
        body: broken,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request('/api/v1/restore', {
        method: 'POST',
        cookie: admin.cookie,
        body: broken,
      })
    ).status,
    400,
  );
  assert.equal(
    (await request('/api/v1/state', { cookie: student.cookie })).status,
    200,
  );
  await command(admin.cookie, 'addClassToCatalog', ['12-1']);
  const auditCount = (await repository.read()).auditLogs.length;
  assert.equal(
    (
      await request('/api/v1/restore', {
        method: 'POST',
        cookie: admin.cookie,
        body: backup.data,
      })
    ).status,
    200,
  );
  assert.ok((await repository.read()).auditLogs.length > auditCount);
  assert.equal((await repository.read()).classCatalog.includes('12-1'), false);
  assert.equal(
    (await request('/api/v1/state', { cookie: admin.cookie })).status,
    401,
  );
  const relogin = await signin('student');
  const id = file.data.document.split('::')[1];
  const restored = await request(`/api/v1/documents/${id}`, {
    cookie: relogin.cookie,
  });
  assert.equal(restored.data.toString(), '%PDF-1.4\n%%EOF');
});

test('cross-origin writes fail and class catalogue survives fresh sessions', async (t) => {
  const { signin, command, request } = await fixture(t);
  const admin = await signin('admin');
  assert.equal(
    (await command(admin.cookie, 'addClassToCatalog', ['12-1'])).status,
    200,
  );
  assert.ok(
    (await request('/api/v1/bootstrap')).data.classCatalog.includes('12-1'),
  );
  const denied = await request('/api/v1/commands', {
    method: 'POST',
    cookie: admin.cookie,
    headers: { origin: 'https://untrusted.example' },
    body: { name: 'addClassToCatalog', args: ['12-2'] },
  });
  assert.equal(denied.status, 403);
});

test('bulk import validates every row before committing; promotions preserve class history', async (t) => {
  const { signin, command, repository } = await fixture(t);
  const admin = await signin('admin');
  const row = {
    name: 'Import',
    email: 'import@example.test',
    login: 'imported',
    password: 'password123',
    class: '10-1',
  };
  assert.equal(
    (await command(admin.cookie, 'bulkImportStudents', [[row, row]])).status,
    409,
  );
  assert.equal((await repository.read()).users.length, 4);
  assert.equal(
    (await command(admin.cookie, 'bulkImportStudents', [[row]])).status,
    200,
  );
  assert.equal(
    (
      await command(admin.cookie, 'promoteStudents', [
        { '10-1': '11-1' },
        '2027-2028',
      ])
    ).status,
    200,
  );
  const user = (await repository.read()).users.find(
    (u) => u.login === 'imported',
  );
  assert.equal(user.class, '11-1');
  assert.ok(user.classHistory.length >= 2);
});
