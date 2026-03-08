import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';

const getStatusBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Одобрено</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-600 gap-1"><Clock className="w-3 h-3" /> На проверке</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-600 gap-1"><XCircle className="w-3 h-3" /> Отклонено</Badge>;
  return null;
};

export function AchievementsListScreen() {
  const { achievements, students } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = achievements.filter((a) => {
    const matchesSearch =
      searchQuery === '' ||
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesClass = classFilter === 'all' || a.studentClass === classFilter;
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesClass && matchesCategory;
  });

  const uniqueClasses = Array.from(new Set(achievements.map((a) => a.studentClass))).sort();
  const uniqueCategories = Array.from(new Set(achievements.map((a) => a.category)));

  const stats = {
    total: achievements.length,
    approved: achievements.filter((a) => a.status === 'approved').length,
    pending: achievements.filter((a) => a.status === 'pending').length,
    rejected: achievements.filter((a) => a.status === 'rejected').length,
    totalPoints: achievements.filter((a) => a.status === 'approved').reduce((s, a) => s + a.points, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Достижения учащихся</h2>
        <p className="text-gray-600">Сводный реестр всех достижений в системе</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Всего</p><p className="text-2xl font-semibold text-gray-900">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Одобрено</p><p className="text-2xl font-semibold text-green-700">{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">На проверке</p><p className="text-2xl font-semibold text-yellow-700">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Отклонено</p><p className="text-2xl font-semibold text-red-700">{stats.rejected}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Баллов выдано</p><p className="text-2xl font-semibold text-blue-700">{stats.totalPoints}</p></CardContent></Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по ФИО или достижению..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="approved">Одобрено</SelectItem>
                <SelectItem value="pending">На проверке</SelectItem>
                <SelectItem value="rejected">Отклонено</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Класс" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все классы</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Список достижений ({filtered.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Учащийся</TableHead>
                  <TableHead>Достижение</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Уровень</TableHead>
                  <TableHead className="text-center">Баллы</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      Достижения не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.studentName}</p>
                          <p className="text-xs text-gray-500">{item.studentClass} класс</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.result}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{item.category}</TableCell>
                      <TableCell className="text-sm text-gray-600">{item.level}</TableCell>
                      <TableCell className="text-center font-semibold text-blue-700">{item.points}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{item.date}</TableCell>
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
