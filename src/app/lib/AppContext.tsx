import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type {
  SystemUser,
  StudentProfile,
  Achievement,
  AchievementStatus,
  Section,
  SectionApplication,
  SectionMember,
  NewsItem,
  CalendarEvent,
  AuditLogEntry,
  PendingRegistration,
  PersistedState,
  UserRole,
  RegistrationStatus,
} from './types';
import { INITIAL_STATE } from './mockData';

// ─── localStorage helpers ──────────────────────────────────────
const STORAGE_KEY = 'bank_achievements_v1';

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch { /* ignore */ }
  return INITIAL_STATE;
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ─── Context type ──────────────────────────────────────────────
interface AppContextType {
  // Auth
  currentUser: SystemUser | null;
  login: (email: string, password: string) => SystemUser | null;
  logout: () => void;

  // Users
  users: SystemUser[];
  addUser: (data: Omit<SystemUser, 'id' | 'lastLogin'>) => SystemUser;
  updateUser: (id: number, data: Partial<Omit<SystemUser, 'id'>>) => void;
  deleteUser: (id: number) => void;

  // Students
  students: StudentProfile[];
  getStudent: (id: number) => StudentProfile | undefined;

  // Achievements
  achievements: Achievement[];
  getStudentAchievements: (studentId: number) => Achievement[];
  getPendingAchievements: () => Achievement[];
  addAchievement: (data: Omit<Achievement, 'id' | 'submittedDate'>) => Achievement;
  updateAchievementStatus: (id: number, status: AchievementStatus, comment?: string) => void;
  deleteAchievement: (id: number) => void;

  // Sections
  sections: Section[];
  sectionApplications: SectionApplication[];
  sectionMembers: SectionMember[];
  addSection: (data: Omit<Section, 'id'>) => void;
  updateSection: (id: string, data: Partial<Omit<Section, 'id'>>) => void;
  deleteSection: (id: string) => void;
  applyToSection: (studentId: number, studentName: string, studentClass: string, sectionId: string) => void;
  updateSectionAppStatus: (appId: string, status: 'approved' | 'rejected') => void;
  getStudentSections: (studentId: number) => Section[];
  getSectionMembersCount: (sectionId: string) => number;
  isStudentMember: (studentId: number, sectionId: string) => boolean;
  hasApplied: (studentId: number, sectionId: string) => boolean;

  // News
  news: NewsItem[];
  addNews: (data: Omit<NewsItem, 'id'>) => void;
  updateNews: (id: number, data: Partial<Omit<NewsItem, 'id'>>) => void;
  deleteNews: (id: number) => void;

  // Events
  events: CalendarEvent[];
  addEvent: (data: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: number, data: Partial<Omit<CalendarEvent, 'id'>>) => void;
  deleteEvent: (id: number) => void;

  // Audit Log
  auditLog: AuditLogEntry[];
  addAuditEntry: (action: string, entity: string, details: string) => void;

  // Registrations
  registrations: PendingRegistration[];
  updateRegistrationStatus: (id: number, status: RegistrationStatus, comment?: string) => void;
  addRegistration: (data: Omit<PendingRegistration, 'id' | 'status' | 'submittedAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Helper to mutate state ──────────────────────────────────
  const update = useCallback((fn: (prev: PersistedState) => PersistedState) => {
    setState(fn);
  }, []);

  // ── Audit entry helper (internal) ───────────────────────────
  const auditRef = useRef(currentUser);
  auditRef.current = currentUser;

  const addAuditEntry = useCallback((action: string, entity: string, details: string) => {
    const user = auditRef.current;
    const entry: AuditLogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', ''),
      userId: user?.id ?? 0,
      user: user ? shortName(user.name) : 'Система',
      userRole: user?.role ?? 'admin',
      action,
      entity,
      details,
    };
    update(prev => ({ ...prev, auditLog: [entry, ...prev.auditLog] }));
  }, [update]);

  // ─── AUTH ─────────────────────────────────────────────────
  const login = useCallback((email: string, password: string): SystemUser | null => {
    const user = state.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user || user.status === 'inactive') return null;

    const now = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
    // Update lastLogin
    update(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? { ...u, lastLogin: now } : u),
    }));
    setCurrentUser({ ...user, lastLogin: now });
    return user;
  }, [state.users, update]);

  const logout = useCallback(() => {
    if (currentUser) {
      addAuditEntry('Выход из системы', 'Сессия', `Пользователь ${shortName(currentUser.name)} вышел из системы`);
    }
    setCurrentUser(null);
  }, [currentUser, addAuditEntry]);

  // ─── USERS ────────────────────────────────────────────────
  const addUser = useCallback((data: Omit<SystemUser, 'id' | 'lastLogin'>): SystemUser => {
    const newUser: SystemUser = { ...data, id: Date.now(), lastLogin: 'Ещё не заходил' };
    // If student, also create a StudentProfile
    if (data.role === 'student') {
      const nameParts = data.name.split(' ');
      const newStudent: StudentProfile = {
        id: Date.now() + 1,
        userId: newUser.id,
        lastName: nameParts[0] || '',
        firstName: nameParts[1] || '',
        middleName: nameParts[2] || '',
        class: data.class || '',
      };
      newUser.studentId = newStudent.id;
      update(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        students: [...prev.students, newStudent],
      }));
    } else {
      update(prev => ({ ...prev, users: [...prev.users, newUser] }));
    }
    addAuditEntry('Создание пользователя', 'Пользователи', `Создан пользователь: ${data.name} (${roleLabel(data.role)})`);
    return newUser;
  }, [update, addAuditEntry]);

  const updateUser = useCallback((id: number, data: Partial<Omit<SystemUser, 'id'>>) => {
    update(prev => {
      const updated = prev.users.map(u => u.id === id ? { ...u, ...data } : u);
      // If student and class changed, sync StudentProfile
      const user = updated.find(u => u.id === id);
      if (user?.role === 'student' && data.class && user.studentId) {
        const updatedStudents = prev.students.map(s =>
          s.id === user.studentId ? { ...s, class: data.class! } : s
        );
        return { ...prev, users: updated, students: updatedStudents };
      }
      return { ...prev, users: updated };
    });
    addAuditEntry('Редактирование пользователя', 'Пользователи', `Обновлены данные пользователя (ID: ${id})`);
  }, [update, addAuditEntry]);

  const deleteUser = useCallback((id: number) => {
    const user = state.users.find(u => u.id === id);
    update(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
      students: user?.studentId ? prev.students.filter(s => s.id !== user.studentId) : prev.students,
    }));
    if (user) addAuditEntry('Удаление пользователя', 'Пользователи', `Удалён пользователь: ${user.name}`);
  }, [state.users, update, addAuditEntry]);

  // ─── STUDENTS ─────────────────────────────────────────────
  const getStudent = useCallback((id: number) => {
    return state.students.find(s => s.id === id);
  }, [state.students]);

  // ─── ACHIEVEMENTS ──────────────────────────────────────────
  const getStudentAchievements = useCallback((studentId: number) => {
    return state.achievements.filter(a => a.studentId === studentId);
  }, [state.achievements]);

  const getPendingAchievements = useCallback(() => {
    return state.achievements.filter(a => a.status === 'pending');
  }, [state.achievements]);

  const addAchievement = useCallback((data: Omit<Achievement, 'id' | 'submittedDate'>): Achievement => {
    const today = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const achievement: Achievement = { ...data, id: Date.now(), submittedDate: today };
    update(prev => ({ ...prev, achievements: [achievement, ...prev.achievements] }));
    addAuditEntry('Создание заявки', 'Достижения', `Создана заявка: "${data.name}" (${data.studentName})`);
    return achievement;
  }, [update, addAuditEntry]);

  const updateAchievementStatus = useCallback((id: number, status: AchievementStatus, comment?: string) => {
    const ach = state.achievements.find(a => a.id === id);
    const reviewedAt = new Date().toLocaleDateString('ru-RU');
    const reviewedBy = currentUser ? shortName(currentUser.name) : '';
    update(prev => ({
      ...prev,
      achievements: prev.achievements.map(a =>
        a.id === id ? { ...a, status, comment, reviewedBy, reviewedAt } : a
      ),
    }));
    if (ach) {
      const actionLabel = status === 'approved' ? 'Одобрение достижения' : 'Отклонение достижения';
      addAuditEntry(actionLabel, 'Достижения', `${actionLabel}: "${ach.name}" (${ach.studentName})${comment ? ` — ${comment}` : ''}`);
    }
  }, [state.achievements, currentUser, update, addAuditEntry]);

  const deleteAchievement = useCallback((id: number) => {
    const ach = state.achievements.find(a => a.id === id);
    update(prev => ({ ...prev, achievements: prev.achievements.filter(a => a.id !== id) }));
    if (ach) addAuditEntry('Удаление достижения', 'Достижения', `Удалено достижение: "${ach.name}"`);
  }, [state.achievements, update, addAuditEntry]);

  // ─── SECTIONS ─────────────────────────────────────────────
  const addSection = useCallback((data: Omit<Section, 'id'>) => {
    const newSection: Section = { ...data, id: `sect-${Date.now()}` };
    update(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    addAuditEntry('Создание секции', 'Секции', `Добавлена секция: "${data.name}"`);
  }, [update, addAuditEntry]);

  const updateSection = useCallback((id: string, data: Partial<Omit<Section, 'id'>>) => {
    update(prev => ({ ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, ...data } : s) }));
    addAuditEntry('Редактирование секции', 'Секции', `Обновлена секция (ID: ${id})`);
  }, [update, addAuditEntry]);

  const deleteSection = useCallback((id: string) => {
    const sect = state.sections.find(s => s.id === id);
    update(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    if (sect) addAuditEntry('Удаление секции', 'Секции', `Удалена секция: "${sect.name}"`);
  }, [state.sections, update, addAuditEntry]);

  const applyToSection = useCallback((studentId: number, studentName: string, studentClass: string, sectionId: string) => {
    const section = state.sections.find(s => s.id === sectionId);
    const existing = state.sectionApplications.find(a => a.studentId === studentId && a.sectionId === sectionId);
    if (existing) return;
    const today = new Date().toLocaleDateString('ru-RU');
    const app: SectionApplication = {
      id: `app-${Date.now()}`,
      studentId,
      studentName,
      studentClass,
      sectionId,
      status: 'pending',
      date: today,
    };
    update(prev => ({ ...prev, sectionApplications: [...prev.sectionApplications, app] }));
    addAuditEntry('Заявка в секцию', 'Секции', `${studentName} подал заявку в "${section?.name ?? sectionId}"`);
  }, [state.sections, state.sectionApplications, update, addAuditEntry]);

  const updateSectionAppStatus = useCallback((appId: string, status: 'approved' | 'rejected') => {
    const app = state.sectionApplications.find(a => a.id === appId);
    update(prev => {
      const updatedApps = prev.sectionApplications.map(a => a.id === appId ? { ...a, status } : a);
      let updatedMembers = prev.sectionMembers;
      if (status === 'approved' && app) {
        const alreadyMember = prev.sectionMembers.some(m => m.sectionId === app.sectionId && m.studentId === app.studentId);
        if (!alreadyMember) {
          updatedMembers = [...prev.sectionMembers, { sectionId: app.sectionId, studentId: app.studentId }];
        }
      }
      return { ...prev, sectionApplications: updatedApps, sectionMembers: updatedMembers };
    });
    if (app) {
      const section = state.sections.find(s => s.id === app.sectionId);
      const action = status === 'approved' ? 'Одобрение заявки в секцию' : 'Отклонение заявки в секцию';
      addAuditEntry(action, 'Секции', `${action}: ${app.studentName} в "${section?.name ?? app.sectionId}"`);
    }
  }, [state.sectionApplications, state.sections, update, addAuditEntry]);

  const getStudentSections = useCallback((studentId: number): Section[] => {
    const memberOf = state.sectionMembers.filter(m => m.studentId === studentId).map(m => m.sectionId);
    return state.sections.filter(s => memberOf.includes(s.id));
  }, [state.sectionMembers, state.sections]);

  const getSectionMembersCount = useCallback((sectionId: string) => {
    return state.sectionMembers.filter(m => m.sectionId === sectionId).length;
  }, [state.sectionMembers]);

  const isStudentMember = useCallback((studentId: number, sectionId: string) => {
    return state.sectionMembers.some(m => m.studentId === studentId && m.sectionId === sectionId);
  }, [state.sectionMembers]);

  const hasApplied = useCallback((studentId: number, sectionId: string) => {
    return state.sectionApplications.some(a => a.studentId === studentId && a.sectionId === sectionId);
  }, [state.sectionApplications]);

  // ─── NEWS ─────────────────────────────────────────────────
  const addNews = useCallback((data: Omit<NewsItem, 'id'>) => {
    const newItem: NewsItem = { ...data, id: Date.now() };
    update(prev => ({ ...prev, news: [newItem, ...prev.news] }));
    addAuditEntry('Создание новости', 'Новости', `Опубликована новость: "${data.title}"`);
  }, [update, addAuditEntry]);

  const updateNews = useCallback((id: number, data: Partial<Omit<NewsItem, 'id'>>) => {
    update(prev => ({ ...prev, news: prev.news.map(n => n.id === id ? { ...n, ...data } : n) }));
    addAuditEntry('Редактирование новости', 'Новости', `Обновлена новость (ID: ${id})`);
  }, [update, addAuditEntry]);

  const deleteNews = useCallback((id: number) => {
    const item = state.news.find(n => n.id === id);
    update(prev => ({ ...prev, news: prev.news.filter(n => n.id !== id) }));
    if (item) addAuditEntry('Удаление новости', 'Новости', `Удалена новость: "${item.title}"`);
  }, [state.news, update, addAuditEntry]);

  // ─── EVENTS ───────────────────────────────────────────────
  const addEvent = useCallback((data: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...data, id: Date.now() };
    update(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    addAuditEntry('Создание события', 'Календарь', `Добавлено событие: "${data.title}"`);
  }, [update, addAuditEntry]);

  const updateEvent = useCallback((id: number, data: Partial<Omit<CalendarEvent, 'id'>>) => {
    update(prev => ({ ...prev, events: prev.events.map(e => e.id === id ? { ...e, ...data } : e) }));
  }, [update]);

  const deleteEvent = useCallback((id: number) => {
    const ev = state.events.find(e => e.id === id);
    update(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
    if (ev) addAuditEntry('Удаление события', 'Календарь', `Удалено событие: "${ev.title}"`);
  }, [state.events, update, addAuditEntry]);

  // ─── REGISTRATIONS ────────────────────────────────────────
  const addRegistration = useCallback((data: Omit<PendingRegistration, 'id' | 'status' | 'submittedAt'>) => {
    const now = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
    const reg: PendingRegistration = { ...data, id: Date.now(), status: 'pending', submittedAt: now };
    update(prev => ({ ...prev, registrations: [reg, ...prev.registrations] }));
  }, [update]);

  const updateRegistrationStatus = useCallback((id: number, status: RegistrationStatus, comment?: string) => {
    const reg = state.registrations.find(r => r.id === id);
    update(prev => ({
      ...prev,
      registrations: prev.registrations.map(r => r.id === id ? { ...r, status, comment } : r),
    }));
    if (reg) {
      const label = status === 'approved' ? 'Одобрение регистрации' : 'Отклонение регистрации';
      addAuditEntry(label, 'Регистрации', `${label}: ${reg.lastName} ${reg.firstName} (${reg.class} класс)`);
      // If approved, automatically create a user account
      if (status === 'approved') {
        const nameParts = [reg.lastName, reg.firstName, reg.middleName].filter(Boolean);
        const fullName = nameParts.join(' ');
        const newUser: SystemUser = {
          id: Date.now(),
          name: fullName,
          email: reg.email,
          password: 'student123',
          role: 'student',
          class: reg.class,
          status: 'active',
          lastLogin: 'Ещё не заходил',
          studentId: Date.now() + 1,
        };
        const newStudent: StudentProfile = {
          id: newUser.studentId!,
          userId: newUser.id,
          lastName: reg.lastName,
          firstName: reg.firstName,
          middleName: reg.middleName,
          class: reg.class,
        };
        update(prev => ({
          ...prev,
          users: [...prev.users, newUser],
          students: [...prev.students, newStudent],
          registrations: prev.registrations.map(r => r.id === id ? { ...r, status, comment } : r),
        }));
      }
    }
  }, [state.registrations, update, addAuditEntry]);

  const value: AppContextType = {
    currentUser,
    login,
    logout,
    users: state.users,
    addUser,
    updateUser,
    deleteUser,
    students: state.students,
    getStudent,
    achievements: state.achievements,
    getStudentAchievements,
    getPendingAchievements,
    addAchievement,
    updateAchievementStatus,
    deleteAchievement,
    sections: state.sections,
    sectionApplications: state.sectionApplications,
    sectionMembers: state.sectionMembers,
    addSection,
    updateSection,
    deleteSection,
    applyToSection,
    updateSectionAppStatus,
    getStudentSections,
    getSectionMembersCount,
    isStudentMember,
    hasApplied,
    news: state.news,
    addNews,
    updateNews,
    deleteNews,
    events: state.events,
    addEvent,
    updateEvent,
    deleteEvent,
    auditLog: state.auditLog,
    addAuditEntry,
    registrations: state.registrations,
    addRegistration,
    updateRegistrationStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────
function shortName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  return `${parts[0]} ${parts[1]?.[0] ?? ''}.${parts[2]?.[0] ? parts[2][0] + '.' : ''}`.trim();
}

function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Администратор' : role === 'curator' ? 'Куратор' : 'Ученик';
}
