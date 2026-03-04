import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Trophy, Award, Search, Filter } from 'lucide-react';

interface Student {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  class: string;
  academicPoints: number;
  extracurricularPoints: number;
  projectPoints: number;
  totalPoints: number;
  rank: number;
}

// Генерация данных для всех классов с 5 по 11
const generateRatingData = (): Student[] => {
  const classes = ['5-1', '5-2', '5-3', '6-1', '6-2', '6-3', '7-1', '7-2', '7-3', '8-1', '8-2', '8-3', '9-1', '9-2', '9-3', '10-1', '10-2', '10-3', '11-1', '11-2', '11-3'];
  const names = [
    ['Иванов', 'Иван', 'Иванович'],
    ['Петрова', 'Мария', 'Сергеевна'],
    ['Сидоров', 'Алексей', 'Петрович'],
    ['Козлова', 'Елена', 'Викторовна'],
    ['Новиков', 'Дмитрий', 'Александрович'],
    ['Морозова', 'Анна', 'Игоревна'],
    ['Волков', 'Сергей', 'Николаевич'],
    ['Соловьева', 'Ольга', 'Дмитриевна'],
    ['Лебедев', 'Андрей', 'Владимирович'],
    ['Кузнецова', 'Татьяна', 'Алексеевна'],
  ];

  const students: Student[] = [];
  let globalId = 1;

  classes.forEach((cls) => {
    const studentsPerClass = 8 + Math.floor(Math.random() * 3);
    for (let i = 0; i < studentsPerClass; i++) {
      const name = names[i % names.length];
      const academic = Math.floor(Math.random() * 150) + 50;
      const extracurricular = Math.floor(Math.random() * 80) + 20;
      const project = Math.floor(Math.random() * 60) + 10;
      
      students.push({
        id: globalId++,
        lastName: name[0],
        firstName: name[1],
        middleName: name[2],
        class: cls,
        academicPoints: academic,
        extracurricularPoints: extracurricular,
        projectPoints: project,
        totalPoints: academic + extracurricular + project,
        rank: 0,
      });
    }
  });

  return students;
};

const RATING_DATA = generateRatingData();

export function EnhancedRatingScreen() {
  const [selectedGrade, setSelectedGrade] = useState<string>('9');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Получаем уникальные параллели
  const grades = ['5', '6', '7', '8', '9', '10', '11'];

  // Получаем классы для выбранной параллели
  const getClassesForGrade = (grade: string) => {
    const allClasses = RATING_DATA
      .map((s) => s.class)
      .filter((c) => c.startsWith(grade))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    return allClasses;
  };

  const classesInGrade = getClassesForGrade(selectedGrade);

  // Фильтрация студентов
  const getFilteredStudents = () => {
    let filtered = RATING_DATA.filter((s) => {
      const matchesGrade = s.class.startsWith(selectedGrade);
      const matchesClass = selectedClass === 'all' || s.class === selectedClass;
      const fullName = `${s.lastName} ${s.firstName} ${s.middleName}`.toLowerCase();
      const matchesSearch = searchQuery === '' || fullName.includes(searchQuery.toLowerCase());
      
      return matchesGrade && matchesClass && matchesSearch;
    });

    // Сортируем по баллам и присваиваем ранги
    filtered.sort((a, b) => b.totalPoints - a.totalPoints);
    filtered = filtered.map((s, index) => ({ ...s, rank: index + 1 }));

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500 text-white font-semibold gap-1">
          <Trophy className="w-4 h-4" />
          {rank} место
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className="bg-gray-400 text-white font-semibold gap-1">
          <Trophy className="w-4 h-4" />
          {rank} место
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className="bg-orange-500 text-white font-semibold gap-1">
          <Trophy className="w-4 h-4" />
          {rank} место
        </Badge>
      );
    }
    return <span className="text-gray-700 font-medium">{rank}</span>;
  };

  const getGradeColor = (grade: string) => {
    const colors: { [key: string]: string } = {
      '5': 'text-purple-700',
      '6': 'text-pink-700',
      '7': 'text-indigo-700',
      '8': 'text-cyan-700',
      '9': 'text-blue-700',
      '10': 'text-green-700',
      '11': 'text-orange-700',
    };
    return colors[grade] || 'text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Рейтинг учащихся</h2>
        <p className="text-base text-gray-600">Система оценивания достижений учащихся 5-11 классов</p>
      </div>

      {/* Выбор параллели */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-900">Фильтры рейтинга:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => {
                  setSelectedGrade(grade);
                  setSelectedClass('all');
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedGrade === grade
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {grade} классы
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Фильтр по конкретному классу и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Класс</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все {selectedGrade} классы</SelectItem>
                  {classesInGrade.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls} класс
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по ФИО..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
          </div>
          {(searchQuery || selectedClass !== 'all') && (
            <div className="mt-3 text-sm text-gray-600">
              Найдено учеников: <span className="font-semibold">{filteredStudents.length}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица рейтинга */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-md">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>
                Рейтинг {selectedClass === 'all' ? `${selectedGrade} классов` : `${selectedClass} класса`}
              </CardTitle>
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
                  <TableHead className="w-32">Место</TableHead>
                  <TableHead>ФИО учащегося</TableHead>
                  <TableHead>Класс</TableHead>
                  <TableHead className="text-center">Учебные</TableHead>
                  <TableHead className="text-center">Внеурочные</TableHead>
                  <TableHead className="text-center">Проектные</TableHead>
                  <TableHead className="text-center">Всего баллов</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Учащиеся не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className={`hover:bg-gray-50 ${student.rank <= 3 ? 'bg-blue-50/30' : ''}`}
                    >
                      <TableCell>{getRankBadge(student.rank)}</TableCell>
                      <TableCell className="font-medium">
                        {student.lastName} {student.firstName} {student.middleName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.class}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{student.academicPoints}</TableCell>
                      <TableCell className="text-center">{student.extracurricularPoints}</TableCell>
                      <TableCell className="text-center">{student.projectPoints}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold text-lg ${getGradeColor(selectedGrade)}`}>
                          {student.totalPoints}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Статистика по параллели */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Всего учеников</p>
              <p className="text-3xl font-bold text-gray-900">{filteredStudents.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Средний балл</p>
              <p className={`text-3xl font-bold ${getGradeColor(selectedGrade)}`}>
                {filteredStudents.length > 0
                  ? Math.round(
                      filteredStudents.reduce((sum, s) => sum + s.totalPoints, 0) /
                        filteredStudents.length
                    )
                  : 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Максимальный балл</p>
              <p className="text-3xl font-bold text-green-700">
                {filteredStudents.length > 0 ? Math.max(...filteredStudents.map((s) => s.totalPoints)) : 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Минимальный балл</p>
              <p className="text-3xl font-bold text-orange-700">
                {filteredStudents.length > 0 ? Math.min(...filteredStudents.map((s) => s.totalPoints)) : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}