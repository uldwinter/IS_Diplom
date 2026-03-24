import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, Database, Settings as SettingsIcon, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendState } from '@/app/backend/store';

interface AdminMainScreenProps {
  onNavigate: (screen: string) => void;
}

export function AdminMainScreen({ onNavigate }: AdminMainScreenProps) {
  const backendState = useBackendState();
  const { users, achievements, registrations, auditLogs } = backendState;

  const stats = useMemo(() => [
    { label: 'Всего пользователей', value: String(users.length), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Записей достижений', value: String(achievements.length), icon: Database, color: 'bg-green-50 text-green-600' },
    { label: 'Активных кураторов', value: String(users.filter((u) => u.role === 'curator' && u.status === 'active').length), icon: Shield, color: 'bg-purple-50 text-purple-600' },
    { label: 'Ожидают регистрации', value: String(registrations.filter((r) => r.status === 'pending').length), icon: SettingsIcon, color: 'bg-orange-50 text-orange-600' },
  ], [users, achievements, registrations]);

  const recentActivity = auditLogs.slice(0, 6).map((l) => ({ id: l.id, action: `${l.action}: ${l.details}`, time: l.timestamp }));

  const handleBackup = () => {
    const payload = { ...backendState, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Резервная копия создана и скачана');
  };

  return (
    <div className="space-y-8">
      <div><h2 className="text-2xl text-gray-900 mb-2">Панель администратора</h2><p className="text-gray-600">Управление системой и пользователями</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{stats.map((stat) => { const Icon = stat.icon; return <Card key={stat.label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-gray-600">{stat.label}</CardTitle><div className={`p-2 rounded-md ${stat.color}`}><Icon className="w-4 h-4" /></div></CardHeader><CardContent><div className="text-2xl text-gray-900">{stat.value}</div></CardContent></Card>; })}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Системная информация</CardTitle></CardHeader><CardContent><div className="space-y-3 text-sm"><div className="flex justify-between items-center p-3 bg-gray-50 rounded-md"><span className="text-gray-600">Версия системы</span><span className="font-medium text-gray-900">2.2.0</span></div><div className="flex justify-between items-center p-3 bg-gray-50 rounded-md"><span className="text-gray-600">Статус базы данных</span><span className="font-medium text-green-600">Активна</span></div><div className="flex justify-between items-center p-3 bg-gray-50 rounded-md"><span className="text-gray-600">Журнал аудита</span><span className="font-medium text-gray-900">{auditLogs.length} записей</span></div><div className="flex justify-between items-center p-3 bg-gray-50 rounded-md"><span className="text-gray-600">Последний бэкап</span><span className="font-medium text-gray-900">По требованию</span></div></div></CardContent></Card><Card><CardHeader><CardTitle>Последняя активность</CardTitle></CardHeader><CardContent><div className="space-y-3">{recentActivity.length === 0 ? <p className="text-sm text-gray-500">Пока нет активностей</p> : recentActivity.map((activity) => <div key={activity.id} className="border-l-2 border-blue-600 pl-3"><p className="text-sm text-gray-900">{activity.action}</p><p className="text-xs text-gray-500 mt-1">{activity.time}</p></div>)}</div></CardContent></Card></div>
      <Card><CardHeader><CardTitle>Быстрые действия</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><button onClick={() => onNavigate('users')} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"><Users className="w-6 h-6 text-blue-600 mb-2" /><p className="text-sm font-medium text-gray-900">Управление пользователями</p></button><button onClick={() => onNavigate('settings')} className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left"><SettingsIcon className="w-6 h-6 text-green-600 mb-2" /><p className="text-sm font-medium text-gray-900">Настройки оценивания</p></button><button onClick={handleBackup} className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left"><Database className="w-6 h-6 text-purple-600 mb-2" /><p className="text-sm font-medium text-gray-900">Резервное копирование</p></button><button onClick={() => onNavigate('audit-log')} className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-colors text-left"><Shield className="w-6 h-6 text-orange-600 mb-2" /><p className="text-sm font-medium text-gray-900">Безопасность</p></button></div></CardContent></Card>
    </div>
  );
}
