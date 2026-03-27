import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Download, User, Shield, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendState } from '@/app/backend/store';

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



export function AuditLogScreen() {
  const { auditLogs } = useBackendState();
  const logs = useMemo(() => (Array.isArray(auditLogs) ? auditLogs : []), [auditLogs]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (!log || typeof log !== 'object') return false;
    const userText = String(log.user ?? '').toLowerCase();
    const detailsText = String(log.details ?? '').toLowerCase();
    const actionText = String(log.action ?? '');
    const matchesSearch =
      searchQuery === '' ||
      userText.includes(searchQuery.toLowerCase()) ||
      detailsText.includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || log.userRole === filterRole;
    const matchesAction = filterAction === 'all' || actionText.includes(filterAction);
    return matchesSearch && matchesRole && matchesAction;
  });

  const handleExport = () => {
    // Build CSV
    const header = 'Дата и время;Пользователь;Роль;Действие;Раздел;Детали\n';
    const rows = filteredLogs.map(l =>
      `${l.timestamp};${l.user};${l.userRole};${l.action};${l.entity};"${l.details}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Экспортировано ${filteredLogs.length} записей журнала`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-600" />;
      case 'curator': return <User className="w-4 h-4 text-blue-600" />;
      case 'student': return <GraduationCap className="w-4 h-4 text-green-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-600">Администратор</Badge>;
      case 'curator': return <Badge className="bg-blue-600">Куратор</Badge>;
      case 'student': return <Badge className="bg-green-600">Ученик</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Журнал действий</h2>
        <p className="text-gray-600">Полный аудит всех действий в системе</p>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по пользователю или действию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
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
                <SelectItem value="Вход">Вход в систему</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Всего записей</p>
            <p className="text-2xl font-semibold text-gray-900">{auditLog.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Действий админов</p>
                <p className="text-2xl font-semibold text-red-700">
                  {auditLog.filter((l) => l.userRole === 'admin').length}
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
                  {auditLog.filter((l) => l.userRole === 'curator').length}
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
                  {auditLog.filter((l) => l.userRole === 'student').length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>История действий ({filteredLogs.length})</CardTitle>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Экспорт CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-44">Дата и время</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead className="w-36">Роль</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead className="w-32">Раздел</TableHead>
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
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap">{log.timestamp}</TableCell>
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
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
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
