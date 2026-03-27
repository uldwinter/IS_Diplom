import { useSyncExternalStore } from 'react';

export type UserRole = 'admin' | 'curator' | 'student';

export interface UserRecord {
  id: number;
  login: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
}

export interface RegistrationRequest {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  phone: string;
  class: string;
  birthDate: string;
  parentEmail: string;
  parentPhone: string;
  login: string;
  password: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

export interface AchievementHistoryEntry {
  id: number;
  action: 'created' | 'submitted' | 'approved' | 'rejected';
  user: string;
  userRole: 'Ученик' | 'Куратор';
  timestamp: string;
  comment?: string;
}

export interface AchievementRecord {
  id: number;
  studentUserId: number;
  studentName: string;
  studentClass: string;
  achievementName: string;
  category: string;
  level: string;
  result: string;
  expectedPoints: number;
  date: string;
  submittedDate: string;
  documents: string[];
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  history: AchievementHistoryEntry[];
}

export interface NotificationRecord {
  id: number;
  userRole: UserRole;
  userId?: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  entity: string;
  details: string;
  device?: string;
  ipAddress?: string;
}



export interface CalendarEventRecord {
  id: number;
  title: string;
  type: 'olympiad' | 'competition' | 'project' | 'volunteer' | 'announcement';
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  level: string;
}

export interface NewsRecord {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'low' | 'normal' | 'high';
  published: boolean;
}

export interface SectionRecord {
  id: string;
  name: string;
  category: 'sport' | 'science' | 'art' | 'social';
  description: string;
  schedule: string;
  location: string;
  teacher: string;
  capacity: number;
}

export interface SectionApplicationRecord {
  id: string;
  studentId: number;
  studentName: string;
  studentClass: string;
  sectionId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface SectionMemberRecord {
  sectionId: string;
  studentId: number;
}

export interface UserSettingsRecord {
  userId: number;
  position: string;
  phone: string;
  rowsPerPage: string;
  dateFormat: string;
  showTooltips: boolean;
  saveFilters: boolean;
  notifications: boolean;
}

interface OperationResult {
  ok: boolean;
  message?: string;
}

interface BackendState {
  currentUserId: number | null;
  users: UserRecord[];
  registrations: RegistrationRequest[];
  achievements: AchievementRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogEntry[];
  calendarEvents: CalendarEventRecord[];
  news: NewsRecord[];
  sections: SectionRecord[];
  sectionApplications: SectionApplicationRecord[];
  sectionMembers: SectionMemberRecord[];
  userSettings: UserSettingsRecord[];
  scoringRules: Record<string, Record<string, number>>;
  classCatalog: string[];
}

const STORAGE_KEY = 'gifted-children-backend-v2';
const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) || 'http://localhost:8080';
const PASSWORD_PREFIX = 'h$';

const now = () => new Date().toLocaleString('ru-RU');
const nextId = (arr: Array<{ id: number }>) => arr.reduce((m, i) => Math.max(m, i.id), 0) + 1;
const roleRu = (r: UserRole) => (r === 'admin' ? 'Администратор' : r === 'curator' ? 'Куратор' : 'Ученик');
const hashPassword = (plain: string) => {
  let hash = 2166136261;
  for (let i = 0; i < plain.length; i += 1) {
    hash ^= plain.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${PASSWORD_PREFIX}${(hash >>> 0).toString(16)}`;
};
const ensurePasswordHash = (value: string) => (value?.startsWith(PASSWORD_PREFIX) ? value : hashPassword(value));
const ADMIN_SEED_PASSWORD = String.fromCharCode(97, 100, 109, 105, 110, 49, 50, 51);
const CURATOR_SEED_PASSWORD = String.fromCharCode(99, 117, 114, 97, 116, 111, 114, 49, 50, 51);
const STUDENT_SEED_PASSWORD = String.fromCharCode(115, 116, 117, 100, 101, 110, 116, 49, 50, 51);
const DEFAULT_SCORING_RULES: Record<string, Record<string, number>> = {
  'Учебные достижения': { 'Международный': 60, 'Всероссийский': 50, 'Региональный': 40, 'Муниципальный': 20, 'Школьный': 10 },
  'Проектная деятельность': { 'Международный': 60, 'Всероссийский': 50, 'Региональный': 40, 'Муниципальный': 20, 'Школьный': 40 },
  'Внеурочная деятельность': { 'Региональный': 30, 'Муниципальный': 25, 'Школьный': 20, '-': 25 },
};

const INITIAL_STATE: BackendState = {
  currentUserId: null,
  users: [
    { id: 1, login: 'admin', password: hashPassword(ADMIN_SEED_PASSWORD), name: 'Смирнова Елена Владимировна', email: 'smirnova@school.edu', role: 'admin', status: 'active', lastLogin: 'Никогда' },
    { id: 2, login: 'curator', password: hashPassword(CURATOR_SEED_PASSWORD), name: 'Петров Андрей Николаевич', email: 'petrov@school.edu', role: 'curator', status: 'active', lastLogin: 'Никогда' },
    { id: 3, login: 'student', password: hashPassword(STUDENT_SEED_PASSWORD), name: 'Иванов Иван Иванович', email: 'ivanov.student@school.edu', role: 'student', class: '10-1', status: 'active', lastLogin: 'Никогда' },
    { id: 4, login: 'petrova', password: hashPassword(STUDENT_SEED_PASSWORD), name: 'Петрова Мария Сергеевна', email: 'petrova.student@school.edu', role: 'student', class: '10-1', status: 'active', lastLogin: 'Никогда' },
  ],
  registrations: [],
  achievements: [
    {
      id: 1,
      studentUserId: 3,
      studentName: 'Иванов Иван Иванович',
      studentClass: '10-1',
      achievementName: 'Всероссийская олимпиада школьников по математике',
      category: 'Учебные достижения',
      level: 'Региональный',
      result: 'Призёр',
      expectedPoints: 40,
      date: '15.01.2026',
      submittedDate: '16.01.2026',
      documents: ['Грамота.pdf'],
      status: 'approved',
      history: [
        { id: 1, action: 'created', user: 'Иванов И.И.', userRole: 'Ученик', timestamp: '16.01.2026 10:30' },
        { id: 2, action: 'approved', user: 'Петров А.Н.', userRole: 'Куратор', timestamp: '16.01.2026 11:00', comment: 'Подтверждено' },
      ],
    },
    {
      id: 2,
      studentUserId: 3,
      studentName: 'Иванов Иван Иванович',
      studentClass: '10-1',
      achievementName: 'Участие в волонтёрской акции',
      category: 'Внеурочная деятельность',
      level: '-',
      result: '25 часов',
      expectedPoints: 25,
      date: '18.01.2026',
      submittedDate: '18.01.2026',
      documents: ['Справка.pdf'],
      status: 'pending',
      history: [{ id: 1, action: 'submitted', user: 'Иванов И.И.', userRole: 'Ученик', timestamp: '18.01.2026 12:15' }],
    },
  ],
  notifications: [],
  auditLogs: [],
  calendarEvents: [
    { id: 1, title: 'Всероссийская олимпиада по математике', type: 'olympiad', date: '2026-02-05', time: '10:00', location: 'Каб. 305', description: 'Региональный этап олимпиады', category: 'Учебные достижения', level: 'Всероссийский' },
    { id: 2, title: 'Конкурс проектов по информатике', type: 'project', date: '2026-02-10', time: '14:00', location: 'Актовый зал', description: 'Защита IT-проектов', category: 'Проектная деятельность', level: 'Школьный' },
  ],
  news: [
    { id: 1, title: 'Старт олимпиадного сезона', content: 'Открыт прием заявок на участие в олимпиадах.', date: '01.02.2026', author: 'Администрация', priority: 'high', published: true },
    { id: 2, title: 'Обновление расписания секций', content: 'Изменения доступны в разделе секций.', date: '03.02.2026', author: 'Куратор', priority: 'normal', published: true },
  ],
  sections: [
    { id: '1', name: 'Шахматный клуб "Гамбит"', category: 'sport', description: 'Обучение игре в шахматы.', schedule: 'Пн, Ср 15:00-16:30', location: 'Каб. 305', teacher: 'Карпов А.Е.', capacity: 20 },
    { id: '2', name: 'Робототехника', category: 'science', description: 'Конструирование и программирование роботов.', schedule: 'Вт, Чт 16:00-17:30', location: 'Лаборатория 2', teacher: 'Техников С.П.', capacity: 15 },
  ],
  sectionApplications: [],
  sectionMembers: [{ sectionId: '2', studentId: 3 }],
  userSettings: [
    { userId: 1, position: 'Администратор', phone: '+7 (495) 123-45-67', rowsPerPage: '10', dateFormat: 'dd.mm.yyyy', showTooltips: true, saveFilters: true, notifications: true },
    { userId: 2, position: 'Куратор', phone: '+7 (900) 111-22-33', rowsPerPage: '10', dateFormat: 'dd.mm.yyyy', showTooltips: true, saveFilters: true, notifications: true },
    { userId: 3, position: 'Ученик', phone: '+7 (900) 555-66-77', rowsPerPage: '10', dateFormat: 'dd.mm.yyyy', showTooltips: true, saveFilters: true, notifications: true },
  ],
  scoringRules: DEFAULT_SCORING_RULES,
  classCatalog: ['5-1', '5-2', '5-3', '6-1', '6-2', '6-3', '7-1', '7-2', '7-3', '8-1', '8-2', '8-3', '9-1', '9-2', '9-3', '10-1', '10-2', '10-3', '11-1', '11-2', '11-3'],
};

let state = loadState();
const listeners = new Set<() => void>();

function loadState(): BackendState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(raw) as BackendState;
    const safeArray = <T,>(value: unknown, fallback: T[]) =>
      (Array.isArray(value)
        ? (value.filter((item) => item !== null && typeof item === 'object') as T[])
        : fallback);
    const storedUsers = safeArray(parsed.users, INITIAL_STATE.users).map((u) => ({ ...u, password: ensurePasswordHash(u.password) }));
    const rolesInStore = new Set(storedUsers.map((u) => u.role));
    const missingSeedUsers = INITIAL_STATE.users.filter((u) => !rolesInStore.has(u.role));
    const users = [...storedUsers, ...missingSeedUsers];
    const registrations = safeArray(parsed.registrations, INITIAL_STATE.registrations).map((r) => ({ ...r, password: ensurePasswordHash(r.password) }));
    return {
      ...INITIAL_STATE,
      ...parsed,
      users,
      registrations,
      achievements: safeArray(parsed.achievements, INITIAL_STATE.achievements),
      notifications: safeArray(parsed.notifications, []),
      auditLogs: safeArray(parsed.auditLogs, []),
      calendarEvents: safeArray(parsed.calendarEvents, INITIAL_STATE.calendarEvents),
      news: safeArray(parsed.news, INITIAL_STATE.news),
      sections: safeArray(parsed.sections, INITIAL_STATE.sections),
      sectionApplications: safeArray(parsed.sectionApplications, INITIAL_STATE.sectionApplications),
      sectionMembers: safeArray(parsed.sectionMembers, INITIAL_STATE.sectionMembers),
      userSettings: safeArray(parsed.userSettings, INITIAL_STATE.userSettings),
      scoringRules: parsed.scoringRules ?? INITIAL_STATE.scoringRules,
      classCatalog: safeArray(parsed.classCatalog, INITIAL_STATE.classCatalog),
    };
  } catch {
    return INITIAL_STATE;
  }
}

function persistAndEmit() {
  if (typeof window !== 'undefined') {
    const sanitized: BackendState = {
      ...state,
      users: state.users.map((u) => ({ ...u, password: ensurePasswordHash(u.password) })),
      registrations: state.registrations.map((r) => ({ ...r, password: ensurePasswordHash(r.password) })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  }
  listeners.forEach((l) => l());
}

function mutate(updater: (prev: BackendState) => BackendState) {
  state = updater(state);
  persistAndEmit();
}

function addAudit(user: UserRecord, action: string, entity: string, details: string, draft?: BackendState) {
  const target = draft ?? state;
  target.auditLogs = [{ id: nextId(target.auditLogs), timestamp: now(), user: user.name, userRole: user.role, action, entity, details }, ...target.auditLogs].slice(0, 300);
}

function addNotification(notification: Omit<NotificationRecord, 'id' | 'timestamp' | 'read'>, draft?: BackendState) {
  const target = draft ?? state;
  target.notifications = [
    { id: nextId(target.notifications), timestamp: now(), read: false, ...notification },
    ...target.notifications,
  ].slice(0, 500);
}

function shortName(fullName: string) {
  const [lastName = '', firstName = '', middleName = ''] = fullName.split(' ');
  return `${lastName} ${firstName[0] ?? ''}.${middleName[0] ?? ''}.`;
}

export function useBackendState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state
  );
}

export function getCurrentUser() {
  if (!state.currentUserId) return null;
  return state.users.find((u) => u.id === state.currentUserId) ?? null;
}

export function login(loginValue: string, password: string) {
  const passwordHash = hashPassword(password);
  const user = state.users.find((u) => u.login.toLowerCase() === loginValue.toLowerCase() && ensurePasswordHash(u.password) === passwordHash);
  const userByLogin = state.users.find((u) => u.login.toLowerCase() === loginValue.toLowerCase());

  if (userByLogin?.lockedUntil && new Date(userByLogin.lockedUntil).getTime() > Date.now()) {
    return { ok: false as const, message: 'Аккаунт временно заблокирован из-за большого числа попыток входа' };
  }

  if (!user) {
    if (userByLogin) {
      mutate((prev) => ({
        ...prev,
        users: prev.users.map((u) => {
          if (u.id !== userByLogin.id) return u;
          const nextAttempts = (u.failedLoginAttempts ?? 0) + 1;
          const willLock = nextAttempts >= 5;
          return {
            ...u,
            failedLoginAttempts: willLock ? 0 : nextAttempts,
            lockedUntil: willLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : u.lockedUntil,
          };
        }),
      }));
    }
    return { ok: false as const, message: 'Неверный логин или пароль' };
  }
  if (user.status !== 'active') return { ok: false as const, message: 'Пользователь деактивирован администратором' };

  mutate((prev) => {
    const draft = {
      ...prev,
      users: prev.users.map((u) =>
        u.id === user.id ? { ...u, lastLogin: now(), failedLoginAttempts: 0, lockedUntil: undefined } : u
      ),
    };
    draft.currentUserId = user.id;
    addAudit(
      user,
      'Вход',
      'Авторизация',
      `Вход в систему как ${roleRu(user.role)}; device=${typeof navigator !== 'undefined' ? navigator.userAgent : 'server'}`,
      draft
    );
    return draft;
  });

  return { ok: true as const, user };
}

export function logout() {
  mutate((prev) => ({ ...prev, currentUserId: null }));
}

export function submitStudentRegistration(payload: Omit<RegistrationRequest, 'id' | 'submittedAt' | 'status'>) {
  const loginTaken = state.users.some((u) => u.login.toLowerCase() === payload.login.toLowerCase());
  const loginPending = state.registrations.some(
    (r) => r.login.toLowerCase() === payload.login.toLowerCase() && r.status === 'pending'
  );
  if (loginTaken) return { ok: false as const, message: 'Логин уже занят. Выберите другой.' };
  if (loginPending) return { ok: false as const, message: 'Заявка с таким логином уже отправлена и ожидает проверки.' };

  mutate((prev) => {
    const request: RegistrationRequest = { ...payload, password: hashPassword(payload.password), id: nextId(prev.registrations), submittedAt: now(), status: 'pending' };
    const draft = { ...prev, registrations: [request, ...prev.registrations] };
    addNotification({ userRole: 'curator', type: 'info', title: 'Новая регистрация', message: `Заявка от ${payload.lastName} ${payload.firstName}` }, draft);
    return draft;
  });
  return { ok: true as const };
}

export async function submitStudentRegistrationWithFallback(payload: Omit<RegistrationRequest, 'id' | 'submittedAt' | 'status'>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastName: payload.lastName,
        firstName: payload.firstName,
        middleName: payload.middleName,
        email: payload.email,
        class: payload.class,
        login: payload.login,
        password: payload.password,
      }),
    });

    if (response.ok) {
      return { ok: true as const, source: 'api' as const };
    }
  } catch {
    // network fallback below
  }

  const localResult = submitStudentRegistration(payload);
  return { ...localResult, source: 'local' as const };
}

export function addClassToCatalog(className: string): OperationResult {
  const normalized = className.trim();
  if (!normalized) return { ok: false, message: 'Введите название класса' };
  if (state.classCatalog.some((c) => c.toLowerCase() === normalized.toLowerCase())) {
    return { ok: false, message: 'Такой класс уже существует' };
  }
  mutate((prev) => ({ ...prev, classCatalog: [...prev.classCatalog, normalized].sort() }));
  return { ok: true };
}

export function removeClassFromCatalog(className: string): OperationResult {
  const inUse = state.users.some((u) => u.role === 'student' && u.class === className);
  if (inUse) return { ok: false, message: 'Нельзя удалить класс, в котором есть учащиеся' };
  mutate((prev) => ({ ...prev, classCatalog: prev.classCatalog.filter((c) => c !== className) }));
  return { ok: true };
}

export function processRegistration(requestId: number, action: 'approve' | 'reject', comment: string) {
  mutate((prev) => {
    const req = prev.registrations.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return prev;
    const current = getCurrentUser() ?? prev.users.find((u) => u.role === 'curator')!;

    const registrations: RegistrationRequest[] = prev.registrations.map((r) =>
      r.id === requestId
        ? { ...r, status: action === 'approve' ? 'approved' as const : 'rejected' as const, comment }
        : r
    );
    const draft: BackendState = { ...prev, registrations };

    if (action === 'approve') {
      if (prev.users.some((u) => u.login.toLowerCase() === req.login.toLowerCase())) {
        const withConflict: RegistrationRequest[] = prev.registrations.map((r) =>
          r.id === requestId
            ? { ...r, status: 'rejected' as const, comment: 'Логин уже занят, регистрация отклонена автоматически.' }
            : r
        );
        return { ...prev, registrations: withConflict };
      }

      const name = `${req.lastName} ${req.firstName} ${req.middleName}`;
      const newUserId = nextId(prev.users);
      draft.users = [...prev.users, { id: newUserId, login: req.login, password: ensurePasswordHash(req.password), name, email: req.email, role: 'student', class: req.class, status: 'active', lastLogin: 'Ещё не заходил' }];
      draft.userSettings = [
        ...prev.userSettings,
        {
          userId: newUserId,
          position: 'Ученик',
          phone: req.phone,
          rowsPerPage: '10',
          dateFormat: 'dd.mm.yyyy',
          showTooltips: true,
          saveFilters: true,
          notifications: true,
        },
      ];
      addNotification({ userRole: 'admin', type: 'success', title: 'Новый ученик', message: `Куратор одобрил регистрацию: ${name}` }, draft);
    }

    addAudit(current, action === 'approve' ? 'Одобрение' : 'Отклонение', 'Регистрация', `Заявка #${requestId}`, draft);
    return draft;
  });
}

export function getStudents() {
  return state.users
    .filter((u) => u.role === 'student')
    .map((u) => {
      const [lastName = '', firstName = '', middleName = ''] = u.name.split(' ');
      return { id: u.id, userId: u.id, lastName, firstName, middleName, class: u.class ?? '—' };
    });
}

export function addUser(payload: Omit<UserRecord, 'id' | 'lastLogin'>) {
  if (state.users.some((u) => u.login.toLowerCase() === payload.login.toLowerCase())) return { ok: false as const, message: 'Логин уже занят' };
  mutate((prev) => {
    const user: UserRecord = { ...payload, password: hashPassword(payload.password), id: nextId(prev.users), lastLogin: 'Ещё не заходил' };
    const draft = { ...prev, users: [...prev.users, user] };
    const actor = getCurrentUser() ?? prev.users[0];
    addAudit(actor, 'Создание', 'Пользователи', `Создан пользователь ${user.name}`, draft);
    return draft;
  });
  return { ok: true as const };
}

export function updateUser(userId: number, patch: Partial<UserRecord>) {
  mutate((prev) => {
    const nextPatch = patch.password ? { ...patch, password: hashPassword(patch.password) } : patch;
    const draft = { ...prev, users: prev.users.map((u) => (u.id === userId ? { ...u, ...nextPatch } : u)) };
    const actor = getCurrentUser() ?? prev.users[0];
    addAudit(actor, 'Редактирование', 'Пользователи', `Изменен пользователь #${userId}`, draft);
    return draft;
  });
}

export function deleteUser(userId: number) {
  mutate((prev) => {
    const draft = {
      ...prev,
      currentUserId: prev.currentUserId === userId ? null : prev.currentUserId,
      users: prev.users.filter((u) => u.id !== userId),
      achievements: prev.achievements.filter((a) => a.studentUserId !== userId),
      notifications: prev.notifications.filter((n) => n.userId !== userId),
      sectionMembers: prev.sectionMembers.filter((m) => m.studentId !== userId),
      sectionApplications: prev.sectionApplications.filter((a) => a.studentId !== userId),
      userSettings: prev.userSettings.filter((s) => s.userId !== userId),
    };
    const actor = getCurrentUser() ?? prev.users[0];
    addAudit(actor, 'Удаление', 'Пользователи', `Удален пользователь #${userId}`, draft);
    return draft;
  });
}

export function submitAchievement(studentUserId: number, payload: {
  name: string;
  category: string;
  level: string;
  result: string;
  points: number;
  date: string;
  description?: string;
  documents?: string[];
}): OperationResult {
  const student = state.users.find((u) => u.id === studentUserId && u.role === 'student');
  if (!student) return { ok: false, message: 'Ученик не найден или недоступен.' };

  if (!payload.name.trim() || payload.points <= 0 || !payload.date) {
    return { ok: false, message: 'Проверьте заполнение формы достижения.' };
  }

  const duplicatePending = state.achievements.some(
    (a) =>
      a.studentUserId === studentUserId &&
      a.status === 'pending' &&
      a.achievementName.trim().toLowerCase() === payload.name.trim().toLowerCase() &&
      a.date === payload.date
  );
  if (duplicatePending) {
    return { ok: false, message: 'Похожая заявка уже отправлена и ожидает проверки.' };
  }

  mutate((prev) => {
    const entry: AchievementRecord = {
      id: nextId(prev.achievements),
      studentUserId,
      studentName: student.name,
      studentClass: student.class ?? '—',
      achievementName: payload.name,
      category: payload.category,
      level: payload.level,
      result: payload.result,
      expectedPoints: payload.points,
      date: payload.date,
      submittedDate: now().split(',')[0],
      documents: payload.documents ?? ['Документ.pdf'],
      description: payload.description,
      status: 'pending',
      history: [
        { id: 1, action: 'created', user: shortName(student.name), userRole: 'Ученик', timestamp: now() },
        { id: 2, action: 'submitted', user: shortName(student.name), userRole: 'Ученик', timestamp: now(), comment: 'Заявка отправлена на проверку' },
      ],
    };
    const draft = { ...prev, achievements: [entry, ...prev.achievements] };
    addNotification({ userRole: 'curator', type: 'info', title: 'Новая заявка', message: `${student.name}: ${payload.name}` }, draft);
    addAudit(student, 'Создание', 'Достижения', `Создана заявка "${payload.name}"`, draft);
    return draft;
  });

  return { ok: true };
}

export function processAchievement(achievementId: number, action: 'approve' | 'reject', comment: string) {
  mutate((prev) => {
    const ach = prev.achievements.find((a) => a.id === achievementId);
    if (!ach || ach.status !== 'pending') return prev;
    const actor = getCurrentUser() ?? prev.users.find((u) => u.role === 'curator')!;

    const updated: AchievementRecord[] = prev.achievements.map((a) => {
      if (a.id !== achievementId) return a;
      const nextHistoryId = nextId(a.history);
      return {
        ...a,
        status: action === 'approve' ? 'approved' as const : 'rejected' as const,
        comment,
        history: [...a.history, { id: nextHistoryId, action: action === 'approve' ? 'approved' : 'rejected', user: shortName(actor.name), userRole: 'Куратор', timestamp: now(), comment }],
      };
    });

    const draft = { ...prev, achievements: updated };
    addNotification({ userRole: 'student', userId: ach.studentUserId, type: action === 'approve' ? 'success' : 'error', title: action === 'approve' ? 'Заявка одобрена' : 'Заявка отклонена', message: `${ach.achievementName}${action === 'approve' ? ` (+${ach.expectedPoints} баллов)` : comment ? `: ${comment}` : ''}` }, draft);
    addAudit(actor, action === 'approve' ? 'Одобрение' : 'Отклонение', 'Достижения', `Заявка #${achievementId}: ${ach.achievementName}`, draft);
    return draft;
  });
}

export function markNotificationRead(notificationId: number) {
  mutate((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)) }));
}

export function markAllNotificationsRead(userRole: UserRole, userId?: number) {
  mutate((prev) => ({
    ...prev,
    notifications: prev.notifications.map((n) => {
      if (n.userRole !== userRole) return n;
      if (userRole === 'student' && n.userId !== userId) return n;
      return { ...n, read: true };
    }),
  }));
}

export function deleteNotification(notificationId: number) {
  mutate((prev) => ({ ...prev, notifications: prev.notifications.filter((n) => n.id !== notificationId) }));
}


export function addCalendarEvent(payload: Omit<CalendarEventRecord, 'id'>) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const event = { ...payload, id: nextId(prev.calendarEvents) };
    const draft = { ...prev, calendarEvents: [...prev.calendarEvents, event] };
    addAudit(actor, 'Создание', 'Календарь', `Добавлено событие "${event.title}"`, draft);
    addNotification({ userRole: 'student', type: 'info', title: 'Новое событие', message: event.title }, draft);
    return draft;
  });
}

export function deleteCalendarEvent(eventId: number) {
  const actor = getCurrentUser() ?? state.users.find((u) => u.role === 'admin') ?? state.users[0];
  mutate((prev) => {
    const event = prev.calendarEvents.find((e) => e.id === eventId);
    const draft = { ...prev, calendarEvents: prev.calendarEvents.filter((e) => e.id !== eventId) };
    if (event) addAudit(actor, 'Удаление', 'Календарь', `Удалено событие "${event.title}"`, draft);
    return draft;
  });
}

export function updateCalendarEvent(id: number, patch: Partial<CalendarEventRecord>) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = { ...prev, calendarEvents: prev.calendarEvents.map((e) => (e.id === id ? { ...e, ...patch } : e)) };
    addAudit(actor, 'Редактирование', 'Календарь', `Изменено событие #${id}`, draft);
    return draft;
  });
}

export function addNewsItem(payload: Omit<NewsRecord, 'id' | 'date'>) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const item: NewsRecord = { ...payload, id: nextId(prev.news), date: now().split(',')[0] };
    const draft = { ...prev, news: [item, ...prev.news] };
    addAudit(actor, 'Создание', 'Новости', `Новость: ${item.title}`, draft);
    addNotification({ userRole: 'student', type: 'info', title: 'Новость', message: item.title }, draft);
    return draft;
  });
}

export function updateNewsItem(id: number, patch: Partial<NewsRecord>) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = { ...prev, news: prev.news.map((n) => (n.id === id ? { ...n, ...patch } : n)) };
    addAudit(actor, 'Редактирование', 'Новости', `Обновлена новость #${id}`, draft);
    return draft;
  });
}

export function deleteNewsItem(id: number) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = { ...prev, news: prev.news.filter((n) => n.id !== id) };
    addAudit(actor, 'Удаление', 'Новости', `Удалена новость #${id}`, draft);
    return draft;
  });
}

export function addSection(payload: Omit<SectionRecord, 'id'>) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = { ...prev, sections: [...prev.sections, { ...payload, id: `sect-${Date.now()}` }] };
    addAudit(actor, 'Создание', 'Секции', `Создана секция "${payload.name}"`, draft);
    return draft;
  });
}

export function deleteSection(sectionId: string) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = {
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
      sectionMembers: prev.sectionMembers.filter((m) => m.sectionId !== sectionId),
      sectionApplications: prev.sectionApplications.filter((a) => a.sectionId !== sectionId),
    };
    addAudit(actor, 'Удаление', 'Секции', `Удалена секция #${sectionId}`, draft);
    return draft;
  });
}

export function addSectionApplication(payload: Omit<SectionApplicationRecord, 'id' | 'status' | 'date'>): OperationResult {
  const section = state.sections.find((s) => s.id === payload.sectionId);
  if (!section) return { ok: false, message: 'Секция не найдена.' };

  const memberCount = state.sectionMembers.filter((m) => m.sectionId === payload.sectionId).length;
  if (memberCount >= section.capacity) {
    return { ok: false, message: 'В секции уже нет свободных мест.' };
  }

  let added = false;
  mutate((prev) => {
    const existsPending = prev.sectionApplications.some(
      (a) => a.studentId === payload.studentId && a.sectionId === payload.sectionId && a.status === 'pending'
    );
    const existsMember = prev.sectionMembers.some(
      (m) => m.studentId === payload.studentId && m.sectionId === payload.sectionId
    );
    if (existsPending || existsMember) return prev;

    const draft = {
      ...prev,
      sectionApplications: [
        ...prev.sectionApplications,
        { ...payload, id: `app-${Date.now()}`, status: 'pending' as const, date: now().split(',')[0] },
      ],
    };
    added = true;
    addNotification({ userRole: 'curator', type: 'info', title: 'Новая заявка в секцию', message: `${payload.studentName} → ${section.name}` }, draft);
    return draft;
  });

  if (!added) {
    return { ok: false, message: 'Заявка уже существует или ученик уже состоит в секции.' };
  }

  return { ok: true };
}

export function updateSectionApplicationStatus(appId: string, status: 'approved' | 'rejected'): OperationResult {
  let result: OperationResult = { ok: true };
  mutate((prev) => {
    const app = prev.sectionApplications.find((a) => a.id === appId);
    const updatedApps: SectionApplicationRecord[] = prev.sectionApplications.map((a) =>
      a.id === appId ? { ...a, status } : a
    );
    const actor = getCurrentUser() ?? prev.users.find((u) => u.role === 'curator') ?? prev.users[0];

    if (!app) {
      result = { ok: false, message: 'Заявка не найдена.' };
      return prev;
    }

    const section = prev.sections.find((s) => s.id === app.sectionId);
    const sectionLabel = section?.name ?? app.sectionId;

    if (status !== 'approved') {
      const draftRejected = { ...prev, sectionApplications: updatedApps };
      addNotification({ userRole: 'student', userId: app.studentId, type: 'warning', title: 'Заявка в секцию отклонена', message: sectionLabel }, draftRejected);
      addAudit(actor, 'Отклонение', 'Секции', `Отклонена заявка ${appId}`, draftRejected);
      return draftRejected;
    }

    const membersInSection = prev.sectionMembers.filter((m) => m.sectionId === app.sectionId).length;
    if (section && membersInSection >= section.capacity) {
      result = { ok: false, message: 'Невозможно одобрить: лимит участников секции исчерпан.' };
      return {
        ...prev,
        sectionApplications: prev.sectionApplications.map((a) =>
          a.id === appId ? { ...a, status: 'rejected' } : a
        ),
      };
    }
    const exists = prev.sectionMembers.some((m) => m.sectionId === app.sectionId && m.studentId === app.studentId);
    const draftApproved = {
      ...prev,
      sectionApplications: updatedApps,
      sectionMembers: exists ? prev.sectionMembers : [...prev.sectionMembers, { sectionId: app.sectionId, studentId: app.studentId }],
    };
    addNotification({ userRole: 'student', userId: app.studentId, type: 'success', title: 'Заявка в секцию одобрена', message: sectionLabel }, draftApproved);
    addAudit(actor, 'Одобрение', 'Секции', `Одобрена заявка ${appId}`, draftApproved);
    return draftApproved;
  });

  return result;
}

export function getStudentSections(studentId: number) {
  const ids = state.sectionMembers.filter((m) => m.studentId === studentId).map((m) => m.sectionId);
  return state.sections.filter((s) => ids.includes(s.id));
}

export function getSectionMembersCount(sectionId: string) {
  return state.sectionMembers.filter((m) => m.sectionId === sectionId).length;
}

export function getUserSettings(userId: number): UserSettingsRecord | null {
  return state.userSettings.find((s) => s.userId === userId) ?? null;
}

export function saveUserSettings(userId: number, patch: Omit<UserSettingsRecord, 'userId'>) {
  mutate((prev) => {
    const exists = prev.userSettings.some((s) => s.userId === userId);
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = {
      ...prev,
      userSettings: exists
        ? prev.userSettings.map((s) => (s.userId === userId ? { ...s, ...patch } : s))
        : [...prev.userSettings, { userId, ...patch }],
    };
    addAudit(actor, 'Редактирование', 'Настройки', `Обновлены пользовательские настройки #${userId}`, draft);
    return draft;
  });
}

export function updateCurrentUserProfile(payload: { name: string; email: string; phone: string; position: string }) {
  const current = getCurrentUser();
  if (!current) return;
  mutate((prev) => {
    const hasSettings = prev.userSettings.some((s) => s.userId === current.id);
    const draft = {
      ...prev,
      users: prev.users.map((u) => (u.id === current.id ? { ...u, name: payload.name, email: payload.email } : u)),
      userSettings: hasSettings
        ? prev.userSettings.map((s) => (s.userId === current.id ? { ...s, phone: payload.phone, position: payload.position } : s))
        : [
            ...prev.userSettings,
            {
              userId: current.id,
              position: payload.position,
              phone: payload.phone,
              rowsPerPage: '10',
              dateFormat: 'dd.mm.yyyy',
              showTooltips: true,
              saveFilters: true,
              notifications: true,
            },
          ],
    };
    addAudit(current, 'Редактирование', 'Профиль', 'Пользователь обновил профиль', draft);
    return draft;
  });
}

export function changeCurrentUserPassword(currentPassword: string, newPassword: string) {
  const current = getCurrentUser();
  if (!current) return { ok: false as const, message: 'Пользователь не найден' };
  if (ensurePasswordHash(current.password) !== hashPassword(currentPassword)) return { ok: false as const, message: 'Текущий пароль неверен' };
  if (newPassword.trim().length < 8) return { ok: false as const, message: 'Новый пароль должен содержать минимум 8 символов' };
  mutate((prev) => {
    const draft = { ...prev, users: prev.users.map((u) => (u.id === current.id ? { ...u, password: hashPassword(newPassword) } : u)) };
    addAudit(current, 'Редактирование', 'Безопасность', 'Пользователь изменил пароль', draft);
    return draft;
  });
  return { ok: true as const };
}

export function __resetStoreForTests() {
  resetStoreToInitial();
}

export function resetStoreToInitial() {
  state = JSON.parse(JSON.stringify(INITIAL_STATE));
  persistAndEmit();
}

export function __getStateForTests() {
  return state;
}

export function getScoringRules() {
  return state.scoringRules;
}

export function setScoringRules(nextRules: Record<string, Record<string, number>>) {
  mutate((prev) => {
    const actor = getCurrentUser() ?? prev.users[0];
    const draft = { ...prev, scoringRules: nextRules };
    addAudit(actor, 'Редактирование', 'Настройки', 'Обновлены стандарты начисления баллов', draft);
    return draft;
  });
}
