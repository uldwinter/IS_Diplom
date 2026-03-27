import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useSections } from '@/app/components/sections/SectionsContext';
import { getStudents, useBackendState } from '@/app/backend/store';

interface StudentAchievementsScreenProps {
  studentId: number;
  onBack: () => void;
}

export function StudentAchievementsScreen({ studentId, onBack }: StudentAchievementsScreenProps) {
  const { achievements, users } = useBackendState();
  const student = getStudents().find((s) => s.id === studentId);
  const { getStudentSections } = useSections();
  const studentSections = getStudentSections(studentId);
  const allAchievements = achievements.filter(a => a.studentId === studentId);

  const academic = allAchievements.filter(a => a.category === 'Учебные достижения');
  const extracurricular = allAchievements.filter(a => a.category === 'Внеурочная деятельность');
  const projectAchievements = allAchievements.filter(a => a.category === 'Проектная деятельность');
  const other = allAchievements.filter(a => !['Учебные достижения', 'Внеурочная деятельность', 'Проектная деятельность'].includes(a.category));

  const approvedPoints = allAchievements.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.points, 0);

  if (!student) {
    return <div className="space-y-6"><Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Назад</Button><p>Учащийся не найден</p></div>;
  }

  const user = users.find((u) => u.id === student.id);
  const studentAchievements = achievements.filter((a) => a.studentUserId === student.id && a.status === 'approved');
  const pendingAchievements = achievements.filter((a) => a.studentUserId === student.id && a.status === 'pending');
  const totalPoints = studentAchievements.reduce((sum, item) => sum + item.expectedPoints, 0);
  const achievementGroups = [
    { tab: 'academic', title: 'Учебные достижения', category: 'Учебные достижения' },
    { tab: 'extracurricular', title: 'Внеурочная деятельность', category: 'Внеурочная деятельность' },
    { tab: 'projects', title: 'Проектная деятельность', category: 'Проектная деятельность' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Назад</Button></div>
      <div><h2 className="text-2xl text-gray-900 mb-1">Индивидуальные достижения учащегося</h2><p className="text-gray-600">{user?.name}, {student.class} класс</p></div>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Подтверждено достижений</p>
              <p className="text-sm font-medium text-gray-900">{studentAchievements.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">На проверке</p>
              <p className="text-sm font-medium text-amber-700">{pendingAchievements.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Сумма баллов</p>
              <p className="text-sm font-medium text-blue-700">{totalPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="academic">Учебные ({academic.length})</TabsTrigger>
          <TabsTrigger value="extracurricular">Внеурочная ({extracurricular.length})</TabsTrigger>
          <TabsTrigger value="projects">Проекты ({projects.length})</TabsTrigger>
          <TabsTrigger value="sections">Секции ({studentSections.length})</TabsTrigger>
        </TabsList>

        {achievementGroups.map(({ tab, title, category }) => {
          const list = studentAchievements.filter((a) => a.category === category);
          return (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><div className="border rounded-md"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead>№</TableHead><TableHead>Наименование</TableHead><TableHead>Уровень</TableHead><TableHead>Результат</TableHead><TableHead>Дата</TableHead><TableHead>Баллы</TableHead></TableRow></TableHeader><TableBody>{list.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-4 text-gray-500">Нет подтвержденных достижений</TableCell></TableRow> : list.map((a, i) => <TableRow key={a.id}><TableCell>{i + 1}</TableCell><TableCell>{a.achievementName}</TableCell><TableCell>{a.level}</TableCell><TableCell>{a.result}</TableCell><TableCell>{a.date}</TableCell><TableCell>{a.expectedPoints}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
          </TabsContent>
        );})}

        <TabsContent value="sections" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Участие в секциях и кружках</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table><TableHeader><TableRow className="bg-gray-50"><TableHead>№</TableHead><TableHead>Название</TableHead><TableHead>Категория</TableHead><TableHead>Расписание</TableHead><TableHead>Преподаватель</TableHead></TableRow></TableHeader><TableBody>{studentSections.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-4 text-gray-500">Ученик не посещает секции</TableCell></TableRow> : studentSections.map((section, index) => <TableRow key={section.id}><TableCell>{index + 1}</TableCell><TableCell className="font-medium">{section.name}</TableCell><TableCell>{section.category === 'sport' ? 'Спорт' : section.category === 'science' ? 'Наука' : section.category === 'art' ? 'Творчество' : 'Другое'}</TableCell><TableCell>{section.schedule}</TableCell><TableCell>{section.teacher}</TableCell></TableRow>)}</TableBody></Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
