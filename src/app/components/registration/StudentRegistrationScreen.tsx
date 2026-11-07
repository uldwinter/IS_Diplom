import { useMutation } from '@/app/components/useMutation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { UserPlus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { submitStudentRegistrationWithFallback, useBackendState } from '@/app/backend/store';

interface StudentRegistrationScreenProps {
  onBackToLogin: () => void;
}

export function StudentRegistrationScreen({ onBackToLogin }: StudentRegistrationScreenProps) {
  const { pending, execute } = useMutation();
  const { classCatalog } = useBackendState();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
    class: '',
    birthDate: '',
    parentPhone: '',
    parentEmail: '',
    login: '',
    password: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class || !classCatalog.includes(formData.class)) return toast.error('Выберите класс из справочника');
    if (formData.login.trim().length < 3) return toast.error('Логин должен содержать минимум 3 символа');
    if (formData.password.length < 8) return toast.error('Пароль должен содержать минимум 8 символов');
    if (!formData.birthDate || formData.birthDate > new Date().toISOString().slice(0, 10)) return toast.error('Укажите корректную дату рождения');
    const result = await execute(() => submitStudentRegistrationWithFallback(formData));

    if (!result?.ok) return;

    setIsSubmitted(true);
    toast.success('Заявка на регистрацию отправлена!');
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Заявка отправлена!</h2>
            <p className="text-gray-600 mb-6">
              Ваша заявка отправлена на проверку куратору. После подтверждения сможете войти по выбранным логину и паролю.
            </p>
            <Button onClick={onBackToLogin} className="w-full">
              Вернуться ко входу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl mb-2">Регистрация ученика</CardTitle>
          <CardDescription className="text-base">
            Заполните форму для регистрации в системе МоеПортфолио
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 pb-2 border-b text-base">Данные для входа</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Логин *</Label>
                  <Input minLength={3} autoComplete="username" id="login" value={formData.login} onChange={(e) => handleChange('login', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <Input minLength={8} autoComplete="new-password" id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 pb-2 border-b text-base">Персональные данные</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество *</Label>
                <Input id="middleName" value={formData.middleName} onChange={(e) => handleChange('middleName', e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Дата рождения *</Label>
                  <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Класс *</Label>
                  <Select value={formData.class} onValueChange={(value) => handleChange('class', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите класс" />
                    </SelectTrigger>
                    <SelectContent>
                      {classCatalog.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 pb-2 border-b">Контактные данные</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 pb-2 border-b">Данные родителей/законных представителей</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email родителя *</Label>
                  <Input id="parentEmail" type="email" value={formData.parentEmail} onChange={(e) => handleChange('parentEmail', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Телефон родителя *</Label>
                  <Input id="parentPhone" type="tel" value={formData.parentPhone} onChange={(e) => handleChange('parentPhone', e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {classCatalog.length === 0 && <p role="alert" className="text-sm text-red-600">Справочник классов недоступен. Проверьте подключение или обратитесь к администратору.</p>}
              <Button disabled={pending || classCatalog.length === 0} type="submit" className="w-full" size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Отправить заявку на регистрацию
              </Button>
              <Button type="button" variant="outline" onClick={onBackToLogin} className="w-full">
                Назад ко входу
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

