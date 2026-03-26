import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, Calendar, Download, Share2, User, Layers } from 'lucide-react';
import { useSections } from '@/app/components/sections/SectionsContext';
import { getCurrentUser, useBackendState } from '@/app/backend/store';
import { toast } from 'sonner';

export function StudentPortfolioScreen() {
  const { achievements } = useBackendState();
  const currentUser = getCurrentUser();
  const { getStudentSections } = useSections();
  const mySections = getStudentSections(currentUser?.id ?? 0);
  const myAchievements = achievements
    .filter((a) => a.studentUserId === currentUser?.id && a.status === 'approved')
    .sort((a, b) => b.id - a.id);

  const [lastName = '', firstName = '', middleName = ''] = (currentUser?.name ?? '').split(' ');
  const totalPoints = myAchievements.reduce((sum, a) => sum + a.expectedPoints, 0);
  const avatar = `${lastName[0] ?? ''}${firstName[0] ?? ''}`.toUpperCase();

  const categorySource = [
    { key: 'Учебные достижения', label: 'Учебные', color: '#3b82f6' },
    { key: 'Внеурочная деятельность', label: 'Внеурочные', color: '#10b981' },
    { key: 'Проектная деятельность', label: 'Проектные', color: '#8b5cf6' },
  ];
  const achievementsData = categorySource
    .map((c) => {
      const list = myAchievements.filter((a) => a.category === c.key);
      return { category: c.label, count: list.length, points: list.reduce((s, a) => s + a.expectedPoints, 0), color: c.color };
    })
    .filter((c) => c.count > 0);

  const monthlyMap = new Map<string, number>();
  myAchievements.forEach((a) => {
    const [day, month, year] = a.date.split('.');
    const key = month && year ? `${month}.${year}` : a.date;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + a.expectedPoints);
  });
  const monthlyProgress = Array.from(monthlyMap.entries()).map(([month, points]) => ({ month, points }));
  const recentAchievements = myAchievements.slice(0, 10).map((a) => ({
    id: a.id,
    name: a.achievementName,
    category: a.category,
    level: a.level,
    result: a.result,
    points: a.expectedPoints,
    date: a.date,
  }));

  const handleDownloadPdf = () => {
    window.print();
    toast.success('Окно печати открыто. Сохраните как PDF.');
  };

  const handleShare = async () => {
    const text = `Портфолио: ${currentUser?.name ?? 'Ученик'}, баллы: ${totalPoints}`;
    if (navigator.share) {
      await navigator.share({ title: 'Портфолио учащегося', text });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success('Ссылка/данные портфолио скопированы');
  };

  return (
    <div className="space-y-6">
      {/* Шапка профиля */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 text-2xl">
                <AvatarFallback className="bg-blue-600 text-white">
                  {avatar || 'У'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentUser?.name ?? 'Неизвестный ученик'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {currentUser?.class ?? '—'} класс
                  </span>
                  <Badge className="bg-yellow-500">🏆 Портфолио учащегося</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Всего баллов</p>
                    <p className="text-2xl font-bold text-blue-700">{totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Достижений</p>
                    <p className="text-2xl font-bold text-gray-900">{myAchievements.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Категорий</p>
                    <p className="text-2xl font-bold text-gray-900">{achievementsData.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
              <Button className="gap-2" onClick={handleDownloadPdf}>
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
                value={totalPoints > 0 ? (category.points / totalPoints) * 100 : 0}
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
