import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { processRegistration, RegistrationRequest, useBackendState } from '@/app/backend/store';

export function PendingRegistrationsScreen() {
  const { registrations } = useBackendState();
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  const pendingList = registrations.filter((r) => r.status === 'pending');
  const pendingCount = pendingList.length;

  const handleViewDetails = (reg: RegistrationRequest) => {
    setSelectedRegistration(reg);
    setIsDialogOpen(true);
    setActionType(null);
    setComment('');
  };

  const handleSubmitAction = () => {
    if (!selectedRegistration || !actionType) return;

    processRegistration(selectedRegistration.id, actionType, comment);

    toast.success(
      actionType === 'approve'
        ? `Регистрация одобрена! Ученик ${selectedRegistration.lastName} ${selectedRegistration.firstName} добавлен в систему.`
        : 'Регистрация отклонена.'
    );
    setIsDialogOpen(false);
    setSelectedRegistration(null);
    setActionType(null);
    setComment('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Заявки на регистрацию</h2>
        <p className="text-gray-600">Проверка и подтверждение новых учеников</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Ожидают проверки</p><p className="text-3xl font-semibold text-yellow-700">{pendingCount}</p></div><Clock className="w-8 h-8 text-yellow-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Одобрено</p><p className="text-3xl font-semibold text-green-700">{registrations.filter((r) => r.status === 'approved').length}</p></div><CheckCircle className="w-8 h-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Отклонено</p><p className="text-3xl font-semibold text-red-700">{registrations.filter((r) => r.status === 'rejected').length}</p></div><XCircle className="w-8 h-8 text-red-500" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ожидающие рассмотрения ({pendingCount})</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader><TableRow className="bg-gray-50"><TableHead>Дата заявки</TableHead><TableHead>ФИО</TableHead><TableHead>Класс</TableHead><TableHead>Email</TableHead><TableHead>Телефон</TableHead><TableHead>Статус</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingList.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Нет заявок, ожидающих проверки</TableCell></TableRow>
                ) : (
                  pendingList.map((registration) => (
                    <TableRow key={registration.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-600">{registration.submittedAt}</TableCell>
                      <TableCell className="font-medium">{registration.lastName} {registration.firstName} {registration.middleName}</TableCell>
                      <TableCell><Badge variant="outline">{registration.class}</Badge></TableCell>
                      <TableCell className="text-sm">{registration.email}</TableCell>
                      <TableCell className="text-sm">{registration.phone}</TableCell>
                      <TableCell><Badge className="bg-yellow-600">Ожидает проверки</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewDetails(registration)} className="gap-2"><Eye className="w-4 h-4" />Просмотреть</Button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Заявка на регистрацию</DialogTitle><DialogDescription>Проверьте данные и примите решение</DialogDescription></DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Персональные данные</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-600">ФИО</p><p className="font-medium">{selectedRegistration.lastName} {selectedRegistration.firstName} {selectedRegistration.middleName}</p></div>
                  <div><p className="text-gray-600">Дата рождения</p><p className="font-medium">{selectedRegistration.birthDate}</p></div>
                  <div><p className="text-gray-600">Класс</p><p className="font-medium">{selectedRegistration.class}</p></div>
                  <div><p className="text-gray-600">Email</p><p className="font-medium">{selectedRegistration.email}</p></div>
                  <div><p className="text-gray-600">Телефон</p><p className="font-medium">{selectedRegistration.phone || '—'}</p></div>
                  <div><p className="text-gray-600">Логин</p><p className="font-medium">{selectedRegistration.login}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Данные родителей</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-600">Email родителя</p><p className="font-medium">{selectedRegistration.parentEmail}</p></div>
                  <div><p className="text-gray-600">Телефон родителя</p><p className="font-medium">{selectedRegistration.parentPhone}</p></div>
                </div>
              </div>

              {actionType === null ? (
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setActionType('approve')} className="flex-1 bg-green-600 hover:bg-green-700 gap-2"><CheckCircle className="w-4 h-4" />Одобрить и зарегистрировать</Button>
                  <Button onClick={() => setActionType('reject')} className="flex-1 bg-red-600 hover:bg-red-700 gap-2"><XCircle className="w-4 h-4" />Отклонить заявку</Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Комментарий (необязательно)</Label>
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setActionType(null)} variant="outline" className="flex-1">Назад</Button>
                    <Button onClick={handleSubmitAction} className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                      {actionType === 'approve' ? 'Подтвердить регистрацию' : 'Отклонить заявку'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
