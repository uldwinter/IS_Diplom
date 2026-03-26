import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addClassToCatalog, changeCurrentUserPassword, getCurrentUser, getUserSettings, removeClassFromCatalog, saveUserSettings, setScoringRules, updateCurrentUserProfile, useBackendState } from '@/app/backend/store';

export function SettingsScreen() {
  const { currentUserId, users, scoringRules, classCatalog } = useBackendState();
  const currentUser = users.find((u) => u.id === currentUserId) ?? getCurrentUser();
  const initial = currentUser ? getUserSettings(currentUser.id) : null;
  const [rulesDraft, setRulesDraft] = useState<Record<string, Record<string, number>>>(scoringRules);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [position, setPosition] = useState(initial?.position ?? 'Пользователь');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');

  const [rowsPerPage, setRowsPerPage] = useState(initial?.rowsPerPage ?? '10');
  const [dateFormat, setDateFormat] = useState(initial?.dateFormat ?? 'dd.mm.yyyy');
  const [showTooltips, setShowTooltips] = useState(initial?.showTooltips ?? true);
  const [saveFilters, setSaveFilters] = useState(initial?.saveFilters ?? true);
  const [notifications, setNotifications] = useState(initial?.notifications ?? true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newClassName, setNewClassName] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const s = getUserSettings(currentUser.id);
    setName(currentUser.name ?? '');
    setEmail(currentUser.email ?? '');
    if (!s) return;
    setPosition(s.position); setPhone(s.phone); setRowsPerPage(s.rowsPerPage); setDateFormat(s.dateFormat); setShowTooltips(s.showTooltips); setSaveFilters(s.saveFilters); setNotifications(s.notifications);
  }, [currentUser?.id]);
  useEffect(() => { setRulesDraft(scoringRules); }, [scoringRules]);

  useEffect(() => {
    if (!currentUser) return;
    const s = getUserSettings(currentUser.id);
    setName(currentUser.name ?? '');
    setEmail(currentUser.email ?? '');
    if (!s) return;
    setPosition(s.position); setPhone(s.phone); setRowsPerPage(s.rowsPerPage); setDateFormat(s.dateFormat); setShowTooltips(s.showTooltips); setSaveFilters(s.saveFilters); setNotifications(s.notifications);
  }, [currentUser?.id]);
  useEffect(() => { setRulesDraft(scoringRules); }, [scoringRules]);

  const handleSaveProfile = () => {
    if (!currentUser || !name.trim() || !email.trim()) return toast.error('Заполните обязательные поля: ФИО и Email');
    updateCurrentUserProfile({ name, email, phone, position });
    toast.success('Данные профиля успешно сохранены');
  };

  const handleApplySettings = () => {
    if (!currentUser) return;
    saveUserSettings(currentUser.id, { position, phone, rowsPerPage, dateFormat, showTooltips, saveFilters, notifications });
    toast.success('Настройки отображения применены');
  };

  const handleChangePassword = () => {
    if (!currentPassword) return toast.error('Введите текущий пароль');
    if (!newPassword || newPassword.length < 6) return toast.error('Новый пароль должен содержать не менее 6 символов');
    if (newPassword !== confirmPassword) return toast.error('Пароли не совпадают');
    const result = changeCurrentUserPassword(currentPassword, newPassword);
    if (!result.ok) return toast.error(result.message);
    toast.success('Пароль успешно изменён');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleSaveScoringRules = () => {
    if (currentUser?.role !== 'admin') return;
    setScoringRules(rulesDraft);
    toast.success('Стандарты начисления баллов сохранены');
  };

  const handleAddClass = () => {
    if (currentUser?.role !== 'admin') return;
    const result = addClassToCatalog(newClassName);
    if (!result.ok) return toast.error(result.message);
    setNewClassName('');
    toast.success('Класс добавлен');
  };

  const handleRemoveClass = (className: string) => {
    if (currentUser?.role !== 'admin') return;
    const result = removeClassFromCatalog(className);
    if (!result.ok) return toast.error(result.message);
    toast.success('Класс удален');
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl text-gray-900 mb-2">Настройки</h2><p className="text-gray-600">Настройки профиля и отображения данных</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Настройки профиля пользователя</CardTitle><CardDescription>Основная информация о пользователе</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Фамилия Имя Отчество</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white" /></div><div className="space-y-2"><Label>Должность</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} className="bg-white" /></div><div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white" /></div><div className="space-y-2"><Label>Телефон</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white" /></div><Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700">Сохранить изменения</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Настройки отображения данных</CardTitle><CardDescription>Параметры интерфейса и таблиц</CardDescription></CardHeader><CardContent className="space-y-6"><div className="space-y-2"><Label>Записей на странице</Label><Select value={rowsPerPage} onValueChange={setRowsPerPage}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10 записей</SelectItem><SelectItem value="25">25 записей</SelectItem><SelectItem value="50">50 записей</SelectItem><SelectItem value="100">100 записей</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Формат даты</Label><Select value={dateFormat} onValueChange={setDateFormat}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd.mm.yyyy">ДД.ММ.ГГГГ</SelectItem><SelectItem value="mm/dd/yyyy">ММ/ДД/ГГГГ</SelectItem><SelectItem value="yyyy-mm-dd">ГГГГ-ММ-ДД</SelectItem></SelectContent></Select></div><div className="flex items-center justify-between"><div><Label>Показывать подсказки</Label></div><Switch checked={showTooltips} onCheckedChange={setShowTooltips} /></div><div className="flex items-center justify-between"><div><Label>Автосохранение фильтров</Label></div><Switch checked={saveFilters} onCheckedChange={setSaveFilters} /></div><div className="flex items-center justify-between"><div><Label>Уведомления</Label></div><Switch checked={notifications} onCheckedChange={setNotifications} /></div><Button onClick={handleApplySettings} className="w-full bg-blue-600 hover:bg-blue-700">Применить настройки</Button></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Безопасность</CardTitle><CardDescription>Смена пароля и настройки безопасности</CardDescription></CardHeader><CardContent className="space-y-4 max-w-md"><div className="space-y-2"><Label>Текущий пароль</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white" /></div><div className="space-y-2"><Label>Новый пароль</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white" /></div><div className="space-y-2"><Label>Подтвердите пароль</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white" /></div><Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">Изменить пароль</Button></CardContent></Card>
      {currentUser?.role === 'admin' && <Card><CardHeader><CardTitle>Справочник классов</CardTitle><CardDescription>Управление списком классов для регистрации и карточек учеников</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex gap-2"><Input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Например: 12-1" /><Button onClick={handleAddClass}>Добавить класс</Button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{classCatalog.map((cls) => <div key={cls} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"><span>{cls}</span><Button variant="ghost" size="sm" onClick={() => handleRemoveClass(cls)}><Trash2 className="w-4 h-4 text-red-600" /></Button></div>)}</div></CardContent></Card>}
      {currentUser?.role === 'admin' && <Card><CardHeader><CardTitle>Стандарты начисления баллов</CardTitle><CardDescription>Администратор может изменять баллы по категориям и уровням</CardDescription></CardHeader><CardContent className="space-y-4">{Object.entries(rulesDraft).map(([category, levels]) => <div key={category} className="border rounded-md p-3 space-y-2"><p className="font-medium">{category}</p><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{Object.entries(levels).map(([level, value]) => <div key={level} className="space-y-1"><Label>{level}</Label><Input type="number" value={value} onChange={(e) => setRulesDraft((prev) => ({ ...prev, [category]: { ...prev[category], [level]: Number(e.target.value) || 0 } }))} /></div>)}</div></div>)}<Button onClick={handleSaveScoringRules} className="bg-blue-600 hover:bg-blue-700">Сохранить стандарты</Button></CardContent></Card>}
    </div>
  );
}
