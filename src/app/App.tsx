import { useState } from 'react';
import { Toaster } from 'sonner';
import { LoginScreen } from '@/app/components/LoginScreen';
import { RoleSelectionScreen } from '@/app/components/RoleSelectionScreen';

// Admin components
import { AdminLayout } from '@/app/components/layouts/AdminLayout';
import { AdminMainScreen } from '@/app/components/admin/AdminMainScreen';
import { AdminUsersScreen } from '@/app/components/admin/AdminUsersScreen';
import { AuditLogScreen } from '@/app/components/admin/AuditLogScreen';

// Curator components
import { CuratorLayout } from '@/app/components/layouts/CuratorLayout';
import { CuratorMainScreen } from '@/app/components/curator/CuratorMainScreen';
import { CuratorRequestsScreen } from '@/app/components/curator/CuratorRequestsScreen';
import { PendingRegistrationsScreen } from '@/app/components/curator/PendingRegistrationsScreen';

// Student components
import { StudentLayout } from '@/app/components/layouts/StudentLayout';
import { StudentMainScreen } from '@/app/components/student/StudentMainScreen';
import { StudentAchievementsManagement } from '@/app/components/student/StudentAchievementsManagement';

// Shared components
import { MainScreen } from '@/app/components/MainScreen';
import { StudentsScreen } from '@/app/components/StudentsScreen';
import { StudentAchievementsScreen } from '@/app/components/StudentAchievementsScreen';
import { ReportsScreen } from '@/app/components/ReportsScreen';
import { SettingsScreen } from '@/app/components/SettingsScreen';
import { RatingScreen } from '@/app/components/RatingScreen';
import { EnhancedRatingScreen } from '@/app/components/rating/EnhancedRatingScreen';
import { AnalyticsScreen } from '@/app/components/analytics/AnalyticsScreen';
import { StudentPortfolioScreen } from '@/app/components/portfolio/StudentPortfolioScreen';
import { EventsCalendarScreen } from '@/app/components/calendar/EventsCalendarScreen';
import { VisualCalendarScreen } from '@/app/components/calendar/VisualCalendarScreen';
import { NewsAndAnnouncementsScreen } from '@/app/components/news/NewsAndAnnouncementsScreen';

import { SectionsProvider } from '@/app/components/sections/SectionsContext';
import { StudentSectionsScreen } from '@/app/components/sections/StudentSectionsScreen';
import { CuratorSectionsScreen } from '@/app/components/sections/CuratorSectionsScreen';
import { AchievementsListScreen } from '@/app/components/AchievementsListScreen';

type AppState = 'login' | 'role-selection' | 'app';
type UserRole = 'admin' | 'curator' | 'student' | null;
type Screen = string;

function AppContent() {
  const [appState, setAppState] = useState<AppState>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleLogin = () => {
    setAppState('role-selection');
  };

  const handleSelectRole = (role: 'admin' | 'curator' | 'student') => {
    setUserRole(role);
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
    setCurrentScreen('main');
    setSelectedStudentId(null);
  };

  // Login screen
  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Role selection screen
  if (appState === 'role-selection') {
    return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
  }

  // Admin interface
  if (userRole === 'admin') {
    return (
      <AdminLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout}>
        {currentScreen === 'main' && <AdminMainScreen onNavigate={handleNavigate} />}
        {currentScreen === 'users' && <AdminUsersScreen />}
        {currentScreen === 'students' && <StudentsScreen onViewStudent={handleViewStudent} />}
        {currentScreen === 'student-achievements' && selectedStudentId && (
          <StudentAchievementsScreen
            studentId={selectedStudentId}
            onBack={handleBackToStudents}
          />
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

  // Curator interface
  if (userRole === 'curator') {
    return (
      <CuratorLayout currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={handleLogout}>
        {currentScreen === 'main' && <CuratorMainScreen onNavigate={handleNavigate} />}
        {currentScreen === 'sections' && <CuratorSectionsScreen />}
        {currentScreen === 'requests' && <CuratorRequestsScreen />}
        {currentScreen === 'registrations' && <PendingRegistrationsScreen />}
        {currentScreen === 'students' && <StudentsScreen onViewStudent={handleViewStudent} />}
        {currentScreen === 'student-achievements' && selectedStudentId && (
          <StudentAchievementsScreen
            studentId={selectedStudentId}
            onBack={handleBackToStudents}
          />
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

  // Student interface
  if (userRole === 'student') {
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

export default function App() {
  return (
    <SectionsProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </SectionsProvider>
  );
}