import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { MOCK_STUDENTS } from './StudentsScreen';
import { useSections } from '@/app/components/sections/SectionsContext';

interface StudentAchievementsScreenProps {
  studentId: number;
  onBack: () => void;
}

const ACHIEVEMENTS_DATA = {
  academic: [
    { id: 1, name: 'Всероссийская олимпиада школьников по математике', level: 'Муниципальный этап', place: 'Призер', date: '15.12.2025' },
    { id: 2, name: 'Олимпиада по информатике', level: 'Школьный этап', place: 'Победитель', date: '20.11.2025' },
    { id: 3, name: 'Конкурс научно-исследовательских работ', level: 'Региональный этап', place: '3 место', date: '10.10.2025' },
  ],
  extracurricular: [
    { id: 1, activity: 'Участие в школьном театре', hours: '72', period: 'Сентябрь 2025 - Январь 2026', result: 'Выступление на городском фестивале' },
    { id: 2, activity: 'Волонтерская деятельность', hours: '48', period: 'Октябрь 2025 - Декабрь 2025', result: 'Благодарственное письмо' },
    { id: 3, activity: 'Спортивная секция (баскетбол)', hours: '120', period: 'Сентябрь 2025 - Январь 2026', result: 'Участие в соревнованиях' },
  ],
  projects: [
    { id: 1, project: 'Разработка мобильного приложения для школы', type: 'Индивидуальный', status: 'Завершен', grade: 'Отлично', date: '15.12.2025' },
    { id: 2, project: 'Исследование экологической ситуации района', type: 'Групповой', status: 'В работе', grade: '-', date: '-' },
  ],
};

export function StudentAchievementsScreen({ studentId, onBack }: StudentAchievementsScreenProps) {
  const student = MOCK_STUDENTS.find((s) => s.id === studentId);
  const { getStudentSections } = useSections();
  const studentSections = getStudentSections(studentId);

  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <p>Учащийся не найден</p>
      </div>
    );
  }

  const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
      </div>

      <div>
        <h2 className="text-2xl text-gray-900 mb-1">Индивидуальные достижения учащегося</h2>
        <p className="text-gray-600">{fullName}, {student.class} класс</p>
      </div>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="academic">Учебные достижения</TabsTrigger>
          <TabsTrigger value="extracurricular">Внеурочная деятельность</TabsTrigger>
          <TabsTrigger value="projects">Проектная деятельность</TabsTrigger>
          <TabsTrigger value="sections">Секции</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Учебные достижения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Наименование</TableHead>
                      <TableHead>Уровень</TableHead>
                      <TableHead>Результат</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACHIEVEMENTS_DATA.academic.map((achievement, index) => (
                      <TableRow key={achievement.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{achievement.name}</TableCell>
                        <TableCell>{achievement.level}</TableCell>
                        <TableCell>{achievement.place}</TableCell>
                        <TableCell>{achievement.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extracurricular" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Внеурочная деятельность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Вид деятельности</TableHead>
                      <TableHead>Часов</TableHead>
                      <TableHead>Период</TableHead>
                      <TableHead>Результат</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACHIEVEMENTS_DATA.extracurricular.map((activity, index) => (
                      <TableRow key={activity.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{activity.activity}</TableCell>
                        <TableCell>{activity.hours}</TableCell>
                        <TableCell>{activity.period}</TableCell>
                        <TableCell>{activity.result}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Проектная деятельность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Название проекта</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Оценка</TableHead>
                      <TableHead>Дата защиты</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACHIEVEMENTS_DATA.projects.map((project, index) => (
                      <TableRow key={project.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{project.project}</TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>{project.grade}</TableCell>
                        <TableCell>{project.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Участие в секциях и кружках</CardTitle>
            </CardHeader>
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
                         <TableCell colSpan={5} className="text-center py-4 text-gray-500">Ученик не посещает секции</TableCell>
                       </TableRow>
                    ) : (
                      studentSections.map((section, index) => (
                        <TableRow key={section.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{section.name}</TableCell>
                          <TableCell>
                            {section.category === 'sport' ? 'Спорт' : 
                             section.category === 'science' ? 'Наука' : 
                             section.category === 'art' ? 'Творчество' : 'Другое'}
                          </TableCell>
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