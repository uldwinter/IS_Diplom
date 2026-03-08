import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Eye, Search, Filter } from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';

interface StudentsScreenProps {
  onViewStudent: (studentId: number) => void;
}

export function StudentsScreen({ onViewStudent }: StudentsScreenProps) {
  const { students, achievements } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`;
    const matchesSearch =
      searchQuery === '' ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  // Compute approved points per student for summary
  const getStudentPoints = (studentId: number) => {
    return achievements
      .filter(a => a.studentId === studentId && a.status === 'approved')
      .reduce((sum, a) => sum + a.points, 0);
  };

  const uniqueClasses = Array.from(new Set(students.map((s) => s.class))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Учащиеся</h2>
        <p className="text-gray-600">Список учащихся образовательной организации</p>
      </div>

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
                  <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>
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
          <CardTitle>Реестр учащихся ({filteredStudents.length})</CardTitle>
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
                  <TableHead className="text-center">Баллы</TableHead>
                  <TableHead className="w-48">Действия</TableHead>
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
                  filteredStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.lastName}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>{student.middleName}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-blue-700">{getStudentPoints(student.id)}</span>
                      </TableCell>
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

// Backward-compatibility export (used by StudentAchievementsScreen)
export const MOCK_STUDENTS: never[] = [];
