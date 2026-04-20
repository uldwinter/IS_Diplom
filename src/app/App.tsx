import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { AppProvider } from '@/app/lib/AppContext';
import { SectionsProvider } from '@/app/components/sections/SectionsContext';

import { LoginScreen } from '@/app/components/LoginScreen';
import { StudentRegistrationScreen } from '@/app/components/registration/StudentRegistrationScreen';

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
import { CuratorSectionsScreen } from '@/app/components/sections/CuratorSectionsScreen';

// Student
import { StudentLayout } from '@/app/components/layouts/StudentLayout';
import { StudentMainScreen } from '@/app/components/student/StudentMainScreen';
import { StudentAchievementsManagement } from '@/app/components/student/StudentAchievementsManagement';
import { StudentSectionsScreen } from '@/app/components/sections/StudentSectionsScreen';

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
import { UserRecord, getCurrentUser, logout as backendLogout } from '@/app/backend/store';
import { ensureFrontendSeedData } from '@/app/backend/runtimeSeed';

type AppState = 'login' | 'student-registration' | 'app';
type UserRole = 'admin' | 'curator' | 'student' | null;
type Screen = string;

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [appState, setAppState] = useState<AppState>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const resolvedCurrentUser = getCurrentUser();

  useEffect(() => {
    if (ensureFrontendSeedData()) {
      window.location.reload();
      return;
    }

    const restored = getCurrentUser();
    if (restored) {
      setUserRole(restored.role);
      setAppState('app');
      setCurrentScreen('main');
    }
  }, []);

  const handleLogin = (user: UserRecord) => {
    setUserRole(user.role);
    setCurrentScreen('main');
    setAppState('app');
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
    setAppState('login');
    setUserRole(null);
    backendLogout();
    setCurrentScreen('main');
    setSelectedStudentId(null);
  };

  // Login screen
  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} onOpenRegistration={() => setAppState('student-registration')} />;
  }

  if (appState === 'student-registration') {
    return <StudentRegistrationScreen onBackToLogin={() => setAppState('login')} />;
  }

  // Admin interface
  if (userRole === 'admin') {
    return (
      <AdminLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} userId={resolvedCurrentUser?.id}>
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

  // ── Curator ──────────────────────────────────────────────────
  if (userRole === 'curator') {
    return (
      <CuratorLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} userId={resolvedCurrentUser?.id}>
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

  // ── Student ──────────────────────────────────────────────────
  if (userRole === 'student') {
    return (
      <StudentLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout} userId={resolvedCurrentUser?.id}>
        {currentScreen === 'main' && <StudentMainScreen onNavigate={handleNavigate} />}
        {currentScreen === 'sections' && <StudentSectionsScreen />}
        {currentScreen === 'my-achievements' && resolvedCurrentUser && <StudentAchievementsManagement studentUserId={resolvedCurrentUser.id} />}
        {currentScreen === 'rating' && <EnhancedRatingScreen />}
        {currentScreen === 'portfolio' && <StudentPortfolioScreen />}
        {currentScreen === 'calendar' && <EventsCalendarScreen />}
        {currentScreen === 'news' && <NewsAndAnnouncementsScreen canEdit={false} />}
      </StudentLayout>
    );
  }

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <SectionsProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </SectionsProvider>
    </AppProvider>
  );
}
