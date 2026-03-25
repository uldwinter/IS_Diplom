import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { login, UserRecord } from '@/app/backend/store';

interface LoginScreenProps {
  onLogin: (user: UserRecord) => void;
  onOpenRegistration: () => void;
}

export function LoginScreen({ onLogin, onOpenRegistration }: LoginScreenProps) {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(loginValue, password);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(`Вход выполнен: ${result.user.name}`);
    onLogin(result.user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl mb-3">Банк одаренных детей</CardTitle>
          <CardDescription className="text-base">
            Система учета индивидуальных достижений учащихся
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-sm font-medium">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="Введите логин"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                className="bg-white h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white h-11"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base mt-6">
              Войти
            </Button>
            <Button type="button" variant="outline" onClick={onOpenRegistration} className="w-full h-11 text-base">
              Регистрация ученика
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Демо-аккаунты отключены. Для входа используйте учетные данные, выданные администратором.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
