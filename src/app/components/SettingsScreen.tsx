import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

export function SettingsScreen() {
  const [name, setName] = useState('Смирнова Елена Владимировна');
  const [position, setPosition] = useState('Заместитель директора');
  const [email, setEmail] = useState('smirnova@school.edu');
  const [phone, setPhone] = useState('+7 (495) 123-45-67');

  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [dateFormat, setDateFormat] = useState('dd.mm.yyyy');
  const [showTooltips, setShowTooltips] = useState(true);
  const [saveFilters, setSaveFilters] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Заполните обязательные поля: ФИО и Email');
      return;
    }
    toast.success('Данные профиля успешно сохранены');
  };

  const handleApplySettings = () => {
    toast.success('Настройки отображения применены');
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error('Введите текущий пароль');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Новый пароль должен содержать не менее 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    toast.success('Пароль успешно изменён');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Настройки</h2>
        <p className="text-gray-600">Настройки профиля и отображения данных</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Профиль пользователя */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки профиля пользователя</CardTitle>
            <CardDescription>Основная информация о пользователе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Фамилия Имя Отчество</Label>
              <Input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Должность</Label>
              <Input
                id="user-role"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">Телефон</Label>
              <Input
                id="user-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white"
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700">
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        {/* Настройки отображения */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки отображения данных</CardTitle>
            <CardDescription>Параметры интерфейса и таблиц</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rows-per-page">Записей на странице</Label>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                <SelectTrigger id="rows-per-page" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 записей</SelectItem>
                  <SelectItem value="25">25 записей</SelectItem>
                  <SelectItem value="50">50 записей</SelectItem>
                  <SelectItem value="100">100 записей</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Формат даты</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd.mm.yyyy">ДД.ММ.ГГГГ</SelectItem>
                  <SelectItem value="mm/dd/yyyy">ММ/ДД/ГГГГ</SelectItem>
                  <SelectItem value="yyyy-mm-dd">ГГГГ-ММ-ДД</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Показывать подсказки</Label>
                <p className="text-xs text-gray-500">Отображать всплывающие подсказки</p>
              </div>
              <Switch checked={showTooltips} onCheckedChange={setShowTooltips} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Автосохранение фильтров</Label>
                <p className="text-xs text-gray-500">Сохранять настройки фильтров таблиц</p>
              </div>
              <Switch checked={saveFilters} onCheckedChange={setSaveFilters} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Уведомления</Label>
                <p className="text-xs text-gray-500">Получать уведомления о новых достижениях</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <Button onClick={handleApplySettings} className="w-full bg-blue-600 hover:bg-blue-700">
              Применить настройки
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Безопасность */}
      <Card>
        <CardHeader>
          <CardTitle>Безопасность</CardTitle>
          <CardDescription>Смена пароля и настройки безопасности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Текущий пароль</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Введите текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Новый пароль</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Минимум 6 символов"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите пароль</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Повторите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white"
            />
          </div>

          <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">
            Изменить пароль
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
