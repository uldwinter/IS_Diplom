import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendState } from '@/app/backend/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AcademicPeriod, PERIOD_LABELS, availableAcademicYears, currentAcademicYear, inAcademicPeriod, periodLabel, studentClassForYear, classCollator, monthBuckets, parseAchievementDate, toMonthKey, rankStudents } from '@/app/lib/academic';
import { downloadText, escapeHtml, printableHtml, printReport, tableHtml, toCsv } from '@/app/lib/export';

const CATEGORY_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export function AnalyticsScreen() {
  const { users, achievements } = useBackendState();
  const [year, setYear] = useState(currentAcademicYear);
  const [period, setPeriod] = useState<AcademicPeriod>('all');
  const years = availableAcademicYears(achievements, new Date(), users.filter((user) => user.role === 'student'));
  const analytics = useMemo(() => {
    const students = users.filter((user) => user.role === 'student');
    const events = achievements.filter((event) => inAcademicPeriod(event.date, year, period));
    const approved = events.filter((event) => event.status === 'approved');
    const activeStudentIds = new Set(events.map((event) => event.studentUserId));
    const studentsCount = activeStudentIds.size;
    const totalPoints = approved.reduce((sum, event) => sum + event.expectedPoints, 0);
    const categories = new Map<string, number>();
    events.forEach((event) => categories.set(event.category, (categories.get(event.category) || 0) + 1));
    const categoryDistribution = [...categories].sort((left, right) => right[1] - left[1]).map(([name, value], index) => ({ name, value, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }));
    const classes = new Map<string, { studentIds: Set<number>; totalPoints: number; achievements: number }>();
    const classEntry = (name: string) => {
      if (!classes.has(name)) classes.set(name, { studentIds: new Set(), totalPoints: 0, achievements: 0 });
      return classes.get(name)!;
    };
    students.forEach((student) => {
      const name = studentClassForYear(student, achievements, year);
      if (name !== '—') classEntry(name).studentIds.add(student.id);
    });
    events.forEach((event) => {
      const entry = classEntry(event.studentClass);
      entry.studentIds.add(event.studentUserId);
      if (event.status === 'approved') { entry.totalPoints += event.expectedPoints; entry.achievements += 1; }
    });
    const classComparisonData = [...classes].sort((left, right) => classCollator.compare(left[0], right[0])).map(([name, value]) => ({ class: name, students: value.studentIds.size, achievements: value.achievements, avgPoints: value.studentIds.size ? Math.round(value.totalPoints / value.studentIds.size) : 0 }));
    const months = monthBuckets(year, events.map((event) => event.date), period);
    const monthlyMap = new Map(months.map((month) => [month.key, { month: month.label, count: 0, points: 0, approved: 0, pending: 0, rejected: 0 }]));
    events.forEach((event) => {
      const date = parseAchievementDate(event.date);
      if (!date) return;
      const bucket = monthlyMap.get(toMonthKey(date));
      if (!bucket) return;
      bucket.count += 1;
      if (event.status === 'approved') { bucket.approved += 1; bucket.points += event.expectedPoints; }
      else if (event.status === 'pending') bucket.pending += 1;
      else if (event.status === 'rejected') bucket.rejected += 1;
    });
    const monthlyAchievementsData = [...monthlyMap.values()];
    const topStudentsData = rankStudents(students, achievements, year, period).filter((student) => student.totalPoints > 0).slice(0, 10).map((student) => ({ ...student, fullName: student.name, name: shortName(student.name), points: student.totalPoints, achievements: events.filter((event) => event.studentUserId === student.id).length }));
    return { studentsCount, achievementsCount: events.length, avgPoints: studentsCount ? Math.round(totalPoints / studentsCount) : 0, approvalRate: events.length ? Math.round(approved.length / events.length * 100) : 0, monthlyAchievementsData, approvalRateData: monthlyAchievementsData, categoryDistribution, classComparisonData, topStudentsData, periodLabel: periodLabel(year, period) };
  }, [users, achievements, year, period]);

  const handleExportAnalytics = (format: 'csv' | 'html' | 'pdf') => {
    const sections: Array<{ title: string; headers: string[]; rows: Array<Array<string | number>> }> = [
      { title: 'Итоги', headers: ['Показатель', 'Значение'], rows: [['Активных учеников', analytics.studentsCount], ['Всего достижений', analytics.achievementsCount], ['Средний балл активного ученика', analytics.avgPoints], ['Доля одобренных, %', analytics.approvalRate]] },
      { title: 'Помесячная динамика', headers: ['Месяц события', 'Всего', 'Баллы', 'Одобрено', 'На проверке', 'Отклонено'], rows: analytics.monthlyAchievementsData.map((row) => [row.month, row.count, row.points, row.approved, row.pending, row.rejected]) },
      { title: 'Категории', headers: ['Категория', 'Достижения'], rows: analytics.categoryDistribution.map((row) => [row.name, row.value]) },
      { title: 'Классы на дату события', headers: ['Класс', 'Учеников', 'Подтверждённых достижений', 'Средний балл'], rows: analytics.classComparisonData.map((row) => [row.class, row.students, row.achievements, row.avgPoints]) },
      { title: 'Топ учащихся', headers: ['Место', 'Ученик', 'Класс', 'Баллы', 'Достижения'], rows: analytics.topStudentsData.map((row) => [row.rank, row.fullName, row.class, row.points, row.achievements]) },
    ];
    const generatedAt = new Date().toLocaleString('ru-RU');
    const description = `${analytics.periodLabel}. По дате достижения; класс на дату события. Сформировано: ${generatedAt}.`;
    const html = printableHtml('Аналитика достижений', description, sections.map((section) => `<h2>${escapeHtml(section.title)}</h2>${tableHtml(section.headers, section.rows)}`).join(''));
    const filename = `analytics-${new Date().toISOString().slice(0, 10)}`;
    if (format === 'csv') downloadText('\uFEFF' + toCsv([['Период', analytics.periodLabel], ['Сформировано', generatedAt], ...sections.flatMap((section) => [[section.title], section.headers, ...section.rows, []])]), `${filename}.csv`, 'text/csv;charset=utf-8');
    else if (format === 'html') downloadText(html, `${filename}.html`, 'text/html;charset=utf-8');
    else if (!printReport(html)) return toast.error('Разрешите открытие окна печати');
    toast.success(format === 'pdf' ? 'Открыта печатная версия. Выберите «Сохранить как PDF».' : 'Аналитика сохранена');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Аналитика и статистика</h2>
          <p className="text-gray-600">Данные по дате достижения: {analytics.periodLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportAnalytics('csv')} variant="outline" className="gap-2"><Download className="w-4 h-4" />CSV</Button>
          <Button onClick={() => handleExportAnalytics('html')} variant="outline" className="gap-2"><Download className="w-4 h-4" />HTML</Button>
          <Button onClick={() => handleExportAnalytics('pdf')} variant="outline" className="gap-2"><Download className="w-4 h-4" />Печать / PDF</Button>
        </div>
      </div>

      <Card><CardContent className="p-4 grid gap-4 sm:grid-cols-2">
        <Select value={year} onValueChange={(value) => { setYear(value); setPeriod('all'); }}><SelectTrigger aria-label="Учебный год аналитики"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">За все годы</SelectItem>{years.map((value) => <SelectItem key={value} value={value}>{value.replace('-', '/')}</SelectItem>)}</SelectContent></Select>
        <Select value={period} disabled={year === 'all'} onValueChange={(value) => setPeriod(value as AcademicPeriod)}><SelectTrigger aria-label="Период аналитики"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PERIOD_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{year === 'all' && value === 'all' ? 'За все годы' : label}</SelectItem>)}</SelectContent></Select>
      </CardContent></Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ label: 'Всего достижений', value: analytics.achievementsCount, icon: Award, color: 'bg-blue-50 text-blue-600' }, { label: 'Активных учеников', value: analytics.studentsCount, icon: Users, color: 'bg-green-50 text-green-600' }, { label: 'Средний балл активного ученика', value: analytics.avgPoints, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' }, { label: 'Доля одобренных', value: `${analytics.approvalRate}%`, icon: BarChart3, color: 'bg-orange-50 text-orange-600' }].map((summary) => <Card key={summary.label}><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">{summary.label}</p><p className="text-3xl font-semibold text-gray-900">{summary.value}</p></div><div className={`p-3 rounded-lg ${summary.color}`}><summary.icon className="w-6 h-6" /></div></div></CardContent></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Помесячная динамика достижений</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><LineChart data={analytics.monthlyAchievementsData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="count" name="Заявки" stroke="#2563eb" strokeWidth={2} /><Line type="monotone" dataKey="points" name="Подтверждённые баллы" stroke="#10b981" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Статусы по месяцам</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={analytics.approvalRateData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="approved" name="Одобрено" stackId="statuses" fill="#16a34a" /><Bar dataKey="pending" name="На проверке" stackId="statuses" fill="#f59e0b" /><Bar dataKey="rejected" name="Отклонено" stackId="statuses" fill="#ef4444" /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Распределение по категориям</CardTitle></CardHeader><CardContent>{analytics.categoryDistribution.length === 0 ? <div className="flex h-[280px] items-center justify-center text-sm text-gray-500">Нет данных за выбранный период</div> : <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={analytics.categoryDistribution} dataKey="value" nameKey="name" outerRadius={100} label>{analytics.categoryDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Сравнение классов</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={analytics.classComparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="avgPoints" name="Средний балл" fill="#6366f1" /><Bar dataKey="achievements" name="Количество достижений" fill="#0ea5e9" /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Топ учащихся за период</CardTitle></CardHeader><CardContent>{analytics.topStudentsData.length === 0 ? <div className="text-sm text-gray-500">За выбранный период пока нет достижений для отображения.</div> : <div className="space-y-2">{analytics.topStudentsData.map((student) => <div key={student.id} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-gray-900">{student.rank}. {student.name}</p><p className="text-xs text-gray-500">{student.fullName} • {student.class} • достижений: {student.achievements}</p></div><span className="font-semibold text-blue-700">{student.points} баллов</span></div>)}</div>}</CardContent></Card>
    </div>
  );
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  return `${parts[0]} ${parts[1]?.[0] ?? ''}.${parts[2]?.[0] ? parts[2][0] + '.' : ''}`.trim();
}

