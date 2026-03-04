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

interface AchievementRequest {
  id: number;
  studentName: string;
  studentClass: string;
  achievementName: string;
  category: string;
  level: string;
  result: string;
  expectedPoints: number;
  date: string;
  submittedDate: string;
  documents: string[];
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_REQUESTS: AchievementRequest[] = [
  { id: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', achievementName: 'Всероссийская олимпиада по математике', category: 'Учебные достижения', level: 'Региональный', result: 'Призёр', expectedPoints: 40, date: '15.01.2026', submittedDate: '16.01.2026', documents: ['Грамота.pdf', 'Протокол.pdf'], status: 'pending' },
  { id: 2, studentName: 'Петрова Мария Сергеевна', studentClass: '10-1', achievementName: 'Участие в волонтёрской акции', category: 'Внеурочная деятельность', level: '-', result: '25 часов', expectedPoints: 25, date: '18.01.2026', submittedDate: '18.01.2026', documents: ['Справка_волонтер.pdf'], description: 'Помощь в организации школьного мероприятия', status: 'pending' },
  { id: 3, studentName: 'Сидоров Алексей Петрович', studentClass: '10-2', achievementName: 'Защита проекта по информатике', category: 'Проектная деятельность', level: '-', result: 'Отлично', expectedPoints: 40, date: '19.01.2026', submittedDate: '19.01.2026', documents: ['Презентация.pdf', 'Оценочный_лист.pdf'], status: 'pending' },
  { id: 4, studentName: 'Новиков Дмитрий Александрович', studentClass: '9-3', achievementName: 'Муниципальная олимпиада по физике', category: 'Учебные достижения', level: 'Муниципальный', result: 'Победитель', expectedPoints: 20, date: '12.01.2026', submittedDate: '13.01.2026', documents: ['Диплом.pdf'], status: 'pending' },
  { id: 5, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', achievementName: 'Участие в спортивных соревнованиях', category: 'Внеурочная деятельность', level: 'Региональный', result: '2 место', expectedPoints: 30, date: '10.01.2026', submittedDate: '11.01.2026', documents: ['Грамота_спорт.pdf'], status: 'pending' },
];

export function CuratorRequestsScreen() {
  const [requests, setRequests] = useState<AchievementRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<AchievementRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');

  const mockHistory = [
    { id: 1, action: 'created' as const, user: 'Иванов И.И.', userRole: 'Ученик', timestamp: '16.01.2026 10:30' },
    { id: 2, action: 'submitted' as const, user: 'Иванов И.И.', userRole: 'Ученик', timestamp: '16.01.2026 10:35', comment: 'Заявка отправлена на проверку' },
  ];

  const handleViewRequest = (request: AchievementRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
    setActionType(null);
    setComment('');
  };

  const handleAction = (type: 'approve' | 'reject') => {
    setActionType(type);
  };

  const handleSubmitAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === 'reject' && !comment.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : r
      )
    );

    if (actionType === 'approve') {
      toast.success(`Заявка "${selectedRequest.achievementName}" одобрена. Начислено ${selectedRequest.expectedPoints} баллов.`);
    } else {
      toast.success(`Заявка "${selectedRequest.achievementName}" отклонена.`);
    }

    setIsDialogOpen(false);
    setSelectedRequest(null);
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
                <p className="text-2xl font-semibold text-yellow-700">{pendingRequests.length}</p>
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

      {/* Переключатель вкладок */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Ожидают проверки ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('processed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'processed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Обработанные ({processedRequests.length})
        </button>
      </div>

      {/* Таблица заявок */}
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
                {displayedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === 'processed' ? 8 : 7} className="text-center text-gray-500 py-8">
                      {activeTab === 'pending' ? 'Все заявки проверены!' : 'Нет обработанных заявок'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedRequests.map((request, index) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{request.studentName}</p>
                          <p className="text-xs text-gray-500">{request.studentClass} класс</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{request.achievementName}</p>
                          <p className="text-xs text-gray-600">{request.level} • {request.result}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{request.category}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-blue-700">{request.expectedPoints}</span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{request.submittedDate}</TableCell>
                      {activeTab === 'processed' && (
                        <TableCell>
                          {request.status === 'approved'
                            ? <Badge className="bg-green-600">Одобрено</Badge>
                            : <Badge className="bg-red-600">Отклонено</Badge>}
                        </TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
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

      {/* Диалог проверки заявки */}
      {selectedRequest && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Проверка заявки</DialogTitle>
              <DialogDescription>
                Проверьте информацию и прикрепленные документы
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Статус обработанной заявки */}
              {selectedRequest.status !== 'pending' && (
                <div className={`p-3 rounded-md border ${selectedRequest.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm font-medium ${selectedRequest.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedRequest.status === 'approved' ? '✓ Заявка одобрена' : '✗ Заявка отклонена'}
                  </p>
                </div>
              )}

              {/* Информация об учащемся */}
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-gray-900 mb-2">Информация об учащемся</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">ФИО:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.studentName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Класс:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.studentClass}</p>
                  </div>
                </div>
              </div>

              {/* Информация о достижении */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Информация о достижении</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Наименование:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.achievementName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Категория:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Уровень:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Результат:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.result}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Дата достижения:</span>
                    <p className="font-medium text-gray-900">{selectedRequest.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ожидаемые баллы:</span>
                    <p className="font-medium text-blue-700">{selectedRequest.expectedPoints}</p>
                  </div>
                </div>

                {selectedRequest.description && (
                  <div>
                    <span className="text-sm text-gray-600">Описание:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedRequest.description}</p>
                  </div>
                )}
              </div>

              {/* Прикрепленные документы */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Прикрепленные документы</h4>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900 flex-1">{doc}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Открытие документа: ${doc}`)}
                      >
                        Просмотр
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Действия — только для pending */}
              {selectedRequest.status === 'pending' && (
                <>
                  {actionType === null ? (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsHistoryOpen(true)}
                        className="w-full gap-2"
                      >
                        <History className="w-4 h-4" />
                        Посмотреть историю действий
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleAction('approve')}
                          className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Одобрить заявку
                        </Button>
                        <Button
                          onClick={() => handleAction('reject')}
                          className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Отклонить заявку
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-md border-2" style={{
                        backgroundColor: actionType === 'approve' ? '#f0fdf4' : '#fef2f2',
                        borderColor: actionType === 'approve' ? '#86efac' : '#fca5a5'
                      }}>
                        <p className="font-medium" style={{
                          color: actionType === 'approve' ? '#166534' : '#991b1b'
                        }}>
                          {actionType === 'approve' ? '✓ Заявка будет одобрена' : '✗ Заявка будет отклонена'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comment">
                          Комментарий {actionType === 'reject' && <span className="text-red-600">(обязательно)</span>}
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
                        <Button
                          variant="outline"
                          onClick={() => setActionType(null)}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={handleSubmitAction}
                          className="flex-1"
                          style={{
                            backgroundColor: actionType === 'approve' ? '#16a34a' : '#dc2626'
                          }}
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

      {/* Диалог истории */}
      {selectedRequest && (
        <AchievementHistoryDialog
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          achievementName={selectedRequest.achievementName}
          history={mockHistory}
        />
      )}
    </div>
  );
}
