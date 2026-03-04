import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

interface AchievementEntry {
  id: number;
  studentName: string;
  studentClass: string;
  achievement: string;
  category: string;
  level: string;
  result: string;
  points: number;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

const ALL_ACHIEVEMENTS: AchievementEntry[] = [
  { id: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', achievement: 'Всероссийская олимпиада по математике', category: 'Учебные', level: 'Региональный', result: 'Призёр', points: 40, status: 'approved', date: '15.01.2026' },
  { id: 2, studentName: 'Иванов Иван Иванович', studentClass: '10-1', achievement: 'Олимпиада по информатике', category: 'Учебные', level: 'Школьный', result: 'Победитель', points: 10, status: 'approved', date: '10.01.2026' },
  { id: 3, studentName: 'Петрова Мария Сергеевна', studentClass: '10-1', achievement: 'Участие в волонтёрской акции', category: 'Внеурочная', level: '-', result: '25 часов', points: 25, status: 'pending', date: '18.01.2026' },
  { id: 4, studentName: 'Сидоров Алексей Петрович', studentClass: '10-2', achievement: 'Защита проекта по информатике', category: 'Проектная', level: '-', result: 'Отлично', points: 40, status: 'pending', date: '19.01.2026' },
  { id: 5, studentName: 'Новиков Дмитрий Александрович', studentClass: '9-3', achievement: 'Муниципальная олимпиада по физике', category: 'Учебные', level: 'Муниципальный', result: 'Победитель', points: 20, status: 'approved', date: '12.01.2026' },
  { id: 6, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', achievement: 'Участие в спортивных соревнованиях', category: 'Внеурочная', level: 'Региональный', result: '2 место', points: 30, status: 'approved', date: '10.01.2026' },
  { id: 7, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', achievement: 'Школьный театр', category: 'Внеурочная', level: '-', result: '20 часов', points: 20, status: 'rejected', date: '12.01.2026' },
  { id: 8, studentName: 'Морозова Анна Игоревна', studentClass: '11-2', achievement: 'Конкурс исследовательских работ', category: 'Проектная', level: 'Муниципальный', result: '1 место', points: 35, status: 'approved', date: '05.01.2026' },
];

const getStatusBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Одобрено</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-600 gap-1"><Clock className="w-3 h-3" /> На проверке</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-600 gap-1"><XCircle className="w-3 h-3" /> Отклонено</Badge>;
  return null;
};

export function AchievementsListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = ALL_ACHIEVEMENTS.filter((a) => {
    const matchesSearch =
      searchQuery === '' ||
      a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.achievement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesClass = classFilter === 'all' || a.studentClass === classFilter;
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesClass && matchesCategory;
  });

  const uniqueClasses = Array.from(new Set(ALL_ACHIEVEMENTS.map((a) => a.studentClass))).sort();
  const uniqueCategories = Array.from(new Set(ALL_ACHIEVEMENTS.map((a) => a.category)));

  const stats = {
    total: ALL_ACHIEVEMENTS.length,
    approved: ALL_ACHIEVEMENTS.filter((a) => a.status === 'approved').length,
    pending: ALL_ACHIEVEMENTS.filter((a) => a.status === 'pending').length,
    rejected: ALL_ACHIEVEMENTS.filter((a) => a.status === 'rejected').length,
    totalPoints: ALL_ACHIEVEMENTS.filter((a) => a.status === 'approved').reduce((s, a) => s + a.points, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Достижения учащихся</h2>
        <p className="text-gray-600">Сводный реестр всех достижений в системе</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Всего</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Одобрено</p>
            <p className="text-2xl font-semibold text-green-700">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">На проверке</p>
            <p className="text-2xl font-semibold text-yellow-700">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Отклонено</p>
            <p className="text-2xl font-semibold text-red-700">{stats.rejected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Баллов выдано</p>
            <p className="text-2xl font-semibold text-blue-700">{stats.totalPoints}</p>
          </CardContent>
        </Card>
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
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="approved">Одобрено</SelectItem>
                <SelectItem value="pending">На проверке</SelectItem>
                <SelectItem value="rejected">Отклонено</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Класс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все классы</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
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
                          <p className="text-sm text-gray-900">{item.achievement}</p>
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
