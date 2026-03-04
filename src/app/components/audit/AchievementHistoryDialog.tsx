import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';

interface HistoryEntry {
  id: number;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'edited';
  user: string;
  userRole: string;
  timestamp: string;
  comment?: string;
  changes?: string[];
}

interface AchievementHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievementName: string;
  history: HistoryEntry[];
}

export function AchievementHistoryDialog({
  open,
  onOpenChange,
  achievementName,
  history,
}: AchievementHistoryDialogProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'edited':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Создано';
      case 'submitted':
        return 'Отправлено на проверку';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      case 'edited':
        return 'Отредактировано';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-blue-50 border-blue-200';
      case 'submitted':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'edited':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>История действий</DialogTitle>
          <DialogDescription>{achievementName}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Вертикальная линия */}
                {index < history.length - 1 && (
                  <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gray-200" />
                )}

                <div className={`border rounded-lg p-4 ${getActionColor(entry.action)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getActionIcon(entry.action)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {getActionLabel(entry.action)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {entry.user} ({entry.userRole})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {entry.timestamp}
                        </div>
                      </div>

                      {entry.comment && (
                        <div className="mt-2 p-2 bg-white/60 rounded border border-gray-200">
                          <p className="text-xs text-gray-700">
                            <strong>Комментарий:</strong> {entry.comment}
                          </p>
                        </div>
                      )}

                      {entry.changes && entry.changes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-700">Изменения:</p>
                          <ul className="space-y-1">
                            {entry.changes.map((change, idx) => (
                              <li key={idx} className="text-xs text-gray-600 ml-4">
                                • {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
