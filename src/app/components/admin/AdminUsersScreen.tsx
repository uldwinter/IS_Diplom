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
import { addUser, deleteUser, updateUser, useBackendState, UserRecord } from '@/app/backend/store';

const EMPTY_FORM = {
  name: '', email: '', login: '', password: '', role: 'student' as UserRecord['role'], class: '', status: 'active' as UserRecord['status'],
};

const getRoleBadge = (role: string) => role === 'admin' ? <Badge className="bg-red-600">Администратор</Badge> : role === 'curator' ? <Badge className="bg-blue-600">Куратор</Badge> : <Badge className="bg-green-600">Ученик</Badge>;
const getRoleIcon = (role: string) => role === 'admin' ? <ShieldCheck className="w-4 h-4 text-red-600" /> : role === 'curator' ? <UserCheck className="w-4 h-4 text-blue-600" /> : <GraduationCap className="w-4 h-4 text-green-600" />;

export function AdminUsersScreen() {
  const { users } = useBackendState();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || user.login.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => { setFormData(EMPTY_FORM); setIsAddDialogOpen(true); };
  const handleOpenEdit = (user: UserRecord) => { setSelectedUser(user); setFormData({ ...EMPTY_FORM, ...user, class: user.class ?? '' }); setIsEditDialogOpen(true); };
  const handleOpenDelete = (user: UserRecord) => { setSelectedUser(user); setIsDeleteDialogOpen(true); };

  const handleAddUser = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.login.trim() || !formData.password.trim()) return toast.error('Заполните обязательные поля');
    const result = addUser({ name: formData.name, email: formData.email, login: formData.login, password: formData.password, role: formData.role, class: formData.role === 'student' ? formData.class : undefined, status: formData.status });
    if (!result.ok) return toast.error(result.message);
    setIsAddDialogOpen(false); toast.success('Пользователь добавлен');
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    updateUser(selectedUser.id, { name: formData.name, email: formData.email, login: formData.login, password: formData.password, role: formData.role, class: formData.role === 'student' ? formData.class : undefined, status: formData.status });
    setIsEditDialogOpen(false); toast.success('Пользователь обновлен');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    setIsDeleteDialogOpen(false);
    toast.success('Пользователь удален');
  };

  const UserForm = () => (
    <div className="space-y-3">
      <div className="space-y-2"><Label>ФИО</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
      <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Логин</Label><Input value={formData.login} onChange={(e) => setFormData({ ...formData, login: e.target.value })} /></div>
        <div className="space-y-2"><Label>Пароль</Label><Input value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label>Роль</Label><Select value={formData.role} onValueChange={(v: UserRecord['role']) => setFormData({ ...formData, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Администратор</SelectItem><SelectItem value="curator">Куратор</SelectItem><SelectItem value="student">Ученик</SelectItem></SelectContent></Select></div>
      {formData.role === 'student' && <div className="space-y-2"><Label>Класс</Label><Input value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} /></div>}
      <div className="space-y-2"><Label>Статус</Label><Select value={formData.status} onValueChange={(v: UserRecord['status']) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Активен</SelectItem><SelectItem value="inactive">Неактивен</SelectItem></SelectContent></Select></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl text-gray-900 mb-2">Управление пользователями</h2><p className="text-gray-600">Пользователи и их учетные данные</p></div><Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 gap-2"><Plus className="w-4 h-4" />Добавить пользователя</Button></div>
      <Card><CardContent className="p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Поиск по имени, email или логину" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" /></div><Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-48 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все роли</SelectItem><SelectItem value="admin">Администраторы</SelectItem><SelectItem value="curator">Кураторы</SelectItem><SelectItem value="student">Ученики</SelectItem></SelectContent></Select></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Список пользователей ({filteredUsers.length})</CardTitle></CardHeader><CardContent><div className="border rounded-md"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead>Пользователь</TableHead><TableHead>Логин</TableHead><TableHead>Email</TableHead><TableHead>Роль</TableHead><TableHead>Класс</TableHead><TableHead>Статус</TableHead><TableHead>Последний вход</TableHead><TableHead>Действия</TableHead></TableRow></TableHeader><TableBody>{filteredUsers.map((user) => <TableRow key={user.id}><TableCell><div className="flex items-center gap-2">{getRoleIcon(user.role)}<span className="font-medium">{user.name}</span></div></TableCell><TableCell>{user.login}</TableCell><TableCell>{user.email}</TableCell><TableCell>{getRoleBadge(user.role)}</TableCell><TableCell>{user.class || '-'}</TableCell><TableCell>{user.status}</TableCell><TableCell>{user.lastLogin}</TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleOpenDelete(user)}><Trash2 className="w-4 h-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Добавить пользователя</DialogTitle><DialogDescription>Новый пользователь сможет войти через главную страницу</DialogDescription></DialogHeader><UserForm /><DialogFooter><Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button><Button onClick={handleAddUser}>Добавить</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Редактировать пользователя</DialogTitle></DialogHeader><UserForm /><DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button><Button onClick={handleSaveEdit}>Сохранить</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Удалить пользователя</DialogTitle></DialogHeader><div className="flex items-start gap-3 p-4 bg-red-50 rounded-md"><AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" /><div><p className="text-sm font-medium">Вы действительно хотите удалить пользователя?</p><p className="text-sm mt-1 font-semibold">{selectedUser?.name}</p></div></div><DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Отмена</Button><Button onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Удалить</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
