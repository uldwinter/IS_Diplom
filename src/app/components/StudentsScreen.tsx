import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Eye, Search, Filter } from 'lucide-react';

interface Student {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  class: string;
}

interface StudentsScreenProps {
  onViewStudent: (studentId: number) => void;
}

const MOCK_STUDENTS: Student[] = [
  { id: 1, lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович', class: '10-1' },
  { id: 2, lastName: 'Петрова', firstName: 'Мария', middleName: 'Сергеевна', class: '10-1' },
  { id: 3, lastName: 'Сидоров', firstName: 'Алексей', middleName: 'Петрович', class: '10-2' },
  { id: 4, lastName: 'Козлова', firstName: 'Елена', middleName: 'Викторовна', class: '11-1' },
  { id: 5, lastName: 'Новиков', firstName: 'Дмитрий', middleName: 'Александрович', class: '9-3' },
  { id: 6, lastName: 'Морозова', firstName: 'Анна', middleName: 'Игоревна', class: '11-2' },
  { id: 7, lastName: 'Волков', firstName: 'Сергей', middleName: 'Николаевич', class: '10-3' },
  { id: 8, lastName: 'Соловьева', firstName: 'Ольга', middleName: 'Дмитриевна', class: '9-1' },
  { id: 9, lastName: 'Лебедев', firstName: 'Андрей', middleName: 'Владимирович', class: '11-1' },
  { id: 10, lastName: 'Кузнецова', firstName: 'Татьяна', middleName: 'Алексеевна', class: '10-1' },
];

export function StudentsScreen({ onViewStudent }: StudentsScreenProps) {
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Фильтрация учеников
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === '' ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.middleName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  // Получаем уникальные классы для фильтра
  const uniqueClasses = Array.from(new Set(students.map((s) => s.class))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Учащиеся</h2>
        <p className="text-gray-600">Список учащихся образовательной организации</p>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48 bg-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Класс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все классы</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls} класс
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || classFilter !== 'all') && (
            <div className="mt-3 text-sm text-gray-600">
              Найдено учеников: <span className="font-semibold">{filteredStudents.length}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Реестр учащихся</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Фамилия</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Отчество</TableHead>
                  <TableHead>Класс</TableHead>
                  <TableHead className="w-40">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      Учащиеся не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>{student.middleName}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewStudent(student.id)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Просмотреть достижения
                        </Button>
                      </TableCell>
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

export { MOCK_STUDENTS };