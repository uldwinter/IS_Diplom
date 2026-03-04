import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, BarChart3 } from 'lucide-react';
import { useBackendState } from '@/app/backend/store';

export function AnalyticsScreen() {
  const { users, achievements } = useBackendState();

  const analytics = useMemo(() => {
    const students = users.filter((u) => u.role === 'student');
    const approved = achievements.filter((a) => a.status === 'approved');
    const rejected = achievements.filter((a) => a.status === 'rejected');

    const totalPoints = approved.reduce((sum, a) => sum + a.expectedPoints, 0);
    const avgPoints = students.length ? Math.round(totalPoints / students.length) : 0;
    const approvalRate = achievements.length ? Math.round((approved.length / achievements.length) * 100) : 0;

    const categoryMap = new Map<string, number>();
    achievements.forEach((a) => categoryMap.set(a.category, (categoryMap.get(a.category) ?? 0) + 1));
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value], idx) => ({ name, value, color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][idx % 4] }));

    const classMap = new Map<string, { students: number; totalPoints: number }>();
    students.forEach((s) => classMap.set(s.class ?? '—', { students: (classMap.get(s.class ?? '—')?.students ?? 0) + 1, totalPoints: classMap.get(s.class ?? '—')?.totalPoints ?? 0 }));
    approved.forEach((a) => {
      const cur = classMap.get(a.studentClass) ?? { students: 0, totalPoints: 0 };
      classMap.set(a.studentClass, { ...cur, totalPoints: cur.totalPoints + a.expectedPoints });
    });

    const classComparisonData = Array.from(classMap.entries()).map(([cls, v]) => ({ class: cls, students: v.students, avgPoints: v.students ? Math.round(v.totalPoints / v.students) : 0, totalPoints: v.totalPoints }));

    const monthly = new Map<string, { count: number; points: number }>();
    achievements.forEach((a) => {
      const k = a.submittedDate || a.date;
      const cur = monthly.get(k) ?? { count: 0, points: 0 };
      monthly.set(k, { count: cur.count + 1, points: cur.points + (a.status === 'approved' ? a.expectedPoints : 0) });
    });
    const monthlyAchievementsData = Array.from(monthly.entries()).slice(-8).map(([month, v]) => ({ month, count: v.count, points: v.points }));

    const approvalRateData = [{ month: 'Текущий', approved: approved.length, rejected: rejected.length }];

    const topStudentsData = students
      .map((s) => ({
        name: s.name,
        class: s.class ?? '—',
        points: approved.filter((a) => a.studentUserId === s.id).reduce((sum, a) => sum + a.expectedPoints, 0),
        achievements: approved.filter((a) => a.studentUserId === s.id).length,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    return { studentsCount: students.length, achievementsCount: achievements.length, avgPoints, approvalRate, monthlyAchievementsData, categoryDistribution, classComparisonData, topStudentsData, approvalRateData };
  }, [users, achievements]);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl text-gray-900 mb-2">Аналитика и статистика</h2><p className="text-gray-600">Автоматически рассчитанные показатели системы</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ label: 'Всего достижений', value: analytics.achievementsCount, icon: Award, color: 'bg-blue-50 text-blue-600' }, { label: 'Активных учеников', value: analytics.studentsCount, icon: Users, color: 'bg-green-50 text-green-600' }, { label: 'Средний балл', value: analytics.avgPoints, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' }, { label: '% одобрения', value: `${analytics.approvalRate}%`, icon: BarChart3, color: 'bg-orange-50 text-orange-600' }].map((s) => <Card key={s.label}><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 mb-1">{s.label}</p><p className="text-3xl font-semibold text-gray-900">{s.value}</p></div><div className={`p-3 rounded-lg ${s.color}`}><s.icon className="w-6 h-6" /></div></div></CardContent></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Динамика заявок</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><LineChart data={analytics.monthlyAchievementsData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="count" name="Кол-во" stroke="#3b82f6" /><Line type="monotone" dataKey="points" name="Баллы" stroke="#10b981" /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Распределение по категориям</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={analytics.categoryDistribution} dataKey="value" nameKey="name" outerRadius={100} label>{analytics.categoryDistribution.map((e) => <Cell key={e.name} fill={e.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Сравнение классов</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={analytics.classComparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class" /><YAxis /><Tooltip /><Legend /><Bar dataKey="avgPoints" name="Средний балл" fill="#6366f1" /></BarChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>ТОП учеников</CardTitle></CardHeader><CardContent><div className="space-y-2">{analytics.topStudentsData.map((s, i) => <div key={s.name + i} className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-sm">{i + 1}. {s.name} ({s.class})</span><span className="font-semibold text-blue-700">{s.points}</span></div>)}</div></CardContent></Card>
      </div>
    </div>
  );
}
