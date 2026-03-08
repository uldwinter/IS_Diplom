import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Plus, Clock, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddAchievementDialog } from './AddAchievementDialog';
import { useApp } from '@/app/lib/AppContext';

const getStatusBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Одобрено</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-600 gap-1"><Clock className="w-3 h-3" /> На проверке</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-600 gap-1"><XCircle className="w-3 h-3" /> Отклонено</Badge>;
  return null;
};

export function StudentAchievementsManagement() {
  const { currentUser, achievements, addAchievement, deleteAchievement } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Show only this student's achievements
  const studentId = currentUser?.studentId;
  const myAchievements = achievements.filter(a => a.studentId === studentId);
  const filteredAchievements = myAchievements.filter((a) => filter === 'all' || a.status === filter);

  const stats = {
    total: myAchievements.length,
    pending: myAchievements.filter((a) => a.status === 'pending').length,
    approved: myAchievements.filter((a) => a.status === 'approved').length,
    rejected: myAchievements.filter((a) => a.status === 'rejected').length,
    totalPoints: myAchievements.filter((a) => a.status === 'approved').reduce((sum, a) => sum + a.points, 0),
    pendingPoints: myAchievements.filter((a) => a.status === 'pending').reduce((sum, a) => sum + a.points, 0),
  };

  const handleAddAchievement = (newData: {
    name: string;
    category: string;
    level: string;
    result: string;
    points: number;
    date: string;
    documents?: string[];
    description?: string;
  }) => {
    if (!currentUser || !studentId) return;
    addAchievement({
      studentId,
      studentName: currentUser.name,
      studentClass: currentUser.class || '',
      name: newData.name,
      category: newData.category,
      level: newData.level,
      result: newData.result,
      points: newData.points,
      status: 'pending',
      date: newData.date,
      documents: newData.documents || [],
      description: newData.description,
    });
    toast.success('Заявка на достижение отправлена на проверку!');
  };

  const handleDelete = (id: number, name: string) => {
    deleteAchievement(id);
    toast.success(`Достижение «${name}» удалено`);
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
              <p className="text-xl font-semibold">{stats.pendingPoints} баллов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(
          [
            { key: 'all', label: 'Всего', value: stats.total, color: 'ring-blue-600', icon: <FileText className="w-8 h-8 text-gray-400" /> },
            { key: 'pending', label: 'На проверке', value: stats.pending, color: 'ring-yellow-600', icon: <Clock className="w-8 h-8 text-yellow-500" />, textColor: 'text-yellow-700' },
            { key: 'approved', label: 'Одобрено', value: stats.approved, color: 'ring-green-600', icon: <CheckCircle className="w-8 h-8 text-green-500" />, textColor: 'text-green-700' },
            { key: 'rejected', label: 'Отклонено', value: stats.rejected, color: 'ring-red-600', icon: <XCircle className="w-8 h-8 text-red-500" />, textColor: 'text-red-700' },
          ] as const
        ).map((item) => (
          <Card
            key={item.key}
            className={filter === item.key ? `ring-2 ${item.color}` : 'cursor-pointer hover:shadow-md'}
            onClick={() => setFilter(item.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className={`text-2xl font-semibold ${(item as any).textColor || 'text-gray-900'}`}>{item.value}</p>
                </div>
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>
            Список достижений{filter !== 'all' && ` (${filteredAchievements.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Уровень / Результат</TableHead>
                  <TableHead className="text-center">Баллы</TableHead>
                  <TableHead className="text-center">Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAchievements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
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
                            <p className="text-xs text-red-600 mt-1">Комментарий куратора: {achievement.comment}</p>
                          )}
                          {achievement.status === 'approved' && achievement.reviewedBy && (
                            <p className="text-xs text-green-600 mt-1">Одобрил: {achievement.reviewedBy}</p>
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
                      <TableCell>
                        {achievement.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(achievement.id, achievement.name)}
                            title="Удалить заявку"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddAchievementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAdd={handleAddAchievement}
      />
    </div>
  );
}
