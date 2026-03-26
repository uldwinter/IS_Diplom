import { ReactNode } from 'react';
import { Home, Award, TrendingUp, User, Calendar, Newspaper, Users } from 'lucide-react';
import { NotificationCenter } from '@/app/components/notifications/NotificationCenter';

interface StudentLayoutProps {
  children: ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  userId?: number;
}

export function StudentLayout({ children, currentScreen, onNavigate, onLogout, userId }: StudentLayoutProps) {
  const menuItems = [
    { id: 'main', label: 'Главная', icon: Home },
    { id: 'my-achievements', label: 'Мои достижения', icon: Award },
    { id: 'sections', label: 'Секции и кружки', icon: Users }, // Re-using User icon or finding better one
    { id: 'rating', label: 'Рейтинг', icon: TrendingUp },
    { id: 'portfolio', label: 'Моё портфолио', icon: User },
    { id: 'calendar', label: 'Календарь событий', icon: Calendar },
    { id: 'news', label: 'Новости', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковое меню */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Личный кабинет</h2>
          <p className="text-xs text-gray-500 mt-1">Ученик</p>
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
                        ? 'bg-green-50 text-green-700'
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
            <NotificationCenter userRole="student" userId={userId} />
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