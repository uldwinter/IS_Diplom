import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, Database, Settings as SettingsIcon, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface AdminMainScreenProps {
  onNavigate: (screen: string) => void;
}

export function AdminMainScreen({ onNavigate }: AdminMainScreenProps) {
  const stats = [
    { label: 'Всего пользователей', value: '523', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Записей в базе', value: '1,247', icon: Database, color: 'bg-green-50 text-green-600' },
    { label: 'Активных кураторов', value: '8', icon: Shield, color: 'bg-purple-50 text-purple-600' },
    { label: 'Модулей системы', value: '12', icon: SettingsIcon, color: 'bg-orange-50 text-orange-600' },
  ];

  const recentActivity = [
    { id: 1, action: 'Создан новый пользователь: Смирнова Е.В. (Куратор)', time: '10:30', type: 'user' },
    { id: 2, action: 'Обновлена система оценивания достижений', time: '11:15', type: 'system' },
    { id: 3, action: 'Сформирован отчёт по 10-1 классу', time: '12:00', type: 'report' },
    { id: 4, action: 'Изменены настройки доступа', time: '14:30', type: 'settings' },
  ];

  const handleBackup = () => {
    toast.success('Резервная копия создаётся... Готово! (2.4 ГБ)', { duration: 3000 });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Панель администратора</h2>
        <p className="text-gray-600">Управление системой и пользователями</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">{stat.label}</CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Системная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Системная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Версия системы</span>
                <span className="font-medium text-gray-900">2.1.5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Статус базы данных</span>
                <span className="font-medium text-green-600">Активна</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Последнее обновление</span>
                <span className="font-medium text-gray-900">15.01.2026</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Использование хранилища</span>
                <span className="font-medium text-gray-900">2.4 ГБ / 10 ГБ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-blue-600 pl-3">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('users')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Управление пользователями</p>
              <p className="text-xs text-gray-500 mt-1">Добавить, изменить, удалить</p>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left">
              <SettingsIcon className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Настройки оценивания</p>
              <p className="text-xs text-gray-500 mt-1">Баллы за достижения</p>
            </button>

            <button
              onClick={handleBackup}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left">
              <Database className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Резервное копирование</p>
              <p className="text-xs text-gray-500 mt-1">Создать копию данных</p>
            </button>

            <button
              onClick={() => onNavigate('audit-log')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-colors text-left">
              <Shield className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Безопасность</p>
              <p className="text-xs text-gray-500 mt-1">Журнал действий</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Уведомления */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <SettingsIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Рекомендуется обновление системы</p>
              <p className="text-sm text-gray-600 mt-1">
                Доступна новая версия 2.2.0 с улучшениями производительности и безопасности
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}