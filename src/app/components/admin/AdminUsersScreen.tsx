import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Plus, Search, Edit, Trash2, ShieldCheck, UserCheck, GraduationCap, AlertTriangle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/app/lib/AppContext';
import type { SystemUser } from '@/app/lib/types';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: 'school2026',
  role: 'student' as SystemUser['role'],
  class: '',
  status: 'active' as SystemUser['status'],
};

const getRoleIcon = (role: string) => {
  if (role === 'admin') return <ShieldCheck className="w-4 h-4 text-red-600" />;
  if (role === 'curator') return <UserCheck className="w-4 h-4 text-blue-600" />;
  return <GraduationCap className="w-4 h-4 text-green-600" />;
};

const getRoleBadge = (role: string) => {
  if (role === 'admin') return <Badge className="bg-red-600">Администратор</Badge>;
  if (role === 'curator') return <Badge className="bg-blue-600">Куратор</Badge>;
  return <Badge className="bg-green-600">Ученик</Badge>;
};

const getStatusBadge = (status: string) => {
  if (status === 'active') return <Badge variant="outline" className="border-green-600 text-green-700">Активен</Badge>;
  return <Badge variant="outline" className="border-gray-400 text-gray-600">Неактивен</Badge>;
};

export function AdminUsersScreen() {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    curators: users.filter((u) => u.role === 'curator').length,
    students: users.filter((u) => u.role === 'student').length,
  };

  const handleOpenAdd = () => {
    setFormData(EMPTY_FORM);
    setIsAddDialogOpen(true);
  };

  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Заполните обязательные поля: ФИО и Email');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      toast.error('Пользователь с таким email уже существует');
      return;
    }
    addUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || 'school2026',
      role: formData.role,
      class: formData.role === 'student' ? formData.class : undefined,
      status: formData.status,
    });
    setIsAddDialogOpen(false);
    toast.success(`Пользователь «${formData.name}» успешно добавлен`);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: user.password, role: user.role, class: user.class || '', status: user.status });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Заполните обязательные поля: ФИО и Email');
      return;
    }
    const emailConflict = users.find(u => u.id !== selectedUser.id && u.email.toLowerCase() === formData.email.toLowerCase());
    if (emailConflict) {
      toast.error('Этот email уже используется другим пользователем');
      return;
    }
    updateUser(selectedUser.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || selectedUser.password,
      role: formData.role,
      class: formData.role === 'student' ? formData.class : undefined,
      status: formData.status,
    });
    setIsEditDialogOpen(false);
    toast.success('Данные пользователя обновлены');
  };

  const handleOpenDelete = (user: SystemUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    setIsDeleteDialogOpen(false);
    toast.success(`Пользователь «${selectedUser.name}» удалён`);
    setSelectedUser(null);
  };

  const UserForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="form-name">ФИО *</Label>
        <Input
          id="form-name"
          placeholder="Иванов Иван Иванович"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-email">Email *</Label>
        <Input
          id="form-email"
          type="email"
          placeholder="user@school.edu"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-password">
          <span className="flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> Пароль</span>
        </Label>
        <Input
          id="form-password"
          type="text"
          placeholder="Пароль для входа"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="bg-white font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label>Роль *</Label>
        <Select value={formData.role} onValueChange={(v: SystemUser['role']) => setFormData({ ...formData, role: v, class: '' })}>
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Администратор</SelectItem>
            <SelectItem value="curator">Куратор</SelectItem>
            <SelectItem value="student">Ученик</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.role === 'student' && (
        <div className="space-y-2">
          <Label>Класс</Label>
          <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Выберите класс" />
            </SelectTrigger>
            <SelectContent>
              {['9-1', '9-2', '9-3', '10-1', '10-2', '10-3', '11-1', '11-2'].map((cls) => (
                <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Статус</Label>
        <Select value={formData.status} onValueChange={(v: SystemUser['status']) => setFormData({ ...formData, status: v })}>
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="inactive">Неактивен</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Управление пользователями</h2>
          <p className="text-gray-600">Добавление, редактирование и удаление пользователей</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          Добавить пользователя
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Всего пользователей</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-md"><ShieldCheck className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-600">Администраторы</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-md"><UserCheck className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-600">Кураторы</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.curators}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-md"><GraduationCap className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-600">Ученики</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.students}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="admin">Администраторы</SelectItem>
                <SelectItem value="curator">Кураторы</SelectItem>
                <SelectItem value="student">Ученики</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Класс</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последний вход</TableHead>
                  <TableHead className="w-28">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.class || '-'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)} title="Редактировать">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleOpenDelete(user)}
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Диалог добавления */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить пользователя</DialogTitle>
            <DialogDescription>Заполните данные нового пользователя системы</DialogDescription>
          </DialogHeader>
          <UserForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Измените данные пользователя</DialogDescription>
          </DialogHeader>
          <UserForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить пользователя</DialogTitle>
            <DialogDescription>Это действие нельзя отменить</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-md">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Вы действительно хотите удалить пользователя?</p>
              <p className="text-sm text-gray-700 mt-1 font-semibold">{selectedUser?.name}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedUser?.email}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
