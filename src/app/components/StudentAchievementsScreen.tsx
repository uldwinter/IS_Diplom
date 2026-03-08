import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';

interface StudentAchievementsScreenProps {
  studentId: number;
  onBack: () => void;
}

const getStatusBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-green-600 gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Одобрено</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-600 gap-1 text-xs"><Clock className="w-3 h-3" /> На проверке</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-600 gap-1 text-xs"><XCircle className="w-3 h-3" /> Отклонено</Badge>;
  return null;
};

const CATEGORY_LABELS: Record<string, string> = {
  sport: 'Спорт',
  science: 'Наука',
  art: 'Творчество',
  social: 'Социальная деятельность',
};

export function StudentAchievementsScreen({ studentId, onBack }: StudentAchievementsScreenProps) {
  const { getStudent, achievements, getStudentSections } = useApp();
  const student = getStudent(studentId);
  const studentSections = getStudentSections(studentId);
  const allAchievements = achievements.filter(a => a.studentId === studentId);

  const academic = allAchievements.filter(a => a.category === 'Учебные достижения');
  const extracurricular = allAchievements.filter(a => a.category === 'Внеурочная деятельность');
  const projects = allAchievements.filter(a => a.category === 'Проектная деятельность');
  const other = allAchievements.filter(a => !['Учебные достижения', 'Внеурочная деятельность', 'Проектная деятельность'].includes(a.category));

  const approvedPoints = allAchievements.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.points, 0);

  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Button>
        <p className="text-gray-500">Учащийся не найден</p>
      </div>
    );
  }

  const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`;

  const AchievementTable = ({ items }: { items: typeof allAchievements }) => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">№</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>Уровень</TableHead>
            <TableHead>Результат</TableHead>
            <TableHead className="text-center">Баллы</TableHead>
            <TableHead className="text-center">Статус</TableHead>
            <TableHead>Дата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-6">Нет данных</TableCell>
            </TableRow>
          ) : (
            items.map((ach, index) => (
              <TableRow key={ach.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{ach.name}</p>
                    {ach.comment && ach.status === 'rejected' && (
                      <p className="text-xs text-red-600 mt-0.5">Причина: {ach.comment}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-700">{ach.level}</TableCell>
                <TableCell className="text-sm text-gray-700">{ach.result}</TableCell>
                <TableCell className="text-center font-semibold text-blue-700">{ach.points}</TableCell>
                <TableCell className="text-center">{getStatusBadge(ach.status)}</TableCell>
                <TableCell className="text-sm text-gray-600">{ach.date}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Индивидуальные достижения учащегося</h2>
          <p className="text-gray-600">{fullName}, {student.class} класс</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Одобренные баллы</p>
          <p className="text-3xl font-bold text-blue-700">{approvedPoints}</p>
        </div>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Всего заявок', value: allAchievements.length, color: 'text-gray-900' },
          { label: 'Одобрено', value: allAchievements.filter(a => a.status === 'approved').length, color: 'text-green-700' },
          { label: 'На проверке', value: allAchievements.filter(a => a.status === 'pending').length, color: 'text-yellow-700' },
          { label: 'Отклонено', value: allAchievements.filter(a => a.status === 'rejected').length, color: 'text-red-700' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className={`text-2xl font-semibold ${item.color}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="academic">Учебные ({academic.length})</TabsTrigger>
          <TabsTrigger value="extracurricular">Внеурочная ({extracurricular.length})</TabsTrigger>
          <TabsTrigger value="projects">Проекты ({projects.length})</TabsTrigger>
          <TabsTrigger value="sections">Секции ({studentSections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Учебные достижения</CardTitle></CardHeader>
            <CardContent><AchievementTable items={academic} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extracurricular" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Внеурочная деятельность</CardTitle></CardHeader>
            <CardContent><AchievementTable items={extracurricular} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Проектная деятельность</CardTitle></CardHeader>
            <CardContent><AchievementTable items={projects} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Участие в секциях и кружках</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Расписание</TableHead>
                      <TableHead>Преподаватель</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentSections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                          Ученик не посещает секции
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentSections.map((section, index) => (
                        <TableRow key={section.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{section.name}</TableCell>
                          <TableCell>{CATEGORY_LABELS[section.category] ?? section.category}</TableCell>
                          <TableCell>{section.schedule}</TableCell>
                          <TableCell>{section.teacher}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
