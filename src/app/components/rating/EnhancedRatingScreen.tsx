import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Trophy, Search, Filter } from 'lucide-react';
import { useBackendState } from '@/app/backend/store';
import { AcademicPeriod, PERIOD_LABELS, availableAcademicYears, currentAcademicYear, studentClassForYear, inAcademicPeriod, rankStudents, classCollator } from '@/app/lib/academic';

export function EnhancedRatingScreen() {
  const { users, achievements } = useBackendState();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [year, setYear] = useState(currentAcademicYear);
  const [period, setPeriod] = useState<AcademicPeriod>('all');
  const students = users.filter((user) => user.role === 'student');
  const years = availableAcademicYears(achievements, new Date(), students);
  const classes = [...new Set([...students.map((student) => studentClassForYear(student, achievements, year)), ...achievements.filter((event) => inAcademicPeriod(event.date, year)).map((event) => event.studentClass)])].filter((value) => value !== '—').sort(classCollator.compare);
  const grades = [...new Set(classes.map((value) => value.split('-')[0]))].sort(classCollator.compare);
  const ranked = useMemo(() => rankStudents(students, achievements, year, period, selectedGrade, selectedClass), [users, achievements, year, period, selectedGrade, selectedClass]);
  const rating = ranked.filter((student) => student.name.toLocaleLowerCase('ru').includes(searchQuery.trim().toLocaleLowerCase('ru')));
  const top = ranked.filter((student) => student.rank <= 3 && student.totalPoints > 0);
  const getRankBadge = (rank: number) => rank <= 3 ? <Badge className={rank === 1 ? 'bg-yellow-500 text-white' : rank === 2 ? 'bg-gray-400 text-white' : 'bg-orange-500 text-white'}><Trophy className="w-3 h-3 mr-1" />{rank}</Badge> : <span className="text-gray-700 font-medium">{rank}</span>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Рейтинг учащихся</h2>
        <p className="text-base text-gray-600">Подтверждённые достижения по дате события. При равных баллах — общее место; поиск сохраняет место в рейтинге.</p>
      </div>

      <Card><CardContent className="p-4 grid gap-4 sm:grid-cols-2">
        <Select value={year} onValueChange={(value) => { setYear(value); setPeriod('all'); setSelectedGrade('all'); setSelectedClass('all'); }}><SelectTrigger aria-label="Учебный год рейтинга"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">За все годы</SelectItem>{years.map((value) => <SelectItem key={value} value={value}>{value.replace('-', '/')}</SelectItem>)}</SelectContent></Select>
        <Select value={period} disabled={year === 'all'} onValueChange={(value) => setPeriod(value as AcademicPeriod)}><SelectTrigger aria-label="Период рейтинга"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PERIOD_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{year === 'all' && value === 'all' ? 'За все годы' : label}</SelectItem>)}</SelectContent></Select>
      </CardContent></Card>
      <Card><CardContent className="p-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v); setSelectedClass('all'); }}><SelectTrigger className="bg-white"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Параллель" /></SelectTrigger><SelectContent><SelectItem value="all">Все параллели</SelectItem>{grades.map((g) => <SelectItem key={g} value={g}>{g} класс</SelectItem>)}</SelectContent></Select><Select value={selectedClass} onValueChange={setSelectedClass}><SelectTrigger className="bg-white"><SelectValue placeholder="Класс" /></SelectTrigger><SelectContent><SelectItem value="all">Все классы</SelectItem>{classes.filter((c) => selectedGrade === 'all' || c.startsWith(`${selectedGrade}-`)).map((cls) => <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>)}</SelectContent></Select><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input className="pl-10 bg-white" placeholder="Поиск по ФИО" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div></CardContent></Card>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100"><TabsTrigger value="table">Таблица рейтинга</TabsTrigger><TabsTrigger value="top">Топ-3</TabsTrigger></TabsList>
        <TabsContent value="table" className="mt-6">
          <Card><CardHeader><CardTitle>Рейтинг ({rating.length})</CardTitle><CardDescription>Места рассчитаны для выбранной параллели и класса до поиска по ФИО</CardDescription></CardHeader><CardContent><div className="border rounded-md"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead>Место</TableHead><TableHead>ФИО</TableHead><TableHead>Класс</TableHead><TableHead>Учебные</TableHead><TableHead>Внеурочные</TableHead><TableHead>Проекты</TableHead><TableHead>Итого</TableHead></TableRow></TableHeader><TableBody>{rating.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Нет данных для отображения</TableCell></TableRow> : rating.map((s) => <TableRow key={s.id}><TableCell>{getRankBadge(s.rank)}</TableCell><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.class}</TableCell><TableCell>{s.academicPoints}</TableCell><TableCell>{s.extracurricularPoints}</TableCell><TableCell>{s.projectPoints}</TableCell><TableCell className="font-semibold text-blue-700">{s.totalPoints}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
        </TabsContent>
        <TabsContent value="top" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{top.length === 0 && <p className="text-gray-500">За выбранный период подтверждённых баллов пока нет.</p>}{top.map((s) => <Card key={s.id}><CardHeader><CardTitle className="text-lg">{getRankBadge(s.rank)} место</CardTitle></CardHeader><CardContent><p className="font-medium">{s.name}</p><p className="text-sm text-gray-500">{s.class} класс</p><p className="text-2xl font-semibold text-blue-700 mt-2">{s.totalPoints} баллов</p></CardContent></Card>)}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

