import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const fail = (status, message) => {
  throw new HttpError(status, message);
};
export const DEFAULT_RULES = {
  'Учебные достижения': {
    Международный: 60,
    Всероссийский: 50,
    Региональный: 40,
    Муниципальный: 20,
    Школьный: 10,
  },
  'Проектная деятельность': {
    Международный: 60,
    Всероссийский: 50,
    Региональный: 40,
    Муниципальный: 20,
    Школьный: 40,
  },
  'Внеурочная деятельность': {
    Международный: 60,
    Всероссийский: 50,
    Региональный: 30,
    Муниципальный: 25,
    Школьный: 20,
    '-': 25,
  },
};
export function emptyState() {
  return {
    currentUserId: null,
    users: [],
    registrations: [],
    achievements: [],
    notifications: [],
    auditLogs: [],
    calendarEvents: [],
    news: [],
    sections: [],
    sectionApplications: [],
    sectionMembers: [],
    userSettings: [],
    scoringRules: structuredClone(DEFAULT_RULES),
    scoringVersion: 1,
    classCatalog: Array.from({ length: 7 }, (_, i) =>
      [1, 2, 3].map((n) => `${i + 5}-${n}`),
    ).flat(),
  };
}
export const timestamp = () => new Date().toISOString();
export function academicYear(value = new Date()) {
  const d = new Date(value);
  const start = d.getUTCFullYear() - (d.getUTCMonth() < 8 ? 1 : 0);
  return `${start}-${start + 1}`;
}
export const nextId = (rows) =>
  rows.reduce((n, row) => Math.max(n, Number(row.id) || 0), 0) + 1;
const text = (max = 255) => z.string().trim().min(1).max(max);
const optionalText = (max = 2000) =>
  z.string().trim().max(max).optional().default('');
const password = z
  .string()
  .min(8)
  .max(72)
  .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'Пароль слишком длинный');
const login = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .regex(/^[\p{L}\p{N}_.@-]+$/u);
const email = z.string().trim().email().max(255);
const role = z.enum(['admin', 'curator', 'student']);
export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success)
    fail(
      400,
      `Проверьте заполнение данных: ${result.error.issues
        .map((i) => i.path.join('.'))
        .filter(Boolean)
        .join(', ')}`,
    );
  return result.data;
}
export function isoDate(value) {
  if (typeof value !== 'string') fail(400, 'Укажите корректную дату');
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  const normalized = match ? `${match[3]}-${match[2]}-${match[1]}` : value;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(normalized) ||
    Number.isNaN(Date.parse(normalized)) ||
    new Date(normalized).toISOString().slice(0, 10) !== normalized
  )
    fail(400, 'Укажите корректную дату');
  return normalized;
}
export const normalized = (v) =>
  String(v ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('ru')
    .replace(/\s+/g, ' ');
export const publicUser = ({
  passwordHash,
  password,
  failedLoginAttempts,
  lockedUntil,
  ...u
}) => u;
export function currentUser(state, id) {
  const u = state.users.find(
    (u) => u.id === id && u.status === 'active' && !u.archivedAt,
  );
  if (!u) fail(401, 'Сессия завершена. Войдите снова');
  return u;
}
export async function requireSessionUser(state, context, sessionHash) {
  const session = await context.getSession(sessionHash);
  if (!session) fail(401, 'Сессия завершена. Войдите снова');
  return currentUser(state, session.userId);
}
const allow = (actor, ...roles) => {
  if (!actor || !roles.includes(actor.role)) fail(403, 'Недостаточно прав');
};
export function audit(
  state,
  actor,
  action,
  entity,
  details,
  before = null,
  after = null,
) {
  state.auditLogs.unshift({
    id: nextId(state.auditLogs),
    timestamp: timestamp(),
    userId: actor?.id ?? 0,
    user: actor?.name ?? 'Система',
    userRole: actor?.role ?? 'admin',
    action,
    entity,
    details,
    before,
    after,
  });
}
function notify(state, userRole, title, message, userId, type = 'info') {
  const recipients =
    userId == null
      ? state.users
          .filter(
            (user) =>
              user.role === userRole &&
              user.status === 'active' &&
              !user.archivedAt,
          )
          .map((user) => user.id)
      : [userId];
  let id = nextId(state.notifications);
  for (const recipient of recipients) {
    state.notifications.unshift({
      id: id++,
      timestamp: timestamp(),
      read: false,
      userRole,
      userId: recipient,
      title,
      message,
      type,
    });
  }
}
const myNotification = (n, u) =>
  n.userRole === u.role && (n.userId == null || n.userId === u.id);
export function snapshot(state, actor) {
  const result = structuredClone(state);
  result.currentUserId = actor.id;
  result.users = result.users.map((u) =>
    actor.role === 'student' && u.id !== actor.id
      ? {
          id: u.id,
          name: u.name,
          role: u.role,
          class: u.class,
          status: u.status,
          lastLogin: '',
          login: '',
          email: '',
          classHistory: u.classHistory,
        }
      : publicUser(u),
  );
  result.registrations =
    actor.role === 'student'
      ? []
      : result.registrations.map(({ passwordHash, password, ...r }) => r);
  result.achievements = result.achievements
    .filter(
      (a) =>
        actor.role !== 'student' ||
        a.studentUserId === actor.id ||
        a.status === 'approved',
    )
    .map((a) =>
      actor.role === 'student' && a.studentUserId !== actor.id
        ? {
            ...a,
            documents: [],
            history: [],
            description: undefined,
            comment: undefined,
          }
        : a,
    );
  result.auditLogs = actor.role === 'admin' ? result.auditLogs : [];
  result.notifications = result.notifications.filter((n) =>
    myNotification(n, actor),
  );
  result.userSettings = result.userSettings.filter(
    (s) => s.userId === actor.id,
  );
  result.sections = result.sections.filter((section) => !section.archivedAt);
  if (actor.role === 'student') {
    result.news = result.news.filter((n) => n.published);
    result.sectionApplications = result.sectionApplications.filter(
      (a) => a.studentId === actor.id,
    );
  }
  return result;
}

export const registrationSchema = z.object({
  lastName: text(120),
  firstName: text(120),
  middleName: optionalText(120),
  email,
  phone: optionalText(40),
  class: text(20),
  birthDate: text(10),
  parentEmail: email,
  parentPhone: text(40),
  login,
  password,
});
export async function register(state, payload) {
  const data = parse(registrationSchema, payload);
  data.birthDate = isoDate(data.birthDate);
  if (data.birthDate >= new Date().toISOString().slice(0, 10))
    fail(400, 'Проверьте дату рождения');
  if (!state.classCatalog.includes(data.class))
    fail(400, 'Выберите существующий класс');
  if (
    state.users.some((u) => normalized(u.login) === normalized(data.login)) ||
    state.registrations.some(
      (r) =>
        r.status === 'pending' &&
        normalized(r.login) === normalized(data.login),
    )
  )
    fail(409, 'Логин уже занят или ожидает проверки');
  const { password: plain, ...fields } = data;
  const entry = {
    ...fields,
    id: nextId(state.registrations),
    passwordHash: await bcrypt.hash(plain, 12),
    status: 'pending',
    submittedAt: timestamp(),
  };
  state.registrations.unshift(entry);
  notify(
    state,
    'curator',
    'Новая регистрация',
    `${entry.lastName} ${entry.firstName}`,
  );
  audit(state, null, 'Создание', 'Регистрация', `Заявка #${entry.id}`);
  return { id: entry.id };
}
const userSchema = z.object({
  name: text(),
  email,
  login,
  password,
  role,
  status: z.enum(['active', 'inactive']),
  class: optionalText(20),
});
const achievementSchema = z.object({
  name: text(),
  category: text(120),
  level: text(120),
  result: text(),
  date: text(10),
  description: optionalText(5000),
  documents: z.array(text(1000)).min(1).max(10),
  eventId: optionalText(120),
  stage: optionalText(120),
});
export const documentId = (raw) =>
  typeof raw === 'string' &&
  raw.match(
    /^document::([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})::/i,
  )?.[1];
export const documentReference = (id, name) =>
  `document::${id}::${encodeURIComponent(name)}`;
function checkRevision(record, expected) {
  if (!Number.isSafeInteger(expected) || expected < 0)
    fail(400, 'Нужна версия заявки');
  if ((record.history.at(-1)?.id ?? 0) !== expected)
    fail(409, 'Заявка изменилась. Откройте её снова');
}
async function achievementData(state, student, payload, ctx, excludedId) {
  const d = parse(achievementSchema, payload);
  d.date = isoDate(d.date);
  if (d.date > new Date().toISOString().slice(0, 10))
    fail(400, 'Дата достижения не может быть в будущем');
  const points = state.scoringRules[d.category]?.[d.level];
  if (!Number.isInteger(points) || points < 0)
    fail(400, 'Для категории и уровня не настроены баллы');
  if (
    state.achievements.some(
      (a) =>
        a.id !== excludedId &&
        a.studentUserId === student.id &&
        ['pending', 'approved'].includes(a.status) &&
        isoDate(a.date) === d.date &&
        normalized(a.achievementName) === normalized(d.name),
    )
  )
    fail(409, 'Это достижение уже отправлено или подтверждено');
  const documents = [];
  const seenDocuments = new Set();
  for (const ref of d.documents) {
    const id = documentId(ref);
    const file = id ? await ctx.getDocument(id) : null;
    if (!file || file.ownerId !== student.id || seenDocuments.has(id))
      fail(400, 'Прикрепите отдельные загруженные подтверждающие документы');
    seenDocuments.add(id);
    documents.push(documentReference(id, file.name));
  }
  const eventYear = academicYear(d.date);
  const matches = (student.classHistory ?? []).filter(
    (h) =>
      !h.graduated && (h.academicYear || academicYear(h.from)) === eventYear,
  );
  const membership =
    matches.filter((h) => !h.from || h.from.slice(0, 10) <= d.date).at(-1) ??
    matches[0];
  const studentClass =
    membership?.class || (eventYear === academicYear() ? student.class : null);
  if (!studentClass)
    fail(
      400,
      'Для этого учебного года не указан класс ученика. Обратитесь к администратору',
    );
  return {
    achievementName: d.name,
    category: d.category,
    level: d.level,
    result: d.result,
    date: d.date,
    description: d.description,
    documents,
    eventId: d.eventId,
    stage: d.stage,
    expectedPoints: points,
    scoringVersion: state.scoringVersion,
    studentClass,
    academicYear: eventYear,
  };
}
function settingsDefault(userId) {
  return {
    userId,
    position: '',
    phone: '',
    rowsPerPage: '10',
    dateFormat: 'dd.mm.yyyy',
    showTooltips: true,
    saveFilters: true,
    notifications: true,
  };
}
export async function executeCommand(state, actor, name, args, ctx) {
  if (!Array.isArray(args)) fail(400, 'Некорректные аргументы операции');
  const [id, value, extra, version] = args;
  let before = null;
  let after = null;
  switch (name) {
    case 'processRegistration': {
      allow(actor, 'admin', 'curator');
      const entry = state.registrations.find((r) => r.id === id);
      if (!entry) fail(404, 'Заявка не найдена');
      if (entry.status !== 'pending') fail(409, 'Заявка уже обработана');
      if (!['approve', 'reject'].includes(value))
        fail(400, 'Неизвестное решение');
      const comment = parse(optionalText(5000), extra);
      if (value === 'reject' && !comment)
        fail(400, 'Укажите причину отклонения');
      before = { id, status: entry.status };
      if (value === 'approve') {
        if (
          state.users.some(
            (u) => normalized(u.login) === normalized(entry.login),
          )
        )
          fail(409, 'Логин уже занят');
        const user = {
          id: nextId(state.users),
          login: entry.login,
          passwordHash: entry.passwordHash,
          name: `${entry.lastName} ${entry.firstName} ${entry.middleName}`.trim(),
          email: entry.email,
          role: 'student',
          class: entry.class,
          status: 'active',
          lastLogin: '',
          birthDate: entry.birthDate,
          parentEmail: entry.parentEmail,
          parentPhone: entry.parentPhone,
          classHistory: [
            {
              class: entry.class,
              academicYear: academicYear(),
              from: timestamp(),
            },
          ],
        };
        state.users.push(user);
        state.userSettings.push({
          ...settingsDefault(user.id),
          phone: entry.phone,
        });
        notify(state, 'admin', 'Новый ученик', user.name);
      }
      entry.status = value === 'approve' ? 'approved' : 'rejected';
      entry.comment = comment;
      after = { id, status: entry.status };
      break;
    }
    case 'addUser': {
      allow(actor, 'admin');
      const d = parse(userSchema, id);
      if (state.users.some((u) => normalized(u.login) === normalized(d.login)))
        fail(409, 'Логин уже занят');
      if (d.role === 'student' && !state.classCatalog.includes(d.class))
        fail(400, 'Выберите существующий класс');
      const { password: plain, ...fields } = d;
      after = {
        ...fields,
        id: nextId(state.users),
        passwordHash: await bcrypt.hash(plain, 12),
        lastLogin: '',
        classHistory: d.class
          ? [
              {
                class: d.class,
                academicYear: academicYear(),
                from: timestamp(),
              },
            ]
          : [],
      };
      state.users.push(after);
      after = publicUser(after);
      break;
    }
    case 'updateUser':
    case 'deleteUser': {
      allow(actor, 'admin');
      const u = state.users.find((u) => u.id === id);
      if (!u) fail(404, 'Пользователь не найден');
      const d =
        name === 'deleteUser'
          ? { status: 'inactive', archivedAt: timestamp() }
          : parse(
              userSchema
                .omit({ password: true })
                .partial()
                .extend({ password: password.optional() }),
              value,
            );
      if (
        id === actor.id &&
        (d.status === 'inactive' || (d.role && d.role !== 'admin'))
      )
        fail(409, 'Нельзя отключить собственный доступ администратора');
      if (
        u.role === 'admin' &&
        u.status === 'active' &&
        (d.status === 'inactive' || (d.role && d.role !== 'admin')) &&
        state.users.filter((x) => x.role === 'admin' && x.status === 'active')
          .length <= 1
      )
        fail(409, 'В системе должен остаться активный администратор');
      if (
        d.login &&
        state.users.some(
          (x) => x.id !== id && normalized(x.login) === normalized(d.login),
        )
      )
        fail(409, 'Логин уже занят');
      const candidate = { ...u, ...d };
      if (
        candidate.role === 'student' &&
        candidate.status === 'active' &&
        !state.classCatalog.includes(candidate.class)
      )
        fail(400, 'Выберите существующий класс');
      if (
        d.role &&
        d.role !== u.role &&
        u.role === 'student' &&
        (state.achievements.some((a) => a.studentUserId === u.id) ||
          state.sectionMembers.some((m) => m.studentId === u.id) ||
          state.sectionApplications.some((a) => a.studentId === u.id))
      )
        fail(
          409,
          'Для ученика с историей достижений сохраните роль и используйте архивирование',
        );
      before = publicUser(structuredClone(u));
      const { password: plain, ...fields } = d;
      Object.assign(u, fields);
      if (d.status === 'active') delete u.archivedAt;
      if (plain) u.passwordHash = await bcrypt.hash(plain, 12);
      if (d.class && before.class !== d.class)
        (u.classHistory ??= []).push({
          class: d.class,
          academicYear: academicYear(),
          from: timestamp(),
        });
      if (
        d.status === 'inactive' ||
        (d.role && d.role !== before.role) ||
        plain
      )
        await ctx.revokeUserSessions(u.id);
      after = publicUser(u);
      break;
    }
    case 'submitAchievement': {
      allow(actor, 'student');
      if (id !== actor.id) fail(403, 'Можно подавать только свои достижения');
      const d = await achievementData(state, actor, value, ctx);
      after = {
        ...d,
        id: nextId(state.achievements),
        studentUserId: actor.id,
        studentName: actor.name,
        status: 'pending',
        submittedDate: timestamp().slice(0, 10),
        history: [
          {
            id: 1,
            action: 'submitted',
            user: actor.name,
            userRole: 'Ученик',
            timestamp: timestamp(),
          },
        ],
      };
      state.achievements.unshift(after);
      notify(
        state,
        'curator',
        'Новая заявка',
        `${actor.name}: ${d.achievementName}`,
      );
      break;
    }
    case 'resubmitAchievement': {
      allow(actor, 'student');
      const a = state.achievements.find((a) => a.id === id);
      if (!a) fail(404, 'Достижение не найдено');
      if (a.studentUserId !== actor.id) fail(403, 'Недостаточно прав');
      if (a.status !== 'rejected')
        fail(409, 'Изменять можно только возвращённую заявку');
      checkRevision(a, extra);
      before = structuredClone(a);
      Object.assign(a, await achievementData(state, actor, value, ctx, id), {
        status: 'pending',
        submittedDate: timestamp().slice(0, 10),
        comment: '',
      });
      a.history.push({
        id: nextId(a.history),
        action: 'submitted',
        user: actor.name,
        userRole: 'Ученик',
        timestamp: timestamp(),
        comment: 'Исправлено и отправлено повторно',
      });
      after = a;
      notify(state, 'curator', 'Повторная заявка', a.achievementName);
      break;
    }
    case 'processAchievement':
    case 'revokeAchievement': {
      allow(actor, 'admin', 'curator');
      const a = state.achievements.find((a) => a.id === id);
      if (!a) fail(404, 'Достижение не найдено');
      const revoke = name === 'revokeAchievement';
      if (a.status !== (revoke ? 'approved' : 'pending'))
        fail(409, 'Статус заявки уже изменился');
      checkRevision(a, revoke ? extra : version);
      const action = revoke ? 'reject' : value;
      const comment = parse(optionalText(5000), revoke ? value : extra);
      if (!['approve', 'reject'].includes(action))
        fail(400, 'Неизвестное решение');
      if (action === 'reject' && !comment) fail(400, 'Укажите причину');
      if (action === 'approve') {
        for (const ref of a.documents) {
          if (!documentId(ref) || !(await ctx.getDocument(documentId(ref))))
            fail(400, 'Нужен настоящий подтверждающий документ');
        }
        if (!a.documents.length) fail(400, 'Нужен подтверждающий документ');
      }
      before = structuredClone(a);
      a.status = action === 'approve' ? 'approved' : 'rejected';
      a.comment = comment;
      a.reviewedBy = actor.id;
      a.reviewedAt = timestamp();
      a.history.push({
        id: nextId(a.history),
        action: action === 'approve' ? 'approved' : 'rejected',
        user: actor.name,
        userRole: 'Куратор',
        timestamp: timestamp(),
        comment,
      });
      after = a;
      notify(
        state,
        'student',
        action === 'approve' ? 'Заявка одобрена' : 'Заявка возвращена',
        a.achievementName,
        a.studentUserId,
        action === 'approve' ? 'success' : 'warning',
      );
      break;
    }
    case 'addClassToCatalog':
    case 'removeClassFromCatalog': {
      allow(actor, 'admin');
      const cls = parse(text(20), id);
      if (name === 'addClassToCatalog') {
        if (state.classCatalog.includes(cls)) fail(409, 'Класс уже существует');
        state.classCatalog.push(cls);
      } else {
        if (
          state.users.some((u) => u.class === cls && u.status === 'active') ||
          state.registrations.some(
            (r) => r.class === cls && r.status === 'pending',
          )
        )
          fail(409, 'В классе есть ученики или заявки');
        state.classCatalog = state.classCatalog.filter((c) => c !== cls);
      }
      after = { class: cls };
      break;
    }
    case 'setScoringRules': {
      allow(actor, 'admin');
      const d = parse(
        z.record(
          text(120),
          z.record(text(120), z.number().int().min(0).max(10000)),
        ),
        id,
      );
      if (!Object.keys(d).length) fail(400, 'Добавьте правила оценивания');
      before = state.scoringRules;
      state.scoringRules = d;
      state.scoringVersion += 1;
      after = { rules: d, version: state.scoringVersion };
      break;
    }
    case 'markNotificationRead':
    case 'deleteNotification':
    case 'markAllNotificationsRead': {
      const ids = state.notifications
        .filter(
          (n) =>
            myNotification(n, actor) &&
            (name === 'markAllNotificationsRead' || n.id === id),
        )
        .map((n) => n.id);
      if (name === 'deleteNotification')
        state.notifications = state.notifications.filter(
          (n) => !ids.includes(n.id),
        );
      else
        state.notifications.forEach((n) => {
          if (ids.includes(n.id)) n.read = true;
        });
      return {};
    }
    case 'saveUserSettings':
    case 'updateCurrentUserProfile': {
      if (name === 'saveUserSettings' && id !== actor.id)
        fail(403, 'Недостаточно прав');
      const fields =
        name === 'saveUserSettings'
          ? parse(
              z.object({
                position: optionalText(120),
                phone: optionalText(40),
                rowsPerPage: z.enum(['10', '20', '25', '50', '100']),
                dateFormat: text(30),
                showTooltips: z.boolean(),
                saveFilters: z.boolean(),
                notifications: z.boolean(),
              }),
              value,
            )
          : parse(
              z.object({
                name: text(),
                email,
                phone: optionalText(40),
                position: optionalText(120),
              }),
              id,
            );
      let setting = state.userSettings.find((s) => s.userId === actor.id);
      if (!setting) {
        setting = settingsDefault(actor.id);
        state.userSettings.push(setting);
      }
      before = structuredClone(setting);
      Object.assign(setting, fields);
      delete setting.name;
      delete setting.email;
      if (name === 'updateCurrentUserProfile') {
        actor.name = fields.name;
        actor.email = fields.email;
      }
      after = setting;
      break;
    }
    case 'changeCurrentUserPassword': {
      const current = parse(z.string().max(72), id);
      const next = parse(password, value);
      if (!(await bcrypt.compare(current, actor.passwordHash)))
        fail(400, 'Текущий пароль неверен');
      actor.passwordHash = await bcrypt.hash(next, 12);
      await ctx.revokeUserSessions(actor.id);
      after = { passwordChanged: true };
      break;
    }
    case 'addCalendarEvent':
    case 'updateCalendarEvent':
    case 'deleteCalendarEvent': {
      allow(actor, 'admin', 'curator');
      const fields = z.object({
        title: text(),
        type: z.enum([
          'olympiad',
          'competition',
          'project',
          'volunteer',
          'announcement',
        ]),
        date: text(10),
        time: optionalText(20),
        location: optionalText(255),
        description: optionalText(5000),
        category: optionalText(120),
        level: optionalText(120),
      });
      if (name === 'addCalendarEvent') {
        const d = parse(fields, id);
        d.date = isoDate(d.date);
        after = { ...d, id: nextId(state.calendarEvents) };
        state.calendarEvents.push(after);
      } else {
        const e = state.calendarEvents.find((x) => x.id === id);
        if (!e) fail(404, 'Событие не найдено');
        before = structuredClone(e);
        if (name === 'deleteCalendarEvent')
          state.calendarEvents = state.calendarEvents.filter(
            (x) => x.id !== id,
          );
        else {
          const d = parse(fields.partial(), value);
          if (d.date) d.date = isoDate(d.date);
          Object.assign(e, d);
          after = e;
        }
      }
      break;
    }
    case 'addNewsItem':
    case 'updateNewsItem':
    case 'deleteNewsItem': {
      allow(actor, 'admin', 'curator');
      const fields = z.object({
        title: text(),
        content: text(20000),
        priority: z.enum(['low', 'normal', 'high']),
        published: z.boolean(),
        author: optionalText(255),
      });
      if (name === 'addNewsItem') {
        after = {
          ...parse(fields, id),
          id: nextId(state.news),
          author: actor.name,
          date: timestamp().slice(0, 10),
        };
        state.news.unshift(after);
        if (after.published) notify(state, 'student', 'Новость', after.title);
      } else {
        const item = state.news.find((x) => x.id === id);
        if (!item) fail(404, 'Новость не найдена');
        before = structuredClone(item);
        if (name === 'deleteNewsItem')
          state.news = state.news.filter((x) => x.id !== id);
        else {
          Object.assign(item, parse(fields.partial(), value));
          after = item;
        }
      }
      break;
    }
    case 'addSection':
    case 'deleteSection': {
      allow(actor, 'admin', 'curator');
      if (name === 'addSection') {
        after = {
          ...parse(
            z.object({
              name: text(),
              category: z.enum(['sport', 'science', 'art', 'social']),
              description: text(5000),
              schedule: text(),
              location: text(),
              teacher: text(),
              capacity: z.number().int().min(1).max(1000),
            }),
            id,
          ),
          id: randomUUID(),
        };
        state.sections.push(after);
      } else {
        const item = state.sections.find((s) => s.id === id);
        if (!item) fail(404, 'Секция не найдена');
        before = structuredClone(item);
        item.archivedAt = timestamp();
        state.sectionApplications
          .filter((a) => a.sectionId === id && a.status === 'pending')
          .forEach((a) => (a.status = 'rejected'));
        after = item;
      }
      break;
    }
    case 'addSectionApplication': {
      allow(actor, 'student');
      const d = parse(
        z.object({
          sectionId: text(100),
          studentId: z.number().int(),
          studentName: optionalText(255),
          studentClass: optionalText(20),
        }),
        id,
      );
      if (d.studentId !== actor.id) fail(403, 'Недостаточно прав');
      const section = state.sections.find(
        (s) => s.id === d.sectionId && !s.archivedAt,
      );
      if (!section) fail(404, 'Секция не найдена');
      if (
        state.sectionMembers.filter((m) => m.sectionId === section.id).length >=
        section.capacity
      )
        fail(409, 'Нет свободных мест');
      if (
        state.sectionApplications.some(
          (a) =>
            a.studentId === actor.id &&
            a.sectionId === section.id &&
            a.status === 'pending',
        ) ||
        state.sectionMembers.some(
          (m) => m.studentId === actor.id && m.sectionId === section.id,
        )
      )
        fail(409, 'Заявка уже подана или вы уже участник');
      after = {
        id: randomUUID(),
        studentId: actor.id,
        studentName: actor.name,
        studentClass: actor.class,
        sectionId: section.id,
        status: 'pending',
        date: timestamp().slice(0, 10),
      };
      state.sectionApplications.push(after);
      notify(
        state,
        'curator',
        'Запись в секцию',
        `${actor.name}: ${section.name}`,
      );
      break;
    }
    case 'updateSectionApplicationStatus': {
      allow(actor, 'admin', 'curator');
      if (!['approved', 'rejected'].includes(value))
        fail(400, 'Некорректное решение');
      const a = state.sectionApplications.find((a) => a.id === id);
      if (!a) fail(404, 'Заявка не найдена');
      if (a.status !== 'pending') fail(409, 'Заявка уже обработана');
      const section = state.sections.find(
        (s) => s.id === a.sectionId && !s.archivedAt,
      );
      if (!section) fail(409, 'Секция недоступна');
      if (
        value === 'approved' &&
        state.sectionMembers.filter((m) => m.sectionId === section.id).length >=
          section.capacity
      )
        fail(409, 'Лимит участников исчерпан');
      before = structuredClone(a);
      a.status = value;
      if (
        value === 'approved' &&
        !state.sectionMembers.some(
          (m) => m.studentId === a.studentId && m.sectionId === a.sectionId,
        )
      )
        state.sectionMembers.push({
          studentId: a.studentId,
          sectionId: a.sectionId,
        });
      after = a;
      notify(state, 'student', 'Решение по секции', section.name, a.studentId);
      break;
    }
    case 'bulkImportStudents': {
      allow(actor, 'admin');
      const rows = parse(
        z
          .array(userSchema.omit({ role: true, status: true }))
          .min(1)
          .max(100),
        id,
      );
      const seen = new Set(state.users.map((u) => normalized(u.login)));
      for (const row of rows) {
        if (seen.has(normalized(row.login)))
          fail(409, `Повторный логин: ${row.login}`);
        if (!state.classCatalog.includes(row.class))
          fail(400, `Неизвестный класс: ${row.class}`);
        seen.add(normalized(row.login));
      }
      for (const row of rows) {
        const { password: plain, ...fields } = row;
        state.users.push({
          ...fields,
          id: nextId(state.users),
          passwordHash: await bcrypt.hash(plain, 12),
          role: 'student',
          status: 'active',
          lastLogin: '',
          classHistory: [
            {
              class: row.class,
              academicYear: academicYear(),
              from: timestamp(),
            },
          ],
        });
      }
      after = { imported: rows.length };
      break;
    }
    case 'promoteStudents': {
      allow(actor, 'admin');
      const mapping = parse(z.record(text(20), z.string().trim().max(20)), id);
      const year = parse(z.string().regex(/^\d{4}-\d{4}$/), value);
      const [start, end] = year.split('-').map(Number);
      if (end !== start + 1 || start < 2000 || start > 2200)
        fail(400, 'Учебный год должен содержать два последовательных года');
      for (const target of Object.values(mapping)) {
        if (target && !state.classCatalog.includes(target))
          fail(400, `Неизвестный класс: ${target}`);
      }
      const affected = state.users.filter(
        (u) =>
          u.role === 'student' &&
          u.status === 'active' &&
          Object.hasOwn(mapping, u.class),
      );
      if (!affected.length)
        fail(409, 'Нет активных учеников в выбранных классах');
      for (const u of affected) {
        const years = (u.classHistory ?? []).map((h) =>
          Number(
            (h.academicYear || academicYear(h.from || timestamp())).slice(0, 4),
          ),
        );
        if (years.some((y) => y >= start))
          fail(
            409,
            `Ученик ${u.name} уже переведён в этот или более поздний учебный год`,
          );
      }
      before = affected.map(publicUser);
      for (const u of affected) {
        const target = mapping[u.class];
        const history = (u.classHistory ??= []);
        const priorYear = `${start - 1}-${start}`;
        if (
          !history.some(
            (h) => h.academicYear === priorYear && h.class === u.class,
          )
        )
          history.push({
            class: u.class,
            academicYear: priorYear,
            from: timestamp(),
          });
        history.push({
          class: target || u.class,
          academicYear: year,
          from: timestamp(),
          graduated: !target,
        });
        if (target) u.class = target;
        else {
          u.status = 'inactive';
          u.archivedAt = timestamp();
          await ctx.revokeUserSessions(u.id);
        }
      }
      after = { academicYear: year, count: affected.length };
      break;
    }
    default:
      fail(404, 'Неизвестная операция');
  }
  const recordId = after?.id ?? (Number.isSafeInteger(id) ? id : null);
  audit(
    state,
    actor,
    name,
    name,
    recordId == null ? name : `${name} #${recordId}`,
    before,
    after,
  );
  return {};
}
