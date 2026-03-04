import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Users, Award, FileText, TrendingUp } from 'lucide-react';

export function MainScreen() {
  const stats = [
    { label: 'Всего учащихся', value: '486', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Зарегистрировано достижений', value: '1,247', icon: Award, color: 'bg-green-50 text-green-600' },
    { label: 'Сформировано отчетов', value: '34', icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: 'Активных классов', value: '18', icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Добро пожаловать</h2>
        <p className="text-gray-600">
          Информационная система учета индивидуальных достижений учащихся предназначена для
          систематизации и учета учебных, творческих и спортивных достижений учащихся
          образовательной организации. Система позволяет педагогическим работникам и
          администрации школы вести учет достижений, формировать отчеты и анализировать
          результаты деятельности учащихся.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-gray-600">{stat.label}</CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Возможности системы</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Учет учебных достижений учащихся (олимпиады, конкурсы, соревнования)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Регистрация внеурочной деятельности и проектной работы</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Формирование отчетов по классам и учащимся</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Анализ образовательных результатов</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние обновления</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-blue-600 pl-3">
                <p className="text-gray-900">Добавлено 12 новых достижений</p>
                <p className="text-gray-500 text-xs">18 января 2026</p>
              </div>
              <div className="border-l-2 border-blue-600 pl-3">
                <p className="text-gray-900">Сформирован отчет по 10-1 классу</p>
                <p className="text-gray-500 text-xs">17 января 2026</p>
              </div>
              <div className="border-l-2 border-blue-600 pl-3">
                <p className="text-gray-900">Обновлены данные учащихся</p>
                <p className="text-gray-500 text-xs">15 января 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
