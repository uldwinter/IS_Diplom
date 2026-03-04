import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'admin' | 'curator' | 'student') => void;
}

export function RoleSelectionScreen({ onSelectRole }: RoleSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Банк одаренных детей</CardTitle>
          <CardDescription className="text-base">Выберите вашу роль для входа в систему</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Администратор */}
            <div onClick={() => onSelectRole('admin')} className="cursor-pointer">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <ShieldCheck className="w-7 h-7 text-red-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">Администратор</CardTitle>
                  <CardDescription className="text-sm">Полный доступ к системе</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>Управление пользователями</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>Настройка системы</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>Просмотр всех данных</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>Формирование отчетов</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-base py-5">
                    Войти как администратор
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Куратор */}
            <div onClick={() => onSelectRole('curator')} className="cursor-pointer">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <UserCheck className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">Куратор</CardTitle>
                  <CardDescription className="text-sm">Модерация достижений</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Проверка заявок</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Одобрение достижений</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Отклонение заявок</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Просмотр учащихся</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-base py-5">
                    Войти как куратор
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Ученик */}
            <div onClick={() => onSelectRole('student')} className="cursor-pointer">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="w-7 h-7 text-green-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">Ученик</CardTitle>
                  <CardDescription className="text-sm">Личный кабинет</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Добавление достижений</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Загрузка документов</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Просмотр своего рейтинга</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Статус заявок</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-base py-5">
                    Войти как ученик
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}