import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, BarChart3 } from 'lucide-react';

// Данные для графиков
const monthlyAchievementsData = [
  { month: 'Сен', count: 45, points: 1250 },
  { month: 'Окт', count: 52, points: 1420 },
  { month: 'Ноя', count: 61, points: 1680 },
  { month: 'Дек', count: 48, points: 1350 },
  { month: 'Янв', count: 73, points: 2100 },
];

const categoryDistribution = [
  { name: 'Учебные достижения', value: 45, color: '#3b82f6' },
  { name: 'Внеурочная деятельность', value: 30, color: '#10b981' },
  { name: 'Проектная деятельность', value: 15, color: '#8b5cf6' },
  { name: 'Спортивные достижения', value: 10, color: '#f59e0b' },
];

const classComparisonData = [
  { class: '9-1', students: 28, avgPoints: 185, totalPoints: 5180 },
  { class: '9-2', students: 25, avgPoints: 172, totalPoints: 4300 },
  { class: '9-3', students: 27, avgPoints: 168, totalPoints: 4536 },
  { class: '10-1', students: 26, avgPoints: 201, totalPoints: 5226 },
  { class: '10-2', students: 24, avgPoints: 189, totalPoints: 4536 },
  { class: '10-3', students: 25, avgPoints: 178, totalPoints: 4450 },
];

const topStudentsData = [
  { name: 'Иванов И.И.', class: '10-1', points: 267, achievements: 12 },
  { name: 'Петрова М.С.', class: '10-1', points: 255, achievements: 11 },
  { name: 'Соловьева О.Д.', class: '9-1', points: 245, achievements: 10 },
  { name: 'Кузнецова Т.А.', class: '10-1', points: 241, achievements: 10 },
  { name: 'Новиков Д.А.', class: '9-3', points: 232, achievements: 9 },
  { name: 'Сидоров А.П.', class: '10-2', points: 228, achievements: 9 },
  { name: 'Михайлов А.С.', class: '9-1', points: 218, achievements: 8 },
  { name: 'Волков С.Н.', class: '10-3', points: 215, achievements: 8 },
];

const approvalRateData = [
  { month: 'Сентябрь', approved: 42, rejected: 3 },
  { month: 'Октябрь', approved: 48, rejected: 4 },
  { month: 'Ноябрь', approved: 57, rejected: 4 },
  { month: 'Декабрь', approved: 45, rejected: 3 },
  { month: 'Январь', approved: 68, rejected: 5 },
];

export function AnalyticsScreen() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Аналитика и статистика</h2>
          <p className="text-gray-600">Визуализация данных и метрики системы</p>
        </div>
        <Select defaultValue="current">
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Текущий год</SelectItem>
            <SelectItem value="q1">1 четверть</SelectItem>
            <SelectItem value="q2">2 четверть</SelectItem>
            <SelectItem value="q3">3 четверть</SelectItem>
            <SelectItem value="q4">4 четверть</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Всего достижений</p>
                <p className="text-3xl font-semibold text-gray-900">279</p>
                <p className="text-xs text-green-600 mt-1">↑ 18% за месяц</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Активных учеников</p>
                <p className="text-3xl font-semibold text-gray-900">155</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% за месяц</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Средний балл</p>
                <p className="text-3xl font-semibold text-gray-900">182</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% за месяц</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">% одобрения</p>
                <p className="text-3xl font-semibold text-gray-900">93%</p>
                <p className="text-xs text-gray-500 mt-1">260 из 279</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dynamics" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100">
          <TabsTrigger value="dynamics">Динамика</TabsTrigger>
          <TabsTrigger value="distribution">Распределение</TabsTrigger>
          <TabsTrigger value="classes">Классы</TabsTrigger>
          <TabsTrigger value="top">Топ учеников</TabsTrigger>
        </TabsList>

        {/* Динамика достижений */}
        <TabsContent value="dynamics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика достижений по месяцам</CardTitle>
                <CardDescription>Количество зарегистрированных достижений</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyAchievementsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Количество" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Динамика баллов по месяцам</CardTitle>
                <CardDescription>Общее количество начисленных баллов</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyAchievementsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      name="Баллы" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Статистика модерации</CardTitle>
              <CardDescription>Одобренные и отклоненные заявки по месяцам</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={approvalRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="approved" name="Одобрено" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="rejected" name="Отклонено" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Распределение по категориям */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение по категориям</CardTitle>
                <CardDescription>Процентное соотношение достижений</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Детальная статистика по категориям</CardTitle>
                <CardDescription>Количество достижений в каждой категории</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryDistribution.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <span className="text-gray-600">{category.value} достижений</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${category.value}%`,
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

        {/* Сравнение классов */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Сравнение классов</CardTitle>
              <CardDescription>Средний балл учащихся по классам</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={classComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="class" type="category" stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="avgPoints" name="Средний балл" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classComparisonData.map((classData, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{classData.class}</h3>
                    <p className="text-sm text-gray-600 mb-4">{classData.students} учеников</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Средний балл:</span>
                        <span className="font-semibold text-gray-900">{classData.avgPoints}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Всего баллов:</span>
                        <span className="font-semibold text-blue-700">{classData.totalPoints}</span>
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
              <CardDescription>Лидеры по количеству баллов в текущем учебном году</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topStudentsData.map((student, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      index === 0 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : index === 1 
                        ? 'bg-gray-50 border-gray-200' 
                        : index === 2 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      index === 0 
                        ? 'bg-yellow-500 text-white' 
                        : index === 1 
                        ? 'bg-gray-400 text-white' 
                        : index === 2 
                        ? 'bg-orange-500 text-white' 
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
                      <p className="text-xs text-gray-500">{student.achievements} достижений</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
