import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Award, BarChart3 } from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const CATEGORY_COLORS: Record<string, string> = {
  'Учебные достижения': '#3b82f6',
  'Внеурочная деятельность': '#10b981',
  'Проектная деятельность': '#8b5cf6',
  'Спортивные достижения': '#f59e0b',
  'Другое': '#6b7280',
};

export function AnalyticsScreen() {
  const { achievements, students } = useApp();

  // ── Key metrics ────────────────────────────────────────────
  const approved = achievements.filter(a => a.status === 'approved');
  const totalAchievements = achievements.length;
  const totalApproved = approved.length;
  const totalStudentsWithAchievements = new Set(approved.map(a => a.studentId)).size;
  const avgPoints = totalStudentsWithAchievements > 0
    ? Math.round(approved.reduce((s, a) => s + a.points, 0) / totalStudentsWithAchievements)
    : 0;
  const approvalRate = totalAchievements > 0
    ? Math.round((totalApproved / totalAchievements) * 100)
    : 0;

  // ── Monthly dynamics (based on submittedDate) ──────────────
  const monthlyData = useMemo(() => {
    const map: Record<string, { count: number; points: number; approved: number; rejected: number }> = {};
    achievements.forEach(a => {
      const parts = a.submittedDate.split('.');
      if (parts.length < 3) return;
      const monthIdx = parseInt(parts[1], 10) - 1;
      const key = MONTH_NAMES[monthIdx] ?? '?';
      if (!map[key]) map[key] = { count: 0, points: 0, approved: 0, rejected: 0 };
      map[key].count++;
      if (a.status === 'approved') { map[key].points += a.points; map[key].approved++; }
      if (a.status === 'rejected') map[key].rejected++;
    });
    const order = ['Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар'];
    return order.filter(m => map[m]).map(m => ({ month: m, ...map[m] }));
  }, [achievements]);

  // ── Category distribution ──────────────────────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    approved.forEach(a => {
      map[a.category] = (map[a.category] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] ?? '#6b7280',
    }));
  }, [approved]);

  const totalCategoryCount = categoryData.reduce((s, d) => s + d.value, 0);

  // ── Per-class stats ────────────────────────────────────────
  const classData = useMemo(() => {
    const map: Record<string, { points: number; count: number }> = {};
    students.forEach(s => {
      if (!map[s.class]) map[s.class] = { points: 0, count: 0 };
      map[s.class].count++;
    });
    approved.forEach(a => {
      if (!map[a.studentClass]) map[a.studentClass] = { points: 0, count: 1 };
      map[a.studentClass].points += a.points;
    });
    return Object.entries(map)
      .map(([cls, d]) => ({
        class: cls,
        students: d.count,
        totalPoints: d.points,
        avgPoints: d.count > 0 ? Math.round(d.points / d.count) : 0,
      }))
      .sort((a, b) => a.class.localeCompare(b.class));
  }, [students, approved]);

  // ── Top students ───────────────────────────────────────────
  const topStudents = useMemo(() => {
    const map: Record<number, { name: string; class: string; points: number; count: number }> = {};
    approved.forEach(a => {
      if (!map[a.studentId]) map[a.studentId] = { name: shortName(a.studentName), class: a.studentClass, points: 0, count: 0 };
      map[a.studentId].points += a.points;
      map[a.studentId].count++;
    });
    return Object.values(map).sort((a, b) => b.points - a.points).slice(0, 10);
  }, [approved]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Аналитика и статистика</h2>
          <p className="text-gray-600">Визуализация данных системы в реальном времени</p>
        </div>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Всего достижений</p>
                <p className="text-3xl font-semibold text-gray-900">{totalAchievements}</p>
                <p className="text-xs text-green-600 mt-1">Одобрено: {totalApproved}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg"><Award className="w-6 h-6 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Активных учеников</p>
                <p className="text-3xl font-semibold text-gray-900">{totalStudentsWithAchievements}</p>
                <p className="text-xs text-gray-500 mt-1">из {students.length} всего</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg"><Users className="w-6 h-6 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Средний балл</p>
                <p className="text-3xl font-semibold text-gray-900">{avgPoints}</p>
                <p className="text-xs text-green-600 mt-1">на активного ученика</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">% одобрения</p>
                <p className="text-3xl font-semibold text-gray-900">{approvalRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{totalApproved} из {totalAchievements}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg"><BarChart3 className="w-6 h-6 text-orange-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dynamics" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100">
          <TabsTrigger value="dynamics">Динамика</TabsTrigger>
          <TabsTrigger value="distribution">Распределени��</TabsTrigger>
          <TabsTrigger value="classes">Классы</TabsTrigger>
          <TabsTrigger value="top">Топ учеников</TabsTrigger>
        </TabsList>

        {/* Динамика */}
        <TabsContent value="dynamics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика достижений по месяцам</CardTitle>
                <CardDescription>Количество поданных заявок</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="count" name="Заявок" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Динамика начисленных баллов</CardTitle>
                <CardDescription>Баллы по одобренным достижениям</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="points" name="Баллы" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Статистика модерации</CardTitle>
              <CardDescription>Одобрённые и отклонённые заявки по месяцам</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="approved" name="Одобрено" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="rejected" name="Отклонено" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Распределение */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение по категориям</CardTitle>
                <CardDescription>Одобренные достижения</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={130}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Детальная статистика по категориям</CardTitle>
                <CardDescription>Количество одобренных достижений</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <span className="text-gray-600">{category.value} достижений</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${totalCategoryCount > 0 ? (category.value / totalCategoryCount) * 100 : 0}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Классы */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Сравнение классов по среднему баллу</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={classData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="class" type="category" stroke="#6b7280" width={50} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgPoints" name="Средний балл" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classData.map((classItem) => (
              <Card key={classItem.class}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{classItem.class}</h3>
                    <p className="text-sm text-gray-600 mb-4">{classItem.students} учеников</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Средний балл:</span>
                        <span className="font-semibold text-gray-900">{classItem.avgPoints}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Всего баллов:</span>
                        <span className="font-semibold text-blue-700">{classItem.totalPoints}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Топ учеников */}
        <TabsContent value="top" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Топ-10 учеников по баллам</CardTitle>
              <CardDescription>Лидеры по одобренным достижениям в текущем учебном году</CardDescription>
            </CardHeader>
            <CardContent>
              {topStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Нет данных</p>
              ) : (
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        index === 0 ? 'bg-yellow-50 border-yellow-200'
                        : index === 1 ? 'bg-gray-50 border-gray-200'
                        : index === 2 ? 'bg-orange-50 border-orange-200'
                        : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500 text-white'
                        : index === 1 ? 'bg-gray-400 text-white'
                        : index === 2 ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.class} класс</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-700">{student.points}</p>
                        <p className="text-xs text-gray-500">{student.count} достижений</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  return `${parts[0]} ${parts[1]?.[0] ?? ''}.${parts[2]?.[0] ? parts[2][0] + '.' : ''}`.trim();
}
