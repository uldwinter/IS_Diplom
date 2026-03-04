import { ReactNode } from 'react';
import { Home, Users, Award, FileText, Settings, TrendingUp } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function DashboardLayout({ children, currentScreen, onNavigate }: DashboardLayoutProps) {
  const menuItems = [
    { id: 'main', label: 'Главная', icon: Home },
    { id: 'students', label: 'Учащиеся', icon: Users },
    { id: 'achievements', label: 'Индивидуальные достижения', icon: Award },
    { id: 'rating', label: 'Рейтинг учащихся', icon: TrendingUp },
    { id: 'reports', label: 'Отчеты', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковое меню */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">ИС Учета достижений</h2>
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
                        ? 'bg-blue-50 text-blue-700'
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
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Верхняя панель */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl text-gray-900">
            Информационная система учета индивидуальных достижений учащихся
          </h1>
        </header>

        {/* Контент страницы */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}