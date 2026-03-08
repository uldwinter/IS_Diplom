import { useState } from 'react';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from '@/app/lib/AppContext';
import type { SystemUser } from '@/app/lib/types';

import { LoginScreen } from '@/app/components/LoginScreen';

// Admin
import { AdminLayout } from '@/app/components/layouts/AdminLayout';
import { AdminMainScreen } from '@/app/components/admin/AdminMainScreen';
import { AdminUsersScreen } from '@/app/components/admin/AdminUsersScreen';
import { AuditLogScreen } from '@/app/components/admin/AuditLogScreen';

// Curator
import { CuratorLayout } from '@/app/components/layouts/CuratorLayout';
import { CuratorMainScreen } from '@/app/components/curator/CuratorMainScreen';
import { CuratorRequestsScreen } from '@/app/components/curator/CuratorRequestsScreen';
import { PendingRegistrationsScreen } from '@/app/components/curator/PendingRegistrationsScreen';

// Student
import { StudentLayout } from '@/app/components/layouts/StudentLayout';
import { StudentMainScreen } from '@/app/components/student/StudentMainScreen';
import { StudentAchievementsManagement } from '@/app/components/student/StudentAchievementsManagement';

// Shared screens
import { StudentsScreen } from '@/app/components/StudentsScreen';
import { StudentAchievementsScreen } from '@/app/components/StudentAchievementsScreen';
import { ReportsScreen } from '@/app/components/ReportsScreen';
import { SettingsScreen } from '@/app/components/SettingsScreen';
import { EnhancedRatingScreen } from '@/app/components/rating/EnhancedRatingScreen';
import { AnalyticsScreen } from '@/app/components/analytics/AnalyticsScreen';
import { StudentPortfolioScreen } from '@/app/components/portfolio/StudentPortfolioScreen';
import { VisualCalendarScreen } from '@/app/components/calendar/VisualCalendarScreen';
import { EventsCalendarScreen } from '@/app/components/calendar/EventsCalendarScreen';
import { NewsAndAnnouncementsScreen } from '@/app/components/news/NewsAndAnnouncementsScreen';
import { AchievementsListScreen } from '@/app/components/AchievementsListScreen';
import { CuratorSectionsScreen } from '@/app/components/sections/CuratorSectionsScreen';
import { StudentSectionsScreen } from '@/app/components/sections/StudentSectionsScreen';

type Screen = string;

function AppContent() {
  const { currentUser, logout, addAuditEntry } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleLogin = (user: SystemUser) => {
    addAuditEntry('Вход в систему', 'Сессия', `Пользователь ${user.name} (${roleLabel(user.role)}) вошёл в систему`);
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
    setSelectedStudentId(null);
  };

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentScreen('student-achievements');
  };

  const handleBackToStudents = () => {
    setCurrentScreen('students');
    setSelectedStudentId(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('main');
    setSelectedStudentId(null);
  };

  // ── Not logged in ───────────────────────────────────────────
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ── Admin ───────────────────────────────────────────────────
  if (currentUser.role === 'admin') {
    return (
      <AdminLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout}>
        {currentScreen === 'main' && <AdminMainScreen onNavigate={handleNavigate} />}
        {currentScreen === 'users' && <AdminUsersScreen />}
        {currentScreen === 'students' && <StudentsScreen onViewStudent={handleViewStudent} />}
        {currentScreen === 'student-achievements' && selectedStudentId && (
          <StudentAchievementsScreen studentId={selectedStudentId} onBack={handleBackToStudents} />
        )}
        {currentScreen === 'achievements' && <AchievementsListScreen />}
        {currentScreen === 'rating' && <EnhancedRatingScreen />}
        {currentScreen === 'analytics' && <AnalyticsScreen />}
        {currentScreen === 'calendar' && <VisualCalendarScreen userRole="admin" />}
        {currentScreen === 'news' && <NewsAndAnnouncementsScreen canEdit={true} />}
        {currentScreen === 'reports' && <ReportsScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'audit-log' && <AuditLogScreen />}
      </AdminLayout>
    );
  }

  // ── Curator ─────────────────────────────────────────────────
  if (currentUser.role === 'curator') {
    return (
      <CuratorLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout}>
        {currentScreen === 'main' && <CuratorMainScreen onNavigate={handleNavigate} />}
        {currentScreen === 'sections' && <CuratorSectionsScreen />}
        {currentScreen === 'requests' && <CuratorRequestsScreen />}
        {currentScreen === 'registrations' && <PendingRegistrationsScreen />}
        {currentScreen === 'students' && <StudentsScreen onViewStudent={handleViewStudent} />}
        {currentScreen === 'student-achievements' && selectedStudentId && (
          <StudentAchievementsScreen studentId={selectedStudentId} onBack={handleBackToStudents} />
        )}
        {currentScreen === 'achievements' && <AchievementsListScreen />}
        {currentScreen === 'rating' && <EnhancedRatingScreen />}
        {currentScreen === 'analytics' && <AnalyticsScreen />}
        {currentScreen === 'calendar' && <VisualCalendarScreen userRole="curator" />}
        {currentScreen === 'news' && <NewsAndAnnouncementsScreen canEdit={true} />}
        {currentScreen === 'reports' && <ReportsScreen />}
      </CuratorLayout>
    );
  }

  // ── Student ─────────────────────────────────────────────────
  if (currentUser.role === 'student') {
    return (
      <StudentLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout}>
        {currentScreen === 'main' && <StudentMainScreen onNavigate={handleNavigate} />}
        {currentScreen === 'sections' && <StudentSectionsScreen />}
        {currentScreen === 'my-achievements' && <StudentAchievementsManagement />}
        {currentScreen === 'rating' && <EnhancedRatingScreen />}
        {currentScreen === 'portfolio' && <StudentPortfolioScreen />}
        {currentScreen === 'calendar' && <EventsCalendarScreen />}
        {currentScreen === 'news' && <NewsAndAnnouncementsScreen canEdit={false} />}
      </StudentLayout>
    );
  }

  return null;
}

function roleLabel(role: string) {
  return role === 'admin' ? 'Администратор' : role === 'curator' ? 'Куратор' : 'Ученик';
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
