import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBackendState } from '@/app/backend/store';

interface CuratorMainScreenProps {
  onNavigate: (screen: string) => void;
}

export function CuratorMainScreen({ onNavigate }: CuratorMainScreenProps) {
  const { achievements, users } = useBackendState();
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const studentsCount = users.filter((u) => u.role === 'student').length;
  const pending = safeAchievements.filter((a) => a.status === 'pending');
  const approved = safeAchievements.filter((a) => a.status === 'approved');
  const rejected = safeAchievements.filter((a) => a.status === 'rejected');
  const today = new Date().toLocaleDateString('ru-RU');
  const approvedToday = approved.filter((a) => a.submittedDate === today || a.date === today);
  const rejectedToday = rejected.filter((a) => a.submittedDate === today || a.date === today);
  const stats = [
    { label: 'Всего заявок', value: String(safeAchievements.length), icon: AlertCircle, color: 'bg-blue-50 text-blue-600' },
    { label: 'На проверке', value: String(pending.length), icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Одобрено сегодня', value: String(approvedToday.length), icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Отклонено сегодня', value: String(rejectedToday.length), icon: XCircle, color: 'bg-red-50 text-red-600' },
  ];

  const recentActions = safeAchievements.slice().sort((a, b) => b.id - a.id).slice(0, 6).map((a) => ({
    id: a.id,
    student: `${a.studentName}, ${a.studentClass}`,
    achievement: a.achievementName,
    action: a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending',
    time: a.submittedDate,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Панель куратора</h2>
        <p className="text-gray-600">Модерация и проверка заявок на достижения</p>
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

      {/* Уведомления */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
                  <p className="font-medium text-gray-900">{pending.length} заявок ожидают проверки</p>
              <p className="text-sm text-gray-600 mt-1">
                Перейдите в раздел "Проверка заявок" для модерации достижений учащихся
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Последние действия */}
      <Card>
        <CardHeader>
          <CardTitle>Последние действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-md">
                <div className="flex items-start gap-3 flex-1">
                  {action.action === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.student}</p>
                    <p className="text-sm text-gray-600">{action.achievement}</p>
                    <p className={`text-xs mt-1 ${action.action === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                      {action.action === 'approved' ? 'Заявка одобрена' : action.action === 'rejected' ? 'Заявка отклонена' : 'Ожидает проверки'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{action.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Инструкции */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Критерии проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Наличие подтверждающих документов (грамоты, сертификаты)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Соответствие достижения заявленной категории и уровню</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Корректность заполнения информации</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Читаемость и подлинность документов</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('requests')}
                className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">Просмотреть новые заявки</p>
                  <p className="text-xs text-gray-500">{pending.length} заявок ожидают</p>
              </button>
              <button
                onClick={() => onNavigate('students')}
                className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">Список учащихся</p>
                <p className="text-xs text-gray-500">Всего в реестре: {studentsCount}</p>
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">Статистика по классам</p>
                <p className="text-xs text-gray-500">Аналитика достижений</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
