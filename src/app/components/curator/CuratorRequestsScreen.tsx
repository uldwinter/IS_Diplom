import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Eye, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';
import { AchievementHistoryDialog } from '@/app/components/audit/AchievementHistoryDialog';
import { toast } from 'sonner';
import { processAchievement, useBackendState } from '@/app/backend/store';

export function CuratorRequestsScreen() {
  const { achievements } = useBackendState();
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');

  const requests = useMemo(() => achievements, [achievements]);
  const selectedRequest = requests.find((r) => r.id === selectedRequestId) ?? null;

  const handleViewRequest = (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsDialogOpen(true);
    setActionType(null);
    setComment('');
  };

  const handleSubmitAction = () => {
    if (!selectedRequest || !actionType) return;
    if (actionType === 'reject' && !comment.trim()) return toast.error('Укажите причину отклонения');
    processAchievement(selectedRequest.id, actionType, comment);
    toast.success(actionType === 'approve' ? `Заявка одобрена. Начислено ${selectedRequest.expectedPoints} баллов.` : 'Заявка отклонена.');
    setIsDialogOpen(false);
    setSelectedRequestId(null);
    setActionType(null);
    setComment('');
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;
  const displayedRequests = activeTab === 'pending' ? pendingRequests : processedRequests;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl text-gray-900 mb-2">Проверка заявок на достижения</h2><p className="text-gray-600">Модерация и подтверждение достижений учащихся</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">На проверке</p><p className="text-2xl font-semibold text-yellow-700">{pendingRequests.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Одобрено</p><p className="text-2xl font-semibold text-green-700">{approvedCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Отклонено</p><p className="text-2xl font-semibold text-red-700">{rejectedCount}</p></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm border-b-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>На проверке ({pendingRequests.length})</button>
        <button onClick={() => setActiveTab('processed')} className={`px-4 py-2 text-sm border-b-2 ${activeTab === 'processed' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Обработанные ({processedRequests.length})</button>
      </div>

      <Card><CardHeader><CardTitle>{activeTab === 'pending' ? 'Заявки на модерацию' : 'Обработанные заявки'}</CardTitle></CardHeader><CardContent><div className="border rounded-md"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead>№</TableHead><TableHead>Учащийся</TableHead><TableHead>Достижение</TableHead><TableHead>Категория</TableHead><TableHead className="text-center">Баллы</TableHead><TableHead>Дата подачи</TableHead>{activeTab === 'processed' && <TableHead>Статус</TableHead>}<TableHead>Действия</TableHead></TableRow></TableHeader><TableBody>{displayedRequests.length === 0 ? <TableRow><TableCell colSpan={activeTab === 'processed' ? 8 : 7} className="text-center text-gray-500 py-8">{activeTab === 'pending' ? 'Все заявки проверены!' : 'Нет обработанных заявок'}</TableCell></TableRow> : displayedRequests.map((request, index) => <TableRow key={request.id}><TableCell>{index + 1}</TableCell><TableCell><p className="font-medium text-gray-900">{request.studentName}</p><p className="text-xs text-gray-500">{request.studentClass} класс</p></TableCell><TableCell><p className="text-sm text-gray-900">{request.achievementName}</p><p className="text-xs text-gray-600">{request.level} • {request.result}</p></TableCell><TableCell className="text-sm text-gray-600">{request.category}</TableCell><TableCell className="text-center font-semibold text-blue-700">{request.expectedPoints}</TableCell><TableCell className="text-sm text-gray-600">{request.submittedDate}</TableCell>{activeTab === 'processed' && <TableCell>{request.status === 'approved' ? <Badge className="bg-green-600">Одобрено</Badge> : <Badge className="bg-red-600">Отклонено</Badge>}</TableCell>}<TableCell><Button variant="outline" size="sm" onClick={() => handleViewRequest(request.id)} className="gap-2"><Eye className="w-4 h-4" />{activeTab === 'pending' ? 'Проверить' : 'Просмотр'}</Button></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>

      {selectedRequest && <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Проверка заявки</DialogTitle><DialogDescription>Проверьте информацию и прикрепленные документы</DialogDescription></DialogHeader><div className="space-y-6"><div className="p-4 bg-gray-50 rounded-md"><h4 className="font-semibold text-gray-900 mb-2">Информация об учащемся</h4><p>{selectedRequest.studentName}, {selectedRequest.studentClass} класс</p></div><div className="p-4 bg-blue-50 rounded-md"><h4 className="font-semibold text-gray-900 mb-2">Информация о достижении</h4><p className="font-medium">{selectedRequest.achievementName}</p><p className="text-sm text-gray-600 mt-1">{selectedRequest.category} • {selectedRequest.level} • {selectedRequest.result}</p><p className="text-sm mt-2">Баллы: <span className="font-semibold text-blue-700">{selectedRequest.expectedPoints}</span></p></div><div><h4 className="font-semibold text-gray-900 mb-2">Документы</h4><div className="space-y-2">{selectedRequest.documents.map((doc, idx) => <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded"><FileText className="w-4 h-4 text-gray-500" /><span className="text-sm">{doc}</span></div>)}</div></div><Button variant="outline" onClick={() => setIsHistoryOpen(true)} className="w-full gap-2"><Clock className="w-4 h-4" />История изменений</Button>{selectedRequest.status === 'pending' ? (actionType === null ? <div className="flex gap-3"><Button onClick={() => setActionType('approve')} className="flex-1 bg-green-600 hover:bg-green-700 gap-2"><CheckCircle className="w-4 h-4" />Одобрить</Button><Button onClick={() => setActionType('reject')} className="flex-1 bg-red-600 hover:bg-red-700 gap-2"><XCircle className="w-4 h-4" />Отклонить</Button></div> : <div className="space-y-4"><div className="space-y-2"><Label>Комментарий</Label><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={actionType === 'approve' ? 'Комментарий (необязательно)' : 'Причина отклонения'} rows={3} /></div><div className="flex gap-3"><Button variant="outline" onClick={() => setActionType(null)} className="flex-1">Назад</Button><Button onClick={handleSubmitAction} className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>{actionType === 'approve' ? 'Подтвердить одобрение' : 'Подтвердить отклонение'}</Button></div></div>) : <Badge className={selectedRequest.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}>{selectedRequest.status === 'approved' ? 'Заявка уже одобрена' : 'Заявка уже отклонена'}</Badge>}</div></DialogContent></Dialog>}

      {selectedRequest && <AchievementHistoryDialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen} achievementName={selectedRequest.achievementName} history={selectedRequest.history} />}
    </div>
  );
}
