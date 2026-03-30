import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Eye, Search, Filter, Award, Clock, Users } from 'lucide-react';
import { getStudents, useBackendState } from '@/app/backend/store';

interface StudentsScreenProps {
  onViewStudent: (studentId: number) => void;
}

export function StudentsScreen({ onViewStudent }: StudentsScreenProps) {
  const { users, achievements } = useBackendState();
  const students = useMemo(() => getStudents(), [users]);
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

  const uniqueClasses = Array.from(new Set(students.map((s) => s.class))).sort();
  const approvedByStudent = new Map<number, number>();
  const pendingByStudent = new Map<number, number>();
  achievements.forEach((item) => {
    if (item.status === 'approved') approvedByStudent.set(item.studentUserId, (approvedByStudent.get(item.studentUserId) ?? 0) + item.expectedPoints);
    if (item.status === 'pending') pendingByStudent.set(item.studentUserId, (pendingByStudent.get(item.studentUserId) ?? 0) + 1);
  });

  const stats = [
    { label: 'Всего учащихся', value: students.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: 'С подтвержденными достижениями', value: students.filter((s) => (approvedByStudent.get(s.id) ?? 0) > 0).length, icon: Award, color: 'bg-green-50 text-green-700' },
    { label: 'Ожидают проверки', value: students.filter((s) => (pendingByStudent.get(s.id) ?? 0) > 0).length, icon: Clock, color: 'bg-yellow-50 text-yellow-700' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  </div>
                  <div className={`p-2 rounded-md ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Реестр учащихся ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Таблица</TabsTrigger>
              <TabsTrigger value="cards">Карточки</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Фамилия</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Отчество</TableHead>
                      <TableHead>Класс</TableHead>
                      <TableHead>Баллы</TableHead>
                      <TableHead className="w-40">Действия</TableHead>
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
                          <TableCell>{student.lastName}</TableCell>
                          <TableCell>{student.firstName}</TableCell>
                          <TableCell>{student.middleName}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell className="font-medium text-blue-700">{approvedByStudent.get(student.id) ?? 0}</TableCell>
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
            </TabsContent>

            <TabsContent value="cards">
              {filteredStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Учащиеся не найдены</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => {
                    const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`.trim();
                    return (
                      <Card key={student.id} className="border-gray-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">{fullName}</p>
                              <p className="text-sm text-gray-500">{student.class} класс</p>
                            </div>
                            <Badge variant="secondary">ID {student.id}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Подтверждено баллов</span>
                            <span className="font-semibold text-blue-700">{approvedByStudent.get(student.id) ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Заявок на проверке</span>
                            <span className="font-semibold text-amber-600">{pendingByStudent.get(student.id) ?? 0}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => onViewStudent(student.id)} className="w-full gap-2">
                            <Eye className="w-4 h-4" />
                            Открыть профиль достижений
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
