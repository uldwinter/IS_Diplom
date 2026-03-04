import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Trophy, Award, Search } from 'lucide-react';

interface RatingStudent {
  id: number;
  rank: number;
  lastName: string;
  firstName: string;
  middleName: string;
  class: string;
  totalPoints: number;
  academicPoints: number;
  extracurricularPoints: number;
  projectPoints: number;
}

const RATING_9_CLASS: RatingStudent[] = [
  { id: 1, rank: 1, lastName: 'Соловьева', firstName: 'Ольга', middleName: 'Дмитриевна', class: '9-1', totalPoints: 245, academicPoints: 150, extracurricularPoints: 60, projectPoints: 35 },
  { id: 2, rank: 2, lastName: 'Новиков', firstName: 'Дмитрий', middleName: 'Александрович', class: '9-3', totalPoints: 232, academicPoints: 140, extracurricularPoints: 52, projectPoints: 40 },
  { id: 3, rank: 3, lastName: 'Михайлов', firstName: 'Артем', middleName: 'Сергеевич', class: '9-1', totalPoints: 218, academicPoints: 135, extracurricularPoints: 48, projectPoints: 35 },
  { id: 4, rank: 4, lastName: 'Федорова', firstName: 'Виктория', middleName: 'Павловна', class: '9-2', totalPoints: 205, academicPoints: 120, extracurricularPoints: 55, projectPoints: 30 },
  { id: 5, rank: 5, lastName: 'Громов', firstName: 'Максим', middleName: 'Игоревич', class: '9-3', totalPoints: 198, academicPoints: 115, extracurricularPoints: 50, projectPoints: 33 },
  { id: 6, rank: 6, lastName: 'Алексеева', firstName: 'Екатерина', middleName: 'Андреевна', class: '9-1', totalPoints: 187, academicPoints: 110, extracurricularPoints: 47, projectPoints: 30 },
  { id: 7, rank: 7, lastName: 'Павлов', firstName: 'Илья', middleName: 'Владимирович', class: '9-2', totalPoints: 175, academicPoints: 105, extracurricularPoints: 42, projectPoints: 28 },
  { id: 8, rank: 8, lastName: 'Романова', firstName: 'Дарья', middleName: 'Алексеевна', class: '9-3', totalPoints: 168, academicPoints: 98, extracurricularPoints: 45, projectPoints: 25 },
];

const RATING_10_CLASS: RatingStudent[] = [
  { id: 1, rank: 1, lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович', class: '10-1', totalPoints: 267, academicPoints: 165, extracurricularPoints: 62, projectPoints: 40 },
  { id: 2, rank: 2, lastName: 'Петрова', firstName: 'Мария', middleName: 'Сергеевна', class: '10-1', totalPoints: 255, academicPoints: 158, extracurricularPoints: 57, projectPoints: 40 },
  { id: 3, rank: 3, lastName: 'Кузнецова', firstName: 'Татьяна', middleName: 'Алексеевна', class: '10-1', totalPoints: 241, academicPoints: 145, extracurricularPoints: 60, projectPoints: 36 },
  { id: 4, rank: 4, lastName: 'Сидоров', firstName: 'Алексей', middleName: 'Петрович', class: '10-2', totalPoints: 228, academicPoints: 140, extracurricularPoints: 53, projectPoints: 35 },
  { id: 5, rank: 5, lastName: 'Волков', firstName: 'Сергей', middleName: 'Николаевич', class: '10-3', totalPoints: 215, academicPoints: 130, extracurricularPoints: 50, projectPoints: 35 },
  { id: 6, rank: 6, lastName: 'Смирнов', firstName: 'Николай', middleName: 'Дмитриевич', class: '10-2', totalPoints: 203, academicPoints: 125, extracurricularPoints: 48, projectPoints: 30 },
  { id: 7, rank: 7, lastName: 'Орлова', firstName: 'Анастасия', middleName: 'Игоревна', class: '10-1', totalPoints: 195, academicPoints: 118, extracurricularPoints: 47, projectPoints: 30 },
  { id: 8, rank: 8, lastName: 'Белов', firstName: 'Данил', middleName: 'Александрович', class: '10-3', totalPoints: 182, academicPoints: 110, extracurricularPoints: 44, projectPoints: 28 },
];

const getRankBadge = (rank: number) => {
  if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1 место</Badge>;
  if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2 место</Badge>;
  if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 3 место</Badge>;
  return <Badge variant="outline">{rank} место</Badge>;
};

export function RatingScreen() {
  const [searchQuery9, setSearchQuery9] = useState('');
  const [searchQuery10, setSearchQuery10] = useState('');

  // Фильтрация для 9 классов
  const filteredRating9 = RATING_9_CLASS.filter((student) => {
    const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`.toLowerCase();
    return searchQuery9 === '' || fullName.includes(searchQuery9.toLowerCase()) || student.class.toLowerCase().includes(searchQuery9.toLowerCase());
  });

  // Фильтрация для 10 классов
  const filteredRating10 = RATING_10_CLASS.filter((student) => {
    const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`.toLowerCase();
    return searchQuery10 === '' || fullName.includes(searchQuery10.toLowerCase()) || student.class.toLowerCase().includes(searchQuery10.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Рейтинг учащихся</h2>
        <p className="text-gray-600">Система оценивания достижений для перехода из 9 в 10 класс</p>
      </div>

      <Tabs defaultValue="9" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100">
          <TabsTrigger value="9">9 классы</TabsTrigger>
          <TabsTrigger value="10">10 классы</TabsTrigger>
        </TabsList>

        <TabsContent value="9" className="mt-6 space-y-6">
          {/* Поиск */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по ФИО или классу..."
                  value={searchQuery9}
                  onChange={(e) => setSearchQuery9(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              {searchQuery9 && (
                <div className="mt-3 text-sm text-gray-600">
                  Найдено учеников: <span className="font-semibold">{filteredRating9.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-md">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Рейтинг учащихся 9 классов</CardTitle>
                  <CardDescription>
                    Рейтинг формируется на основе индивидуальных достижений за учебный год
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-24">Место</TableHead>
                      <TableHead>ФИО учащегося</TableHead>
                      <TableHead>Класс</TableHead>
                      <TableHead className="text-center">Учебные</TableHead>
                      <TableHead className="text-center">Внеурочные</TableHead>
                      <TableHead className="text-center">Проектные</TableHead>
                      <TableHead className="text-center">Всего баллов</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRating9.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Учащиеся не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRating9.map((student) => (
                        <TableRow key={student.id} className={student.rank <= 3 ? 'bg-blue-50/30' : ''}>
                          <TableCell>{getRankBadge(student.rank)}</TableCell>
                          <TableCell className="font-medium">
                            {student.lastName} {student.firstName} {student.middleName}
                          </TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell className="text-center">{student.academicPoints}</TableCell>
                          <TableCell className="text-center">{student.extracurricularPoints}</TableCell>
                          <TableCell className="text-center">{student.projectPoints}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-blue-700">{student.totalPoints}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="10" className="mt-6 space-y-6">
          {/* Поиск */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по ФИО или классу..."
                  value={searchQuery10}
                  onChange={(e) => setSearchQuery10(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              {searchQuery10 && (
                <div className="mt-3 text-sm text-gray-600">
                  Найдено учеников: <span className="font-semibold">{filteredRating10.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-md">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Рейтинг учащихся 10 классов</CardTitle>
                  <CardDescription>
                    Рейтинг формируется на основе индивидуальных достижений за учебный год
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-24">Место</TableHead>
                      <TableHead>ФИО учащегося</TableHead>
                      <TableHead>Класс</TableHead>
                      <TableHead className="text-center">Учебные</TableHead>
                      <TableHead className="text-center">Внеурочные</TableHead>
                      <TableHead className="text-center">Проектные</TableHead>
                      <TableHead className="text-center">Всего баллов</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRating10.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Учащиеся не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRating10.map((student) => (
                        <TableRow key={student.id} className={student.rank <= 3 ? 'bg-green-50/30' : ''}>
                          <TableCell>{getRankBadge(student.rank)}</TableCell>
                          <TableCell className="font-medium">
                            {student.lastName} {student.firstName} {student.middleName}
                          </TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell className="text-center">{student.academicPoints}</TableCell>
                          <TableCell className="text-center">{student.extracurricularPoints}</TableCell>
                          <TableCell className="text-center">{student.projectPoints}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-green-700">{student.totalPoints}</span>
                          </TableCell>
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

      {/* Система оценивания */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-md">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Система оценивания достижений</CardTitle>
              <CardDescription>Критерии начисления баллов за индивидуальные достижения</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Учебные достижения */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Учебные достижения</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">Олимпиады и конкурсы:</p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• Победитель (всероссийский) - 50 б.</li>
                    <li>• Призёр (всероссийский) - 40 б.</li>
                    <li>• Победитель (региональный) - 35 б.</li>
                    <li>• Призёр (региональный) - 25 б.</li>
                    <li>• Победитель (муниципальный) - 20 б.</li>
                    <li>• Призёр (муниципальный) - 15 б.</li>
                    <li>• Победитель (школьный) - 10 б.</li>
                    <li>• Призёр (школьный) - 5 б.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Внеурочная деятельность */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Внеурочная деятельность</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">Участие в мероприятиях:</p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• Волонтёрская деятельность - 1 б./час</li>
                    <li>• Творческие коллективы - 0.5 б./час</li>
                    <li>• Спортивные секции - 0.5 б./час</li>
                    <li>• Участие в концертах/выставках - 10 б.</li>
                    <li>• Организация мероприятий - 15 б.</li>
                    <li>• Награды и грамоты - 5-20 б.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Проектная деятельность */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Проектная деятельность</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">Защита проектов:</p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• Оценка "Отлично" - 40 б.</li>
                    <li>• Оценка "Хорошо" - 30 б.</li>
                    <li>• Оценка "Удовлетворительно" - 20 б.</li>
                    <li>• Публикация результатов - +10 б.</li>
                    <li>• Награды на конкурсах проектов - 15-30 б.</li>
                    <li>• Групповой проект - коэффициент 0.8</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              <strong>Примечание:</strong> Рейтинг формируется автоматически на основе зарегистрированных достижений.
              Минимальный проходной балл для перехода из 9 в 10 класс определяется педагогическим советом.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}