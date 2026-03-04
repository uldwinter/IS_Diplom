import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Plus, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { AddAchievementDialog } from './AddAchievementDialog';

interface Achievement {
  id: number;
  name: string;
  category: string;
  level: string;
  result: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  comment?: string;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: 'Всероссийская олимпиада школьников по математике', category: 'Учебные достижения', level: 'Региональный', result: 'Призёр', points: 40, status: 'approved', date: '15.01.2026' },
  { id: 2, name: 'Олимпиада по информатике', category: 'Учебные достижения', level: 'Школьный', result: 'Победитель', points: 10, status: 'approved', date: '10.01.2026' },
  { id: 3, name: 'Участие в волонтёрской акции', category: 'Внеурочная деятельность', level: '-', result: '25 часов', points: 25, status: 'pending', date: '18.01.2026' },
  { id: 4, name: 'Защита проекта по информатике', category: 'Проектная деятельность', level: '-', result: 'Отлично', points: 40, status: 'pending', date: '19.01.2026' },
  { id: 5, name: 'Участие в школьном театре', category: 'Внеурочная деятельность', level: '-', result: '20 часов', points: 20, status: 'rejected', date: '12.01.2026', comment: 'Необходимо предоставить справку от руководителя кружка' },
];

const getStatusBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Одобрено</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-600 gap-1"><Clock className="w-3 h-3" /> На проверке</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-600 gap-1"><XCircle className="w-3 h-3" /> Отклонено</Badge>;
  return null;
};

export function StudentAchievementsManagement() {
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredAchievements = achievements.filter((a) => filter === 'all' || a.status === filter);

  const stats = {
    total: achievements.length,
    pending: achievements.filter((a) => a.status === 'pending').length,
    approved: achievements.filter((a) => a.status === 'approved').length,
    rejected: achievements.filter((a) => a.status === 'rejected').length,
    totalPoints: achievements.filter((a) => a.status === 'approved').reduce((sum, a) => sum + a.points, 0),
  };

  const handleAddAchievement = (newAchievement: {
    name: string; category: string; level: string; result: string; points: number; status: 'pending'; date: string;
  }) => {
    const achievement: Achievement = {
      id: Date.now(),
      ...newAchievement,
    };
    setAchievements((prev) => [achievement, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Мои достижения</h2>
          <p className="text-gray-600">Управление вашими достижениями и заявками</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" />
          Добавить достижение
        </Button>
      </div>

      {/* Сводка баллов */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Одобренные баллы</p>
              <p className="text-3xl font-bold">{stats.totalPoints}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm">На проверке</p>
              <p className="text-xl font-semibold">{achievements.filter((a) => a.status === 'pending').reduce((sum, a) => sum + a.points, 0)} баллов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={filter === 'all' ? 'ring-2 ring-blue-600' : 'cursor-pointer hover:shadow-md'} onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={filter === 'pending' ? 'ring-2 ring-yellow-600' : 'cursor-pointer hover:shadow-md'} onClick={() => setFilter('pending')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">На проверке</p>
                <p className="text-2xl font-semibold text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={filter === 'approved' ? 'ring-2 ring-green-600' : 'cursor-pointer hover:shadow-md'} onClick={() => setFilter('approved')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Одобрено</p>
                <p className="text-2xl font-semibold text-green-700">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={filter === 'rejected' ? 'ring-2 ring-red-600' : 'cursor-pointer hover:shadow-md'} onClick={() => setFilter('rejected')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Отклонено</p>
                <p className="text-2xl font-semibold text-red-700">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица достижений */}
      <Card>
        <CardHeader>
          <CardTitle>Список достижений {filter !== 'all' && `(${filteredAchievements.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Уровень/Результат</TableHead>
                  <TableHead className="text-center">Баллы</TableHead>
                  <TableHead className="text-center">Статус</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAchievements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Нет достижений с выбранным статусом
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAchievements.map((achievement, index) => (
                    <TableRow key={achievement.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{achievement.name}</p>
                          {achievement.comment && achievement.status === 'rejected' && (
                            <p className="text-xs text-red-600 mt-1">Комментарий: {achievement.comment}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{achievement.category}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p className="text-gray-900">{achievement.level}</p>
                          <p className="text-gray-600 text-xs">{achievement.result}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${achievement.status === 'approved' ? 'text-green-700' : 'text-gray-700'}`}>
                          {achievement.points}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(achievement.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{achievement.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Диалог добавления достижения */}
      <AddAchievementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAdd={handleAddAchievement}
      />
    </div>
  );
}
