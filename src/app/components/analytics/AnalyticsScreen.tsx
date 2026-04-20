import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendState } from '@/app/backend/store';

const ANALYTICS_PERIOD_MONTHS = [
  { key: '2025-09', label: 'Сен 25' },
  { key: '2025-10', label: 'Окт 25' },
  { key: '2025-11', label: 'Ноя 25' },
  { key: '2025-12', label: 'Дек 25' },
  { key: '2026-01', label: 'Янв 26' },
  { key: '2026-02', label: 'Фев 26' },
  { key: '2026-03', label: 'Мар 26' },
  { key: '2026-04', label: 'Апр 26' },
  { key: '2026-05', label: 'Май 26' },
  { key: '2026-06', label: 'Июн 26' },
] as const;

const ANALYTICS_PERIOD_START = new Date(2025, 8, 1, 0, 0, 0, 0);
const ANALYTICS_PERIOD_END = new Date(2026, 5, 30, 23, 59, 59, 999);
const CLASS_COLLATOR = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
const CATEGORY_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

function parseAchievementDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function toMonthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function isWithinAnalyticsPeriod(value: Date) {
  return value >= ANALYTICS_PERIOD_START && value <= ANALYTICS_PERIOD_END;
}

export function AnalyticsScreen() {
  const { users, achievements } = useBackendState();

  const analytics = useMemo(() => {
    const students = users.filter((user) => user.role === 'student');
    const achievementsInPeriod = achievements.filter((achievement) => {
      const parsedDate = parseAchievementDate(achievement.submittedDate || achievement.date);
      return parsedDate && !Number.isNaN(parsedDate.getTime()) && isWithinAnalyticsPeriod(parsedDate);
    });

    const approved = achievementsInPeriod.filter((achievement) => achievement.status === 'approved');
    const pending = achievementsInPeriod.filter((achievement) => achievement.status === 'pending');
    const rejected = achievementsInPeriod.filter((achievement) => achievement.status === 'rejected');

    const activeStudentIds = new Set(achievementsInPeriod.map((achievement) => achievement.studentUserId));
    const studentsCount = students.filter((student) => activeStudentIds.has(student.id)).length;
    const totalPoints = approved.reduce((sum, achievement) => sum + achievement.expectedPoints, 0);
    const avgPoints = studentsCount ? Math.round(totalPoints / studentsCount) : 0;
    const approvalRate = achievementsInPeriod.length ? Math.round((approved.length / achievementsInPeriod.length) * 100) : 0;

    const categoryMap = new Map<string, number>();
    achievementsInPeriod.forEach((achievement) => {
      categoryMap.set(achievement.category, (categoryMap.get(achievement.category) ?? 0) + 1);
    });
    const categoryDistribution = Array.from(categoryMap.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));

    const classMap = new Map<string, { students: number; totalPoints: number; achievements: number }>();
    students.forEach((student) => {
      const className = student.class ?? '—';
      const current = classMap.get(className) ?? { students: 0, totalPoints: 0, achievements: 0 };
      classMap.set(className, { ...current, students: current.students + 1 });
    });
    approved.forEach((achievement) => {
      const current = classMap.get(achievement.studentClass) ?? { students: 0, totalPoints: 0, achievements: 0 };
      classMap.set(achievement.studentClass, {
        ...current,
        totalPoints: current.totalPoints + achievement.expectedPoints,
        achievements: current.achievements + 1,
      });
    });
    const classComparisonData = Array.from(classMap.entries())
      .filter(([, value]) => value.students > 0)
      .sort((left, right) => CLASS_COLLATOR.compare(left[0], right[0]))
      .map(([className, value]) => ({
        class: className,
        students: value.students,
        achievements: value.achievements,
        avgPoints: value.students ? Math.round(value.totalPoints / value.students) : 0,
      }));

    const monthlyMap = new Map(
      ANALYTICS_PERIOD_MONTHS.map((month) => [
        month.key,
        { month: month.label, count: 0, points: 0, approved: 0, pending: 0, rejected: 0 },
      ]),
    );

    achievementsInPeriod.forEach((achievement) => {
      const parsedDate = parseAchievementDate(achievement.submittedDate || achievement.date);
      if (!parsedDate) return;
      const bucket = monthlyMap.get(toMonthKey(parsedDate));
      if (!bucket) return;

      bucket.count += 1;
      if (achievement.status === 'approved') {
        bucket.approved += 1;
        bucket.points += achievement.expectedPoints;
      }
      if (achievement.status === 'pending') bucket.pending += 1;
      if (achievement.status === 'rejected') bucket.rejected += 1;
    });

    const monthlyAchievementsData = ANALYTICS_PERIOD_MONTHS.map((month) => monthlyMap.get(month.key)!);
    const approvalRateData = monthlyAchievementsData.map(({ month, approved, pending, rejected }) => ({ month, approved, pending, rejected }));

    const topStudentsData = students
      .map((student) => {
        const studentApproved = approved.filter((achievement) => achievement.studentUserId === student.id);
        const studentAchievements = achievementsInPeriod.filter((achievement) => achievement.studentUserId === student.id);
        return {
          name: shortName(student.name),
          fullName: student.name,
          class: student.class ?? '—',
          points: studentApproved.reduce((sum, achievement) => sum + achievement.expectedPoints, 0),
          achievements: studentAchievements.length,
        };
      })
      .filter((student) => student.achievements > 0)
      .sort((left, right) => right.points - left.points || right.achievements - left.achievements || CLASS_COLLATOR.compare(left.class, right.class))
      .slice(0, 10);

    return {
      studentsCount,
      achievementsCount: achievementsInPeriod.length,
      avgPoints,
      approvalRate,
      monthlyAchievementsData,
      categoryDistribution,
      classComparisonData,
      topStudentsData,
      approvalRateData,
      periodLabel: 'Сентябрь 2025 — июнь 2026',
    };
  }, [users, achievements]);

  const handleExportAnalytics = (format: 'excel' | 'word' | 'pdf') => {
    const payload = {
      generatedAt: new Date().toISOString(),
      period: analytics.periodLabel,
      metrics: {
        studentsCount: analytics.studentsCount,
        achievementsCount: analytics.achievementsCount,
        avgPoints: analytics.avgPoints,
        approvalRate: analytics.approvalRate,
      },
      monthlyAchievementsData: analytics.monthlyAchievementsData,
      approvalRateData: analytics.approvalRateData,
      categoryDistribution: analytics.categoryDistribution,
      classComparisonData: analytics.classComparisonData,
      topStudentsData: analytics.topStudentsData,
    };

    const baseName = `analytics-${new Date().toISOString().slice(0, 10)}`;
    const csvRows = [
      ['Период', payload.period],
      ['Метрика', 'Значение'],
      ['Активных учеников', payload.metrics.studentsCount],
      ['Всего достижений', payload.metrics.achievementsCount],
      ['Средний балл', payload.metrics.avgPoints],
      ['Процент одобрения', payload.metrics.approvalRate],
    ];
    const csv = csvRows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\n');

    if (format === 'excel') {
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Аналитика экспортирована в Excel-совместимый CSV');
      return;
    }

    const html = `<html><head><meta charset="utf-8"><title>${baseName}</title></head><body><h2>Аналитика</h2><pre>${JSON.stringify(payload, null, 2)}</pre></body></html>`;
    if (format === 'word') {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Аналитика экспортирована в Word (DOC)');
      return;
    }

    const windowRef = window.open('', '_blank');
    if (!windowRef) return toast.error('Не удалось открыть окно печати PDF');
    windowRef.document.write(html);
    windowRef.document.close();
    windowRef.focus();
    windowRef.print();
    windowRef.close();
    toast.success('Открыто окно печати. Сохраните как PDF');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Аналитика и статистика</h2>
          <p className="text-gray-600">Данные за учебный период {analytics.periodLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportAnalytics('excel')} variant="outline" className="gap-2"><Download className="w-4 h-4" />Excel</Button>
          <Button onClick={() => handleExportAnalytics('word')} variant="outline" className="gap-2"><Download className="w-4 h-4" />Word</Button>
          <Button onClick={() => handleExportAnalytics('pdf')} variant="outline" className="gap-2"><Download className="w-4 h-4" />PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ label: 'Всего достижений', value: analytics.achievementsCount, icon: Award, color: 'bg-blue-50 text-blue-600' }, { label: 'Активных учеников', value: analytics.studentsCount, icon: Users, color: 'bg-green-50 text-green-600' }, { label: 'Средний балл', value: analytics.avgPoints, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' }, { label: '% одобрения', value: `${analytics.approvalRate}%`, icon: BarChart3, color: 'bg-orange-50 text-orange-600' }].map((summary) => <Card key={summary.label}><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">{summary.label}</p><p className="text-3xl font-semibold text-gray-900">{summary.value}</p></div><div className={`p-3 rounded-lg ${summary.color}`}><summary.icon className="w-6 h-6" /></div></div></CardContent></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Помесячная динамика достижений</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><LineChart data={analytics.monthlyAchievementsData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="count" name="Заявки" stroke="#2563eb" strokeWidth={2} /><Line type="monotone" dataKey="points" name="Подтверждённые баллы" stroke="#10b981" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Статусы по месяцам</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={analytics.approvalRateData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="approved" name="Одобрено" stackId="statuses" fill="#16a34a" /><Bar dataKey="pending" name="На проверке" stackId="statuses" fill="#f59e0b" /><Bar dataKey="rejected" name="Отклонено" stackId="statuses" fill="#ef4444" /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Распределение по категориям</CardTitle></CardHeader><CardContent>{analytics.categoryDistribution.length === 0 ? <div className="flex h-[280px] items-center justify-center text-sm text-gray-500">Нет данных за выбранный период</div> : <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={analytics.categoryDistribution} dataKey="value" nameKey="name" outerRadius={100} label>{analytics.categoryDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Сравнение классов</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={analytics.classComparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="avgPoints" name="Средний балл" fill="#6366f1" /><Bar dataKey="achievements" name="Количество достижений" fill="#0ea5e9" /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Топ учащихся за период</CardTitle></CardHeader><CardContent>{analytics.topStudentsData.length === 0 ? <div className="text-sm text-gray-500">За выбранный период пока нет достижений для отображения.</div> : <div className="space-y-2">{analytics.topStudentsData.map((student, index) => <div key={student.fullName + index} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-gray-900">{index + 1}. {student.name}</p><p className="text-xs text-gray-500">{student.fullName} • {student.class} • достижений: {student.achievements}</p></div><span className="font-semibold text-blue-700">{student.points} баллов</span></div>)}</div>}</CardContent></Card>
    </div>
  );
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  return `${parts[0]} ${parts[1]?.[0] ?? ''}.${parts[2]?.[0] ? parts[2][0] + '.' : ''}`.trim();
}
