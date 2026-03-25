// ============================================================
// GLOBAL TYPE DEFINITIONS — Банк достижений МАОУ ОЦ2
// ============================================================

export type UserRole = 'admin' | 'curator' | 'student';
export type AchievementStatus = 'pending' | 'approved' | 'rejected';
export type SectionAppStatus = 'pending' | 'approved' | 'rejected';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

// ─── Users ───────────────────────────────────────────────────
export interface SystemUser {
  id: number;
  name: string;
  email: string;
  password: string; // plain-text for prototype
  role: UserRole;
  studentId?: number; // linked StudentProfile id (for students)
  class?: string;     // for students
  status: 'active' | 'inactive';
  lastLogin: string;
}

// ─── Students ────────────────────────────────────────────────
export interface StudentProfile {
  id: number;
  userId: number;
  lastName: string;
  firstName: string;
  middleName: string;
  class: string;
}

// ─── Achievements ─────────────────────────────────────────────
export interface Achievement {
  id: number;
  studentId: number;
  studentName: string;
  studentClass: string;
  name: string;
  category: string;
  level: string;
  result: string;
  points: number;
  status: AchievementStatus;
  date: string;        // date of achievement event
  submittedDate: string;
  documents: string[];
  description?: string;
  comment?: string;    // curator comment on rejection/approval
  reviewedBy?: string;
  reviewedAt?: string;
}

// ─── Sections (Кружки / Секции) ───────────────────────────────
export interface Section {
  id: string;
  name: string;
  category: 'sport' | 'science' | 'art' | 'social';
  description: string;
  schedule: string;
  location: string;
  teacher: string;
  capacity: number;
}

export interface SectionApplication {
  id: string;
  studentId: number;
  studentName: string;
  studentClass: string;
  sectionId: string;
  status: SectionAppStatus;
  date: string;
}

export interface SectionMember {
  sectionId: string;
  studentId: number;
}

// ─── News ─────────────────────────────────────────────────────
export interface NewsItem {
  id: number;
  title: string;
  content: string;
  author: string;
  authorRole: 'admin' | 'curator';
  date: string;
  category: string;
  pinned: boolean;
}

// ─── Calendar Events ──────────────────────────────────────────
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  type: 'olympiad' | 'competition' | 'event' | 'deadline' | 'meeting';
  description?: string;
}

// ─── Audit Log ────────────────────────────────────────────────
export interface AuditLogEntry {
  id: number;
  timestamp: string;
  userId: number;
  user: string;
  userRole: UserRole;
  action: string;
  entity: string;
  details: string;
}

// ─── Pending Registrations ────────────────────────────────────
export interface PendingRegistration {
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
  submittedAt: string;
  status: RegistrationStatus;
  comment?: string;
}

// ─── App State snapshot (persisted to localStorage) ───────────
export interface PersistedState {
  users: SystemUser[];
  students: StudentProfile[];
  achievements: Achievement[];
  sections: Section[];
  sectionApplications: SectionApplication[];
  sectionMembers: SectionMember[];
  news: NewsItem[];
  events: CalendarEvent[];
  auditLog: AuditLogEntry[];
  registrations: PendingRegistration[];
}
