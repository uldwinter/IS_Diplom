import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Plus, Clock, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddAchievementDialog } from './AddAchievementDialog';
import { submitAchievement, useBackendState } from '@/app/backend/store';

interface StudentAchievementsManagementProps {
  studentUserId: number;
}

const getStatusBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Одобрено</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-600 gap-1"><Clock className="w-3 h-3" /> На проверке</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-600 gap-1"><XCircle className="w-3 h-3" /> Отклонено</Badge>;
  return null;
};

export function StudentAchievementsManagement({ studentUserId }: StudentAchievementsManagementProps) {
  const { achievements } = useBackendState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const myAchievements = useMemo(
    () => achievements.filter((a) => a.studentUserId === studentUserId),
    [achievements, studentUserId]
  );

  const filteredAchievements = myAchievements.filter((a) => filter === 'all' || a.status === filter);
  const stats = {
    total: myAchievements.length,
    pending: myAchievements.filter((a) => a.status === 'pending').length,
    approved: myAchievements.filter((a) => a.status === 'approved').length,
    rejected: myAchievements.filter((a) => a.status === 'rejected').length,
    totalPoints: myAchievements.filter((a) => a.status === 'approved').reduce((sum, a) => sum + a.expectedPoints, 0),
  };

  const handleAddAchievement = (newAchievement: { name: string; category: string; level: string; result: string; points: number; date: string; description?: string; documents?: string[] }) => {
    const result = submitAchievement(studentUserId, newAchievement);
    if (!result.ok) {
      toast.error(result.message ?? 'Не удалось отправить достижение');
      return;
    }
    toast.success('Заявка на достижение отправлена на проверку');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl text-gray-900 mb-2">Мои достижения</h2><p className="text-gray-600">Управление вашими достижениями и заявками</p></div><Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700 gap-2"><Plus className="w-4 h-4" />Добавить достижение</Button></div>
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-green-100 text-sm">Одобренные баллы</p><p className="text-3xl font-bold">{stats.totalPoints}</p></div><div className="text-right"><p className="text-green-100 text-sm">На проверке</p><p className="text-xl font-semibold">{myAchievements.filter((a) => a.status === 'pending').reduce((sum, a) => sum + a.expectedPoints, 0)} баллов</p></div></div></CardContent></Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[['all','Всего',stats.total,'text-gray-900'],['pending','На проверке',stats.pending,'text-yellow-700'],['approved','Одобрено',stats.approved,'text-green-700'],['rejected','Отклонено',stats.rejected,'text-red-700']].map(([k,label,val,color]) => <Card key={k as string} className={filter===k?'ring-2 ring-blue-600':'cursor-pointer hover:shadow-md'} onClick={() => setFilter(k as typeof filter)}><CardContent className="p-4"><p className="text-sm text-gray-600">{label as string}</p><p className={`text-2xl font-semibold ${color}`}>{val as number}</p></CardContent></Card>)}</div>
      <Card><CardHeader><CardTitle>Список достижений {filter !== 'all' && `(${filteredAchievements.length})`}</CardTitle></CardHeader><CardContent><div className="border rounded-md"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead>№</TableHead><TableHead>Наименование</TableHead><TableHead>Категория</TableHead><TableHead>Уровень/Результат</TableHead><TableHead className="text-center">Баллы</TableHead><TableHead className="text-center">Статус</TableHead><TableHead>Дата</TableHead></TableRow></TableHeader><TableBody>{filteredAchievements.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Нет достижений с выбранным статусом</TableCell></TableRow> : filteredAchievements.map((achievement, index) => <TableRow key={achievement.id}><TableCell>{index + 1}</TableCell><TableCell><p className="font-medium text-gray-900">{achievement.achievementName}</p>{achievement.comment && achievement.status === 'rejected' && <p className="text-xs text-red-600 mt-1">Комментарий: {achievement.comment}</p>}</TableCell><TableCell className="text-sm text-gray-600">{achievement.category}</TableCell><TableCell className="text-sm"><p>{achievement.level}</p><p className="text-gray-600 text-xs">{achievement.result}</p></TableCell><TableCell className="text-center">{achievement.expectedPoints}</TableCell><TableCell className="text-center">{getStatusBadge(achievement.status)}</TableCell><TableCell className="text-sm text-gray-600">{achievement.date}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
      <AddAchievementDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onAdd={handleAddAchievement} />
    </div>
  );
}
