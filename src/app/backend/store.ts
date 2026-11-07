import { useSyncExternalStore } from 'react';

export type UserRole = 'admin' | 'curator' | 'student';

export interface UserRecord {
  id: number;
  login: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  classHistory?: Array<{ class: string; academicYear: string }>;
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
  password?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

export interface AchievementHistoryEntry {
  id: number;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'resubmitted' | 'revoked';
  user: string;
  userRole: 'Ученик' | 'Куратор' | 'Администратор';
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
  scoringVersion?: number;
  academicYear?: string;
  eventId?: string;
  stage?: string;
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
  archivedAt?: string;
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

export interface OperationResult {
  ok: boolean;
  message?: string;
}

export interface BackendState {
  currentUserId: number | null;
  connectionStatus?: 'loading' | 'ready' | 'error';
  connectionError?: string;
  lastBackupAt?: string;
  scoringVersion?: number;
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

// This is a cache of the server response, never an authority for identity or permissions.
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const apiUrl = (path: string) => `${API_ORIGIN}/api/v1${path}`;
const emptyState = (): BackendState => ({
  currentUserId: null, users: [], registrations: [], achievements: [], notifications: [],
  auditLogs: [], calendarEvents: [], news: [], sections: [], sectionApplications: [],
  sectionMembers: [], userSettings: [], scoringRules: {}, classCatalog: [], connectionStatus: 'loading',
});
let state = emptyState();
const listeners = new Set<() => void>();
let generation = 0;
let sessionEpoch = 0;
let refreshPromise: Promise<void> | null = null;
let initialization: Promise<void> | null = null;
let commandQueue = Promise.resolve();

function publish(next: BackendState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function request(path: string, init: RequestInit = {}, timeout = 20000, asBlob = false) {
  const requestEpoch = sessionEpoch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(apiUrl(path), {
      ...init, credentials: 'include', cache: 'no-store', signal: controller.signal,
      headers: { ...(typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
    if (response.ok && asBlob) {
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Сервер вернул некорректную резервную копию');
      return await response.blob();
    }
    let body;
    try { body = await response.json(); }
    catch {
      if (response.ok) throw new Error('Сервер вернул некорректный ответ');
      body = {};
    }
    if (!response.ok) {
      if (response.status === 401 && path !== '/auth/login' && requestEpoch === sessionEpoch) {
        sessionEpoch += 1;
        generation += 1;
        publish({ ...emptyState(), classCatalog: state.classCatalog, scoringRules: state.scoringRules, connectionStatus: 'ready' });
      }
      throw Object.assign(new Error(body?.message || `Ошибка сервера (${response.status})`), { status: response.status });
    }
    return body;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Сервер не ответил вовремя. Повторите попытку.');
    if (error instanceof TypeError) throw new Error('Потеряно соединение с сервером. Обновите данные перед повторной отправкой.');
    throw error;
  } finally { clearTimeout(timer); }
}

const messageOf = (error: unknown) => error instanceof Error ? error.message : 'Не удалось выполнить операцию';
function acceptSnapshot(snapshot: BackendState) {
  if (!snapshot || typeof snapshot !== 'object' || (snapshot.currentUserId !== null && !Number.isSafeInteger(snapshot.currentUserId))
    || ['users', 'registrations', 'achievements', 'notifications', 'auditLogs', 'calendarEvents', 'news', 'sections',
      'sectionApplications', 'sectionMembers', 'userSettings', 'classCatalog'].some((key) => !Array.isArray(snapshot[key]))
    || !snapshot.scoringRules || typeof snapshot.scoringRules !== 'object') {
    throw new Error('Сервер вернул некорректное состояние системы');
  }
  publish({ ...snapshot, connectionStatus: 'ready', connectionError: undefined });
}

export function useBackendState() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => state, () => state);
}
export function getCurrentUser() { return state.users.find((u) => u.id === state.currentUserId) ?? null; }
export function getStudents() {
  return state.users.filter((u) => u.role === 'student').map((u) => {
    const [lastName = '', firstName = '', middleName = ''] = u.name.split(' ');
    return { id: u.id, userId: u.id, lastName, firstName, middleName, class: u.class ?? '—' };
  });
}

export async function refreshBackendState() {
  if (refreshPromise) return refreshPromise;
  const startedAt = generation;
  const readEpoch = sessionEpoch;
  refreshPromise = (async () => {
    try {
      const snapshot = await request('/state');
      if (startedAt === generation && readEpoch === sessionEpoch) acceptSnapshot(snapshot);
    } catch (error) {
      if ((error as { status?: number }).status !== 401 && startedAt === generation && readEpoch === sessionEpoch) {
        publish({ ...state, connectionStatus: 'error', connectionError: messageOf(error) });
      }
    } finally { refreshPromise = null; }
  })();
  return refreshPromise;
}

export function initializeBackend() {
  if (initialization) return initialization;
  initialization = (async () => {
    try {
      const catalog = await request('/bootstrap');
      if (!Array.isArray(catalog?.classCatalog) || !catalog.scoringRules) throw new Error('Сервер вернул некорректный справочник');
      publish({ ...state, classCatalog: catalog.classCatalog, scoringRules: catalog.scoringRules });
      await refreshBackendState();
    } catch (error) { publish({ ...state, connectionStatus: 'error', connectionError: messageOf(error) }); }
  })();
  return initialization;
}

export function reconnectBackend() { initialization = null; return initializeBackend(); }

export function startBackendSync() {
  const refresh = () => { if (state.currentUserId && document.visibilityState !== 'hidden') void refreshBackendState(); };
  const timer = window.setInterval(refresh, 15000);
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', refresh);
  return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
}

export async function login(loginValue: string, password: string): Promise<OperationResult & { user?: UserRecord }> {
  generation += 1;
  const epoch = ++sessionEpoch;
  try {
    const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ login: loginValue, password }) });
    if (epoch !== sessionEpoch) return { ok: false, message: 'Сессия изменилась. Повторите вход.' };
    generation += 1;
    acceptSnapshot(result.state);
    return { ok: true, user: result.user ?? getCurrentUser() ?? undefined };
  } catch (error) { return { ok: false, message: messageOf(error) }; }
}
export async function logout(): Promise<OperationResult> {
  generation += 1;
  const epoch = ++sessionEpoch;
  try {
    await request('/auth/logout', { method: 'POST', body: '{}' });
    if (epoch !== sessionEpoch) return { ok: false, message: 'Сессия уже изменилась' };
    generation += 1;
    publish({ ...emptyState(), classCatalog: state.classCatalog, scoringRules: state.scoringRules, connectionStatus: 'ready' });
    return { ok: true };
  } catch (error) { return { ok: false, message: messageOf(error) }; }
}

async function command(name: string, args: unknown[]): Promise<OperationResult> {
  const epoch = sessionEpoch;
  const userId = state.currentUserId;
  let resolveResult!: (result: OperationResult) => void;
  const result = new Promise<OperationResult>((resolve) => { resolveResult = resolve; });
  commandQueue = commandQueue.then(async () => {
    if (epoch !== sessionEpoch || userId !== state.currentUserId) { resolveResult({ ok: false, message: 'Сессия изменилась. Повторите действие.' }); return; }
    generation += 1;
    try {
      const response = await request('/commands', { method: 'POST', body: JSON.stringify({ name, args }) }, name === 'bulkImportStudents' ? 65000 : 20000);
      if (epoch !== sessionEpoch) { resolveResult({ ok: false, message: 'Сессия изменилась' }); return; }
      generation += 1;
      acceptSnapshot(response.state);
      resolveResult({ ...response, state: undefined, ok: true });
    } catch (error) { resolveResult({ ok: false, message: messageOf(error) }); }
  });
  return result;
}

export async function submitStudentRegistrationWithFallback(payload: Omit<RegistrationRequest, 'id' | 'submittedAt' | 'status'>): Promise<OperationResult> {
  try {
    await request('/registrations', { method: 'POST', body: JSON.stringify(payload) });
    return { ok: true };
  } catch (error) { return { ok: false, message: messageOf(error) }; }
}
export const submitStudentRegistration = submitStudentRegistrationWithFallback;
export const processRegistration = (id: number, action: 'approve' | 'reject', comment: string) => command('processRegistration', [id, action, comment]);
export const addClassToCatalog = (name: string) => command('addClassToCatalog', [name]);
export const removeClassFromCatalog = (name: string) => command('removeClassFromCatalog', [name]);
export const addUser = (payload: Omit<UserRecord, 'id' | 'lastLogin'>) => command('addUser', [payload]);
export const updateUser = (id: number, patch: Partial<UserRecord>) => command('updateUser', [id, patch]);
export const deleteUser = (id: number) => command('deleteUser', [id]);
export interface AchievementInput {
  name: string; category: string; level: string; result: string; points?: number; date: string;
  description?: string; documents?: string[]; eventId?: string; stage?: string;
}
export const submitAchievement = (studentId: number, payload: AchievementInput) => command('submitAchievement', [studentId, payload]);
export const resubmitAchievement = (id: number, payload: AchievementInput, revision: number) => command('resubmitAchievement', [id, payload, revision]);
export const processAchievement = (id: number, action: 'approve' | 'reject', comment: string, revision: number) => command('processAchievement', [id, action, comment, revision]);
export const revokeAchievement = (id: number, comment: string, revision: number) => command('revokeAchievement', [id, comment, revision]);
export const markNotificationRead = (id: number) => command('markNotificationRead', [id]);
export const markAllNotificationsRead = (role: UserRole, userId?: number) => command('markAllNotificationsRead', [role, userId]);
export const deleteNotification = (id: number) => command('deleteNotification', [id]);
export const addCalendarEvent = (payload: Omit<CalendarEventRecord, 'id'>) => command('addCalendarEvent', [payload]);
export const updateCalendarEvent = (id: number, patch: Partial<CalendarEventRecord>) => command('updateCalendarEvent', [id, patch]);
export const deleteCalendarEvent = (id: number) => command('deleteCalendarEvent', [id]);
export const addNewsItem = (payload: Omit<NewsRecord, 'id' | 'date'>) => command('addNewsItem', [payload]);
export const updateNewsItem = (id: number, patch: Partial<NewsRecord>) => command('updateNewsItem', [id, patch]);
export const deleteNewsItem = (id: number) => command('deleteNewsItem', [id]);
export const addSection = (payload: Omit<SectionRecord, 'id'>) => command('addSection', [payload]);
export const deleteSection = (id: string) => command('deleteSection', [id]);
export const addSectionApplication = (payload: Omit<SectionApplicationRecord, 'id' | 'status' | 'date'>) => command('addSectionApplication', [payload]);
export const updateSectionApplicationStatus = (id: string, status: 'approved' | 'rejected') => command('updateSectionApplicationStatus', [id, status]);
export function getStudentSections(id: number) {
  const ids = new Set(state.sectionMembers.filter((m) => m.studentId === id).map((m) => m.sectionId));
  return state.sections.filter((s) => ids.has(s.id) && !s.archivedAt);
}
export const getSectionMembersCount = (id: string) => state.sectionMembers.filter((m) => m.sectionId === id).length;
export const getUserSettings = (id: number) => state.userSettings.find((s) => s.userId === id) ?? null;
export const saveUserSettings = (id: number, patch: Omit<UserSettingsRecord, 'userId'>) => command('saveUserSettings', [id, patch]);
export const updateCurrentUserProfile = (payload: { name: string; email: string; phone: string; position: string }) => command('updateCurrentUserProfile', [payload]);
export const changeCurrentUserPassword = (currentPassword: string, newPassword: string) => command('changeCurrentUserPassword', [currentPassword, newPassword]);
export const getScoringRules = () => state.scoringRules;
export const setScoringRules = (rules: Record<string, Record<string, number>>) => command('setScoringRules', [rules]);
export const bulkImportStudents = (rows: Array<Record<string, string>>) => command('bulkImportStudents', [rows]);
export const promoteStudents = (mapping: Record<string, string>, academicYear: string) => command('promoteStudents', [mapping, academicYear]);

export async function uploadDocument(file: File): Promise<OperationResult & { document?: string }> {
  try {
    if (file.size > 4 * 1024 * 1024) throw new Error('Документ превышает 4 МБ');
    const result = await request('/documents', { method: 'POST', body: file, headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) } }, 60000);
    return { ok: true, document: result.document };
  } catch (error) { return { ok: false, message: messageOf(error) }; }
}
export function documentUrl(raw: string) {
  const match = raw.match(/^document::([a-f\d-]+)::/i);
  return match ? apiUrl(`/documents/${match[1]}`) : '';
}
export async function downloadBackup(): Promise<OperationResult> {
  try {
    const data = await request('/backup', {}, 120000, true);
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    await refreshBackendState();
    return { ok: true };
  } catch (error) { return { ok: false, message: messageOf(error) }; }
}
export async function restoreBackup(file: File): Promise<OperationResult> {
  try {
    if (file.size > 4 * 1024 * 1024) throw new Error('Для копии больше 4 МБ используйте серверную команду восстановления из инструкции');
    const backup = JSON.parse(await file.text());
    generation += 1;
    const epoch = ++sessionEpoch;
    await request('/restore', { method: 'POST', body: JSON.stringify(backup) }, 120000);
    if (epoch !== sessionEpoch) return { ok: false, message: 'Сессия изменилась' };
    generation += 1;
    publish({ ...emptyState(), connectionStatus: 'ready' });
    initialization = null;
    await initializeBackend();
    return { ok: true };
  } catch (error) { return { ok: false, message: messageOf(error) }; }
}

