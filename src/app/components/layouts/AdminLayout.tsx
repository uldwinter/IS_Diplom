import { ReactNode } from 'react';
import { Home, Users, Award, TrendingUp, FileText, Settings, Shield, History, BarChart3, Calendar, Newspaper } from 'lucide-react';
import { NotificationCenter } from '@/app/components/notifications/NotificationCenter';

interface AdminLayoutProps {
  children: ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  userId?: number;
}

export function AdminLayout({ children, currentScreen, onNavigate, onLogout, userId }: AdminLayoutProps) {
  const menuItems = [
    { id: 'main', label: 'Главная', icon: Home },
    { id: 'users', label: 'Пользователи', icon: Shield },
    { id: 'students', label: 'Учащиеся', icon: Users },
    { id: 'achievements', label: 'Достижения', icon: Award },
    { id: 'rating', label: 'Рейтинг', icon: TrendingUp },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'news', label: 'Новости и объявления', icon: Newspaper },
    { id: 'reports', label: 'Отчеты', icon: FileText },
    { id: 'audit-log', label: 'Журнал действий', icon: History },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковое меню */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Панель администратора</h2>
          <p className="text-xs text-gray-500 mt-1">Полный доступ</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Верхняя панель */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-gray-900 font-semibold truncate max-w-3xl">
              Банк достижений учащихся МАОУ ОЦ2 города Челябинск
            </h1>
            <NotificationCenter userRole="admin" userId={userId} />
          </div>
        </header>

        {/* Контент страницы */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}