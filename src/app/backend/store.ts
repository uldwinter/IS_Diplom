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
}

interface BackendState {
  currentUserId: number | null;
  users: UserRecord[];
  registrations: RegistrationRequest[];
  achievements: AchievementRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogEntry[];
}

const STORAGE_KEY = 'gifted-children-backend-v2';

const now = () => new Date().toLocaleString('ru-RU');
const nextId = (arr: Array<{ id: number }>) => arr.reduce((m, i) => Math.max(m, i.id), 0) + 1;
const roleRu = (r: UserRole) => (r === 'admin' ? 'Администратор' : r === 'curator' ? 'Куратор' : 'Ученик');

const INITIAL_STATE: BackendState = {
  currentUserId: null,
  users: [
    { id: 1, login: 'admin', password: 'admin123', name: 'Смирнова Елена Владимировна', email: 'smirnova@school.edu', role: 'admin', status: 'active', lastLogin: 'Никогда' },
    { id: 2, login: 'curator', password: 'curator123', name: 'Петров Андрей Николаевич', email: 'petrov@school.edu', role: 'curator', status: 'active', lastLogin: 'Никогда' },
    { id: 3, login: 'student', password: 'student123', name: 'Иванов Иван Иванович', email: 'ivanov.student@school.edu', role: 'student', class: '10-1', status: 'active', lastLogin: 'Никогда' },
    { id: 4, login: 'petrova', password: 'student123', name: 'Петрова Мария Сергеевна', email: 'petrova.student@school.edu', role: 'student', class: '10-1', status: 'active', lastLogin: 'Никогда' },
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
};

let state = loadState();
const listeners = new Set<() => void>();

function loadState(): BackendState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(raw) as BackendState;
    return {
      ...INITIAL_STATE,
      ...parsed,
      users: parsed.users ?? INITIAL_STATE.users,
      achievements: parsed.achievements ?? INITIAL_STATE.achievements,
      notifications: parsed.notifications ?? [],
      auditLogs: parsed.auditLogs ?? [],
    };
  } catch {
    return INITIAL_STATE;
  }
}

function persistAndEmit() {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const user = state.users.find((u) => u.login.toLowerCase() === loginValue.toLowerCase() && u.password === password);
  if (!user) return { ok: false as const, message: 'Неверный логин или пароль' };
  if (user.status !== 'active') return { ok: false as const, message: 'Пользователь деактивирован администратором' };

  mutate((prev) => {
    const draft = { ...prev, users: prev.users.map((u) => (u.id === user.id ? { ...u, lastLogin: now() } : u)) };
    draft.currentUserId = user.id;
    addAudit(user, 'Вход', 'Авторизация', `Вход в систему как ${roleRu(user.role)}`, draft);
    return draft;
  });

  return { ok: true as const, user };
}

export function logout() {
  mutate((prev) => ({ ...prev, currentUserId: null }));
}

export function submitStudentRegistration(payload: Omit<RegistrationRequest, 'id' | 'submittedAt' | 'status'>) {
  const loginTaken = state.users.some((u) => u.login.toLowerCase() === payload.login.toLowerCase());
  if (loginTaken) return { ok: false as const, message: 'Логин уже занят. Выберите другой.' };

  mutate((prev) => {
    const request: RegistrationRequest = { ...payload, id: nextId(prev.registrations), submittedAt: now(), status: 'pending' };
    const draft = { ...prev, registrations: [request, ...prev.registrations] };
    addNotification({ userRole: 'curator', type: 'info', title: 'Новая регистрация', message: `Заявка от ${payload.lastName} ${payload.firstName}` }, draft);
    return draft;
  });
  return { ok: true as const };
}

export function processRegistration(requestId: number, action: 'approve' | 'reject', comment: string) {
  mutate((prev) => {
    const req = prev.registrations.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return prev;
    const current = getCurrentUser() ?? prev.users.find((u) => u.role === 'curator')!;

    const registrations = prev.registrations.map((r) => (r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected', comment } : r));
    const draft: BackendState = { ...prev, registrations };

    if (action === 'approve') {
      const name = `${req.lastName} ${req.firstName} ${req.middleName}`;
      draft.users = [...prev.users, { id: nextId(prev.users), login: req.login, password: req.password, name, email: req.email, role: 'student', class: req.class, status: 'active', lastLogin: 'Ещё не заходил' }];
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
    const user: UserRecord = { ...payload, id: nextId(prev.users), lastLogin: 'Ещё не заходил' };
    const draft = { ...prev, users: [...prev.users, user] };
    const actor = getCurrentUser() ?? prev.users[0];
    addAudit(actor, 'Создание', 'Пользователи', `Создан пользователь ${user.name}`, draft);
    return draft;
  });
  return { ok: true as const };
}

export function updateUser(userId: number, patch: Partial<UserRecord>) {
  mutate((prev) => {
    const draft = { ...prev, users: prev.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) };
    const actor = getCurrentUser() ?? prev.users[0];
    addAudit(actor, 'Редактирование', 'Пользователи', `Изменен пользователь #${userId}`, draft);
    return draft;
  });
}

export function deleteUser(userId: number) {
  mutate((prev) => {
    const draft = { ...prev, users: prev.users.filter((u) => u.id !== userId) };
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
}) {
  const student = state.users.find((u) => u.id === studentUserId && u.role === 'student');
  if (!student) return;

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
}

export function processAchievement(achievementId: number, action: 'approve' | 'reject', comment: string) {
  mutate((prev) => {
    const ach = prev.achievements.find((a) => a.id === achievementId);
    if (!ach || ach.status !== 'pending') return prev;
    const actor = getCurrentUser() ?? prev.users.find((u) => u.role === 'curator')!;

    const updated = prev.achievements.map((a) => {
      if (a.id !== achievementId) return a;
      const nextHistoryId = nextId(a.history);
      return {
        ...a,
        status: action === 'approve' ? 'approved' : 'rejected',
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
      if (userRole === 'student' && n.userId && userId && n.userId !== userId) return n;
      return { ...n, read: true };
    }),
  }));
}

export function deleteNotification(notificationId: number) {
  mutate((prev) => ({ ...prev, notifications: prev.notifications.filter((n) => n.id !== notificationId) }));
}
