import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';
import type { SystemUser } from '@/app/lib/types';

interface LoginScreenProps {
  onLogin: (user: SystemUser) => void;
}

const DEMO_ACCOUNTS = [
  { role: 'Администратор', email: 'admin@school.edu', password: 'admin123', color: 'text-red-600' },
  { role: 'Куратор', email: 'petrov@school.edu', password: 'curator123', color: 'text-blue-600' },
  { role: 'Ученик', email: 'ivanov@school.edu', password: 'student123', color: 'text-green-600' },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = login(email.trim(), password);
      if (user) {
        onLogin(user);
      } else {
        setError('Неверный email или пароль. Проверьте данные и попробуйте снова.');
      }
      setLoading(false);
    }, 400);
  };

  const handleDemoLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">БД</span>
            </div>
            <CardTitle className="text-2xl mb-1">Банк достижений учащихся</CardTitle>
            <CardDescription className="text-sm">
              МАОУ ОЦ2 г. Челябинск
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="user@school.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="bg-white h-11"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="bg-white h-11"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base mt-6"
                disabled={loading || !email || !password}
              >
                {loading ? 'Выполняется вход...' : 'Войти в систему'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo accounts hint */}
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-4">
            <button
              type="button"
              onClick={() => setShowDemo(v => !v)}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="font-medium">Демо-аккаунты для тестирования</span>
              {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemo && (
              <div className="mt-3 space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.email}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleDemoLogin(acc)}
                  >
                    <div>
                      <p className={`text-sm font-medium ${acc.color}`}>{acc.role}</p>
                      <p className="text-xs text-gray-500">{acc.email} / {acc.password}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      Вставить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
