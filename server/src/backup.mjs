import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  audit,
  currentUser,
  emptyState,
  fail,
  parse,
  documentId,
  isoDate,
  timestamp,
  requireSessionUser,
  nextId,
  normalized,
} from './domain.mjs';
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
export function fileType(buffer) {
  if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return 'image/png';
  if (
    buffer.length >= 3 &&
    buffer[0] === 255 &&
    buffer[1] === 216 &&
    buffer[2] === 255
  )
    return 'image/jpeg';
  fail(400, 'Разрешены только настоящие PDF, JPG и PNG');
}
const id = z.number().int().safe().positive();
const str = (max = 255) => z.string().max(max);
const date = z.string().refine((v) => {
  try {
    isoDate(v);
    return true;
  } catch {
    return false;
  }
}, 'Некорректная дата');
const stamp = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Некорректное время');
const role = z.enum(['admin', 'curator', 'student']);
const status = z.enum(['pending', 'approved', 'rejected']);
const hash = z.string().regex(/^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$/);
const user = z
  .object({
    id,
    login: str(100).min(3),
    name: str(400).min(1),
    email: str(),
    passwordHash: hash,
    role,
    status: z.enum(['active', 'inactive']),
    class: str(20).optional(),
    lastLogin: str(),
    archivedAt: stamp.optional(),
    classHistory: z
      .array(
        z.object({
          class: str(20),
          academicYear: z
            .string()
            .regex(/^\d{4}-\d{4}$/)
            .optional(),
          from: stamp.optional(),
          graduated: z.boolean().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();
const registration = z
  .object({
    id,
    lastName: str(120),
    firstName: str(120),
    middleName: str(120),
    email: str(),
    phone: str(40),
    class: str(20),
    birthDate: z.union([date, z.literal('')]),
    parentEmail: str(),
    parentPhone: str(40),
    login: str(100),
    passwordHash: hash,
    status,
    submittedAt: stamp,
  })
  .passthrough();
const achievement = z
  .object({
    id,
    studentUserId: id,
    studentName: str(400),
    studentClass: str(20),
    achievementName: str().min(1),
    category: str(120),
    level: str(120),
    result: str(),
    expectedPoints: z.number().int().min(0).max(10000),
    status,
    date,
    submittedDate: date,
    documents: z.array(str(1000)).max(10),
    history: z.array(
      z.object({
        id,
        action: z.enum(['created', 'submitted', 'approved', 'rejected']),
        user: str(400),
        userRole: z.enum(['Ученик', 'Куратор']),
        timestamp: stamp,
        comment: str(5000).optional(),
      }),
    ),
    scoringVersion: z.number().int().nonnegative().optional(),
  })
  .passthrough();
const section = z
  .object({
    id: str(100).min(1),
    name: str(),
    category: z.enum(['sport', 'science', 'art', 'social']),
    description: str(5000),
    schedule: str(),
    location: str(),
    teacher: str(),
    capacity: z.number().int().min(1).max(1000),
    archivedAt: stamp.optional(),
  })
  .passthrough();
const sectionApplication = z
  .object({
    id: str(100),
    studentId: id,
    studentName: str(400),
    studentClass: str(20),
    sectionId: str(100),
    status,
    date,
  })
  .passthrough();
const setting = z.object({
  userId: id,
  position: str(120),
  phone: str(40),
  rowsPerPage: z.enum(['10', '20', '25', '50', '100']),
  dateFormat: str(30),
  showTooltips: z.boolean(),
  saveFilters: z.boolean(),
  notifications: z.boolean(),
});
const notification = z.object({
  id,
  userRole: role,
  userId: id.optional(),
  type: z.enum(['success', 'error', 'warning', 'info']),
  title: str(),
  message: str(5000),
  timestamp: stamp,
  read: z.boolean(),
});
const calendar = z.object({
  id,
  title: str(),
  type: z.enum([
    'olympiad',
    'competition',
    'project',
    'volunteer',
    'announcement',
  ]),
  date,
  time: str(20),
  location: str(),
  description: str(5000),
  category: str(120),
  level: str(120),
});
const news = z.object({
  id,
  title: str(),
  content: str(20000),
  date,
  author: str(),
  priority: z.enum(['low', 'normal', 'high']),
  published: z.boolean(),
});
const log = z
  .object({
    id,
    timestamp: stamp,
    user: str(400),
    userRole: role,
    action: str(120),
    entity: str(120),
    details: str(10000),
  })
  .passthrough();
const stateSchema = z.object({
  currentUserId: z.union([id, z.null()]),
  users: z.array(user),
  registrations: z.array(registration),
  achievements: z.array(achievement),
  notifications: z.array(notification),
  auditLogs: z.array(log),
  calendarEvents: z.array(calendar),
  news: z.array(news),
  sections: z.array(section),
  sectionApplications: z.array(sectionApplication),
  sectionMembers: z.array(z.object({ sectionId: str(100), studentId: id })),
  userSettings: z.array(setting),
  scoringRules: z.record(z.record(z.number().int().min(0).max(10000))),
  scoringVersion: z.number().int().positive(),
  classCatalog: z.array(str(20).min(1)),
  lastBackupAt: stamp.optional(),
});
export function validateRestore(payload) {
  if (
    payload?.format !== 'achievement-bank-backup-v1' ||
    !Array.isArray(payload.documents)
  )
    fail(400, 'Неподдерживаемый формат резервной копии');
  const state = parse(stateSchema, payload.state);
  const unique = (rows, key = 'id') =>
    new Set(rows.map((r) => r[key])).size === rows.length;
  for (const rows of [
    state.users,
    state.registrations,
    state.achievements,
    state.sections,
    state.sectionApplications,
    state.notifications,
    state.calendarEvents,
    state.news,
    state.auditLogs,
  ])
    if (!unique(rows)) fail(400, 'В копии повторяются идентификаторы');
  if (
    new Set(state.classCatalog).size !== state.classCatalog.length ||
    !unique(state.userSettings, 'userId')
  )
    fail(400, 'В копии повторяются классы или настройки');
  if (
    !state.users.some(
      (u) => u.role === 'admin' && u.status === 'active' && !u.archivedAt,
    )
  )
    fail(400, 'В копии должен быть активный администратор');
  if (
    new Set(state.users.map((u) => normalized(u.login))).size !==
    state.users.length
  )
    fail(400, 'Повторный логин в копии');
  const users = new Set(state.users.map((u) => u.id));
  const students = new Set(
    state.users.filter((u) => u.role === 'student').map((u) => u.id),
  );
  const sections = new Set(state.sections.map((s) => s.id));
  for (const u of state.users) {
    if (
      u.role === 'student' &&
      u.status === 'active' &&
      !state.classCatalog.includes(u.class)
    )
      fail(400, 'Неизвестный класс ученика');
    for (const h of u.classHistory ?? []) {
      if (h.academicYear) {
        const [a, b] = h.academicYear.split('-').map(Number);
        if (b !== a + 1) fail(400, 'Некорректный учебный год истории');
      }
    }
  }
  for (const a of state.achievements)
    if (!students.has(a.studentUserId))
      fail(400, 'Неизвестный ученик достижения');
  for (const a of state.sectionApplications)
    if (!students.has(a.studentId) || !sections.has(a.sectionId))
      fail(400, 'Некорректная заявка в секцию');
  for (const m of state.sectionMembers)
    if (!students.has(m.studentId) || !sections.has(m.sectionId))
      fail(400, 'Некорректный состав секции');
  if (
    new Set(state.sectionMembers.map((m) => `${m.sectionId}:${m.studentId}`))
      .size !== state.sectionMembers.length
  )
    fail(400, 'Повторный участник секции');
  for (const s of state.userSettings)
    if (!users.has(s.userId)) fail(400, 'Неизвестный пользователь настроек');
  for (const n of state.notifications)
    if (n.userId != null && !users.has(n.userId))
      fail(400, 'Неизвестный получатель уведомления');
  const docs = payload.documents.map((d) => {
    if (!d || typeof d !== 'object') fail(400, 'Некорректный документ в копии');
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        d.id,
      ) ||
      !users.has(d.ownerId) ||
      typeof d.name !== 'string' ||
      !d.name ||
      d.name.length > 255 ||
      /[\x00-\x1f/\\]/.test(d.name) ||
      typeof d.content !== 'string' ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(d.content)
    )
      fail(400, 'Некорректный документ в копии');
    const content = Buffer.from(d.content, 'base64');
    if (
      !content.length ||
      content.length > MAX_DOCUMENT_BYTES ||
      fileType(content) !== d.mime
    )
      fail(400, 'Некорректный файл в копии');
    return {
      id: d.id,
      ownerId: d.ownerId,
      name: d.name,
      mime: d.mime,
      content,
    };
  });
  if (!unique(docs)) fail(400, 'Повторный документ в копии');
  for (const a of state.achievements)
    for (const ref of a.documents)
      if (
        !docs.some(
          (d) => d.id === documentId(ref) && d.ownerId === a.studentUserId,
        )
      )
        fail(400, 'В копии не хватает документов достижений');
  return { state, docs };
}
export async function createBackup(repository, actorId, sessionHash) {
  return repository.withState(async (state, ctx) => {
    const actor = sessionHash
      ? await requireSessionUser(state, ctx, sessionHash)
      : currentUser(state, actorId);
    if (actor.role !== 'admin') fail(403, 'Недостаточно прав');
    state.lastBackupAt = timestamp();
    audit(
      state,
      actor,
      'Экспорт',
      'Резервная копия',
      'Создана полная копия базы и документов',
    );
    return {
      format: 'achievement-bank-backup-v1',
      exportedAt: timestamp(),
      state: structuredClone(state),
      documents: (await ctx.getDocuments()).map((d) => ({
        ...d,
        content: Buffer.from(d.content).toString('base64'),
      })),
    };
  });
}
export async function restoreBackup(repository, payload, actorId, sessionHash) {
  const { state: restored, docs } = validateRestore(payload);
  await repository.withState(async (state, ctx) => {
    const actor = sessionHash
      ? await requireSessionUser(state, ctx, sessionHash)
      : currentUser(state, actorId);
    if (actor.role !== 'admin') fail(403, 'Недостаточно прав');
    const existingAudit = state.auditLogs;
    const oldIds = new Set(
      existingAudit.map(
        (l) => `${l.timestamp}:${l.userId}:${l.action}:${l.details}`,
      ),
    );
    const incoming = restored.auditLogs.filter(
      (l) => !oldIds.has(`${l.timestamp}:${l.userId}:${l.action}:${l.details}`),
    );
    let id = nextId(existingAudit);
    const merged = [
      ...existingAudit,
      ...incoming.map((log) => ({ ...log, id: id++ })),
    ].sort(
      (a, b) =>
        Date.parse(b.timestamp) - Date.parse(a.timestamp) || b.id - a.id,
    );
    for (const key of Object.keys(emptyState()))
      state[key] = structuredClone(restored[key]);
    state.currentUserId = null;
    state.auditLogs = merged;
    state.lastBackupAt = restored.lastBackupAt;
    await ctx.replaceDocuments(docs);
    await ctx.revokeAllSessions();
    audit(
      state,
      actor,
      'Восстановление',
      'Резервная копия',
      'Восстановлены база и документы; все сессии отозваны',
    );
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, path] = process.argv.slice(2);
  if (!['export', 'restore'].includes(mode) || !path)
    throw new Error(
      'Usage: node src/backup.mjs export|restore /path/backup.json; set ADMIN_LOGIN for audit',
    );
  const { createPool } = await import('./db.mjs');
  const { PostgresRepository } = await import('./repository.mjs');
  const pool = createPool();
  const repository = new PostgresRepository(pool);
  try {
    const state = await repository.read();
    const actor = state.users.find(
      (u) =>
        u.login === process.env.ADMIN_LOGIN &&
        u.role === 'admin' &&
        u.status === 'active',
    );
    if (!actor)
      throw new Error(
        'Set ADMIN_LOGIN to an active administrator for audit attribution',
      );
    if (mode === 'export') {
      const file = await fs.open(path, 'wx', 0o600);
      try {
        await file.writeFile(
          JSON.stringify(await createBackup(repository, actor.id)),
        );
      } finally {
        await file.close();
      }
      console.log('Complete database and document backup written');
    } else {
      await restoreBackup(
        repository,
        JSON.parse(await fs.readFile(path, 'utf8')),
        actor.id,
      );
      console.log('Backup restored; all sessions revoked');
    }
  } finally {
    await pool.end();
  }
}
