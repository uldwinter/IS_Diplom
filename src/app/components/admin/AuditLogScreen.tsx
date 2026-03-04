import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Filter, Download, User, Shield, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  userRole: 'admin' | 'curator' | 'student';
  action: string;
  entity: string;
  details: string;
  ipAddress?: string;
}

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 1, timestamp: '25.01.2026 14:30:25', user: 'Администратор', userRole: 'admin', action: 'Создание пользователя', entity: 'Пользователи', details: 'Создан новый аккаунт куратора: Смирнова Е.В.', ipAddress: '192.168.1.100' },
  { id: 2, timestamp: '25.01.2026 14:15:10', user: 'Куратор Иванова М.П.', userRole: 'curator', action: 'Одобрение заявки', entity: 'Достижения', details: 'Одобрена заявка Иванова И.И. на достижение "Всероссийская олимпиада по математике"' },
  { id: 3, timestamp: '25.01.2026 13:45:33', user: 'Иванов Иван Иванович', userRole: 'student', action: 'Создание заявки', entity: 'Достижения', details: 'Создана заявка на достижение "Всероссийская олимпиада по математике"' },
  { id: 4, timestamp: '25.01.2026 13:20:15', user: 'Куратор Петров А.В.', userRole: 'curator', action: 'Отклонение заявки', entity: 'Достижения', details: 'Отклонена заявка Сидорова А.П. - требуется справка от руководителя' },
  { id: 5, timestamp: '25.01.2026 12:00:00', user: 'Администратор', userRole: 'admin', action: 'Обновление настроек', entity: 'Система', details: 'Обновлена система оценивания достижений' },
  { id: 6, timestamp: '25.01.2026 11:30:45', user: 'Петрова Мария Сергеевна', userRole: 'student', action: 'Редактирование профиля', entity: 'Профиль', details: 'Обновлена контактная информация' },
  { id: 7, timestamp: '25.01.2026 10:15:22', user: 'Администратор', userRole: 'admin', action: 'Создание резервной копии', entity: 'Система', details: 'Создана резервная копия базы данных (2.4 ГБ)' },
  { id: 8, timestamp: '25.01.2026 09:45:10', user: 'Куратор Иванова М.П.', userRole: 'curator', action: 'Одобрение заявки', entity: 'Достижения', details: 'Одобрена заявка Новикова Д.А. на достижение "Защита проекта по информатике"' },
];

export function AuditLogScreen() {
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || log.userRole === filterRole;
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction);
    return matchesSearch && matchesRole && matchesAction;
  });

  const handleExport = () => {
    toast.success(`Экспортировано ${filteredLogs.length} записей журнала`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'curator':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600">Администратор</Badge>;
      case 'curator':
        return <Badge className="bg-blue-600">Куратор</Badge>;
      case 'student':
        return <Badge className="bg-green-600">Ученик</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Журнал действий</h2>
        <p className="text-gray-600">Полный аудит всех действий в системе</p>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по пользователю или действию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Роль пользователя" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="curator">Куратор</SelectItem>
                <SelectItem value="student">Ученик</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Тип действия" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все действия</SelectItem>
                <SelectItem value="Создание">Создание</SelectItem>
                <SelectItem value="Одобрение">Одобрение</SelectItem>
                <SelectItem value="Отклонение">Отклонение</SelectItem>
                <SelectItem value="Редактирование">Редактирование</SelectItem>
                <SelectItem value="Удаление">Удаление</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Действий админов</p>
                <p className="text-2xl font-semibold text-red-700">
                  {logs.filter((l) => l.userRole === 'admin').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Действий кураторов</p>
                <p className="text-2xl font-semibold text-blue-700">
                  {logs.filter((l) => l.userRole === 'curator').length}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Действий учеников</p>
                <p className="text-2xl font-semibold text-green-700">
                  {logs.filter((l) => l.userRole === 'student').length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица логов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>История действий ({filteredLogs.length})</CardTitle>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Экспортировать
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-40">Дата и время</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead className="w-32">Роль</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Раздел</TableHead>
                  <TableHead>Детали</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Нет записей, соответствующих фильтрам
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(log.userRole)}
                          <span className="text-sm font-medium text-gray-900">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(log.userRole)}</TableCell>
                      <TableCell className="text-sm text-gray-900">{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.entity}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-md truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}