import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, Calendar, Download, Share2, User, Layers } from 'lucide-react';
import { useSections } from '@/app/components/sections/SectionsContext';

// Mock данные для портфолио
const studentProfile = {
  id: 1,
  lastName: 'Иванов',
  firstName: 'Иван',
  middleName: 'Иванович',
  class: '10-1',
  totalPoints: 267,
  rank: 1,
  avatar: 'ИИ',
};

const achievementsData = [
  { category: 'Учебные', count: 5, points: 165, color: '#3b82f6' },
  { category: 'Внеурочные', count: 4, points: 62, color: '#10b981' },
  { category: 'Проектные', count: 3, points: 40, color: '#8b5cf6' },
];

const monthlyProgress = [
  { month: 'Сен', points: 35 },
  { month: 'Окт', points: 50 },
  { month: 'Ноя', points: 72 },
  { month: 'Дек', points: 45 },
  { month: 'Янв', points: 65 },
];

const recentAchievements = [
  { id: 1, name: 'Всероссийская олимпиада по математике', category: 'Учебные', level: 'Региональный', result: 'Призёр', points: 40, date: '15.01.2026' },
  { id: 2, name: 'Защита проекта по информатике', category: 'Проектная деятельность', level: '-', result: 'Отлично', points: 40, date: '19.01.2026' },
  { id: 3, name: 'Олимпиада по информатике', category: 'Учебные', level: 'Школьный', result: 'Победитель', points: 10, date: '10.01.2026' },
  { id: 4, name: 'Участие в волонтёрской акции', category: 'Внеурочная', level: '-', result: '25 часов', points: 25, date: '18.01.2026' },
  { id: 5, name: 'Региональный конкурс по физике', category: 'Учебные', level: 'Региональный', result: 'Призёр', points: 25, date: '05.01.2026' },
];

export function StudentPortfolioScreen() {
  const { getStudentSections } = useSections();
  const mySections = getStudentSections(1); // Mock student ID 1

  return (
    <div className="space-y-6">
      {/* Шапка профиля */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 text-2xl">
                <AvatarFallback className="bg-blue-600 text-white">
                  {studentProfile.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {studentProfile.lastName} {studentProfile.firstName} {studentProfile.middleName}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {studentProfile.class} класс
                  </span>
                  <Badge className="bg-yellow-500">🏆 {studentProfile.rank} место в рейтинге</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Всего баллов</p>
                    <p className="text-2xl font-bold text-blue-700">{studentProfile.totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Достижений</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Категорий</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Скачать PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика и визуализация */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Распределение по категориям</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={achievementsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, points }) => `${category}: ${points}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="points"
                >
                  {achievementsData.map((entry, index) => (
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
            <CardTitle>Прогресс по месяцам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="points" name="Баллы" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievementsData.map((category, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                  <Award className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <Badge style={{ backgroundColor: category.color }}>{category.count}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.category}</h3>
              <p className="text-3xl font-bold mb-2" style={{ color: category.color }}>
                {category.points}
              </p>
              <p className="text-sm text-gray-600">баллов</p>
              <Progress 
                value={(category.points / studentProfile.totalPoints) * 100} 
                className="mt-3"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Мои секции */}
      <Card>
        <CardHeader>
          <CardTitle>Мои секции и кружки</CardTitle>
        </CardHeader>
        <CardContent>
          {mySections.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Вы пока не записаны в секции</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySections.map((section) => (
                <div key={section.id} className="flex items-center p-4 border rounded-lg bg-gray-50">
                  <div className="p-3 bg-white rounded-full mr-4 border">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{section.name}</h4>
                    <p className="text-sm text-gray-600">{section.schedule} • {section.teacher}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Список достижений */}
      <Card>
        <CardHeader>
          <CardTitle>Последние достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-50 rounded-md mt-1">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <Badge variant="outline">{achievement.category}</Badge>
                      <span>{achievement.level}</span>
                      <span>•</span>
                      <span>{achievement.result}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-700">{achievement.points}</p>
                  <p className="text-xs text-gray-500">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
