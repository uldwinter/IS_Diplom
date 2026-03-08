import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Eye, CheckCircle, XCircle, FileText, Clock, History } from 'lucide-react';
import { AchievementHistoryDialog } from '@/app/components/audit/AchievementHistoryDialog';
import { toast } from 'sonner';
import { useApp } from '@/app/lib/AppContext';
import type { Achievement } from '@/app/lib/types';

export function CuratorRequestsScreen() {
  const { achievements, updateAchievementStatus, currentUser } = useApp();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');

  const pendingList = achievements.filter((a) => a.status === 'pending');
  const processedList = achievements.filter((a) => a.status !== 'pending');
  const approvedCount = achievements.filter((a) => a.status === 'approved').length;
  const rejectedCount = achievements.filter((a) => a.status === 'rejected').length;
  const displayedList = activeTab === 'pending' ? pendingList : processedList;

  const handleView = (ach: Achievement) => {
    setSelectedAchievement(ach);
    setIsDialogOpen(true);
    setActionType(null);
    setComment('');
  };

  const handleAction = (type: 'approve' | 'reject') => {
    setActionType(type);
  };

  const handleSubmitAction = () => {
    if (!selectedAchievement || !actionType) return;
    if (actionType === 'reject' && !comment.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    updateAchievementStatus(
      selectedAchievement.id,
      actionType === 'approve' ? 'approved' : 'rejected',
      comment.trim() || undefined
    );
    if (actionType === 'approve') {
      toast.success(`Заявка «${selectedAchievement.name}» одобрена. Начислено ${selectedAchievement.points} баллов.`);
    } else {
      toast.success(`Заявка «${selectedAchievement.name}» отклонена.`);
    }
    setIsDialogOpen(false);
    setSelectedAchievement(null);
    setActionType(null);
    setComment('');
  };

  const mockHistory = selectedAchievement ? [
    { id: 1, action: 'created' as const, user: selectedAchievement.studentName, userRole: 'Ученик', timestamp: selectedAchievement.submittedDate + ' 10:30' },
    { id: 2, action: 'submitted' as const, user: selectedAchievement.studentName, userRole: 'Ученик', timestamp: selectedAchievement.submittedDate + ' 10:35', comment: 'Заявка отправлена на проверку' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Проверка заявок</h2>
        <p className="text-gray-600">Модерация заявок на регистрацию достижений</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">На проверке</p>
                <p className="text-2xl font-semibold text-yellow-700">{pendingList.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Одобрено</p>
                <p className="text-2xl font-semibold text-green-700">{approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Отклонено</p>
                <p className="text-2xl font-semibold text-red-700">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['pending', 'processed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'pending' ? `Ожидают проверки (${pendingList.length})` : `Обработанные (${processedList.length})`}
          </button>
        ))}
      </div>

      {/* Таблица */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'pending' ? 'Заявки на модерацию' : 'Обработанные заявки'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">№</TableHead>
                  <TableHead>Учащийся</TableHead>
                  <TableHead>Достижение</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead className="text-center">Баллы</TableHead>
                  <TableHead>Дата подачи</TableHead>
                  {activeTab === 'processed' && <TableHead>Статус</TableHead>}
                  <TableHead className="w-32">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === 'processed' ? 8 : 7} className="text-center text-gray-500 py-8">
                      {activeTab === 'pending' ? 'Все заявки проверены!' : 'Нет обработанных заявок'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedList.map((ach, index) => (
                    <TableRow key={ach.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{ach.studentName}</p>
                          <p className="text-xs text-gray-500">{ach.studentClass} класс</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{ach.name}</p>
                          <p className="text-xs text-gray-600">{ach.level} • {ach.result}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{ach.category}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-blue-700">{ach.points}</span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{ach.submittedDate}</TableCell>
                      {activeTab === 'processed' && (
                        <TableCell>
                          {ach.status === 'approved'
                            ? <Badge className="bg-green-600">Одобрено</Badge>
                            : <Badge className="bg-red-600">Отклонено</Badge>}
                        </TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(ach)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {activeTab === 'pending' ? 'Проверить' : 'Просмотр'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Диалог проверки */}
      {selectedAchievement && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Проверка заявки</DialogTitle>
              <DialogDescription>Проверьте информацию и прикрепленные документы</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {selectedAchievement.status !== 'pending' && (
                <div className={`p-3 rounded-md border ${selectedAchievement.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm font-medium ${selectedAchievement.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedAchievement.status === 'approved' ? '✓ Заявка одобрена' : '✗ Заявка отклонена'}
                    {selectedAchievement.reviewedBy && ` — ${selectedAchievement.reviewedBy} (${selectedAchievement.reviewedAt})`}
                  </p>
                  {selectedAchievement.comment && (
                    <p className="text-sm text-gray-700 mt-1">Комментарий: {selectedAchievement.comment}</p>
                  )}
                </div>
              )}

              {/* Учащийся */}
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-gray-900 mb-2">Информация об учащемся</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">ФИО:</span>
                    <p className="font-medium text-gray-900">{selectedAchievement.studentName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Класс:</span>
                    <p className="font-medium text-gray-900">{selectedAchievement.studentClass}</p>
                  </div>
                </div>
              </div>

              {/* Достижение */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Информация о достижении</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Наименование:</span><p className="font-medium text-gray-900">{selectedAchievement.name}</p></div>
                  <div><span className="text-gray-600">Категория:</span><p className="font-medium text-gray-900">{selectedAchievement.category}</p></div>
                  <div><span className="text-gray-600">Уровень:</span><p className="font-medium text-gray-900">{selectedAchievement.level}</p></div>
                  <div><span className="text-gray-600">Результат:</span><p className="font-medium text-gray-900">{selectedAchievement.result}</p></div>
                  <div><span className="text-gray-600">Дата достижения:</span><p className="font-medium text-gray-900">{selectedAchievement.date}</p></div>
                  <div><span className="text-gray-600">Баллы:</span><p className="font-medium text-blue-700">{selectedAchievement.points}</p></div>
                </div>
                {selectedAchievement.description && (
                  <div>
                    <span className="text-sm text-gray-600">Описание:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedAchievement.description}</p>
                  </div>
                )}
              </div>

              {/* Документы */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Прикрепленные документы</h4>
                {selectedAchievement.documents.length === 0 ? (
                  <p className="text-sm text-gray-500">Документы не прикреплены</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAchievement.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900 flex-1">{doc}</span>
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Открытие документа: ${doc}`)}>
                          Просмотр
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Действия (только для pending) */}
              {selectedAchievement.status === 'pending' && (
                <>
                  {actionType === null ? (
                    <div className="space-y-3">
                      <Button variant="outline" onClick={() => setIsHistoryOpen(true)} className="w-full gap-2">
                        <History className="w-4 h-4" />
                        Посмотреть историю действий
                      </Button>
                      <div className="flex gap-3">
                        <Button onClick={() => handleAction('approve')} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Одобрить заявку
                        </Button>
                        <Button onClick={() => handleAction('reject')} className="flex-1 bg-red-600 hover:bg-red-700 gap-2">
                          <XCircle className="w-4 h-4" />
                          Отклонить заявку
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div
                        className="p-4 rounded-md border-2"
                        style={{
                          backgroundColor: actionType === 'approve' ? '#f0fdf4' : '#fef2f2',
                          borderColor: actionType === 'approve' ? '#86efac' : '#fca5a5',
                        }}
                      >
                        <p className="font-medium" style={{ color: actionType === 'approve' ? '#166534' : '#991b1b' }}>
                          {actionType === 'approve' ? '✓ Заявка будет одобрена' : '✗ Заявка будет отклонена'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">
                          Комментарий{actionType === 'reject' && <span className="text-red-600"> (обязательно)</span>}
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder={actionType === 'approve' ? 'Дополнительный комментарий (необязательно)' : 'Укажите причину отклонения'}
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setActionType(null)} className="flex-1">
                          Отмена
                        </Button>
                        <Button
                          onClick={handleSubmitAction}
                          className="flex-1"
                          style={{ backgroundColor: actionType === 'approve' ? '#16a34a' : '#dc2626' }}
                        >
                          Подтвердить
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* История */}
      {selectedAchievement && (
        <AchievementHistoryDialog
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          achievementName={selectedAchievement.name}
          history={mockHistory}
        />
      )}
    </div>
  );
}
