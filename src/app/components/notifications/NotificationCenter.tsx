import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Bell, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationCenterProps {
  userRole: 'admin' | 'curator' | 'student';
}

const MOCK_NOTIFICATIONS_ADMIN: Notification[] = [
  { id: 1, type: 'info', title: 'Новый пользователь', message: 'Создан новый аккаунт куратора: Смирнова Е.В.', timestamp: '10:30', read: false },
  { id: 2, type: 'warning', title: 'Обновление системы', message: 'Доступна новая версия 2.2.0', timestamp: '09:15', read: false },
  { id: 3, type: 'success', title: 'Резервная копия создана', message: 'Успешно создана резервная копия базы данных', timestamp: 'Вчера', read: true },
];

const MOCK_NOTIFICATIONS_CURATOR: Notification[] = [
  { id: 1, type: 'info', title: 'Новая заявка', message: 'Иванов И.И. отправил заявку на проверку достижения', timestamp: '11:45', read: false },
  { id: 2, type: 'info', title: 'Новая заявка', message: 'Петрова М.С. отправила заявку на проверку достижения', timestamp: '10:20', read: false },
  { id: 3, type: 'info', title: 'Новая заявка', message: 'Сидоров А.П. отправил заявку на проверку достижения', timestamp: '09:30', read: false },
  { id: 4, type: 'success', title: 'Заявка проверена', message: 'Вы одобрили заявку Новикова Д.А.', timestamp: 'Вчера', read: true },
];

const MOCK_NOTIFICATIONS_STUDENT: Notification[] = [
  { id: 1, type: 'success', title: 'Заявка одобрена', message: 'Ваше достижение "Всероссийская олимпиада по математике" одобрено. Начислено 40 баллов.', timestamp: '14:30', read: false },
  { id: 2, type: 'error', title: 'Заявка отклонена', message: 'Достижение "Участие в школьном театре" отклонено. Требуется справка от руководителя.', timestamp: '13:15', read: false },
  { id: 3, type: 'info', title: 'Заявка на проверке', message: 'Ваша заявка "Участие в волонтёрской акции" отправлена на проверку', timestamp: 'Вчера', read: true },
];

export function NotificationCenter({ userRole }: NotificationCenterProps) {
  const getNotificationsByRole = () => {
    if (userRole === 'admin') return MOCK_NOTIFICATIONS_ADMIN;
    if (userRole === 'curator') return MOCK_NOTIFICATIONS_CURATOR;
    return MOCK_NOTIFICATIONS_STUDENT;
  };

  const [notifications, setNotifications] = useState<Notification[]>(getNotificationsByRole());
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={`p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${getBackgroundColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => deleteNotification(notification.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{notification.timestamp}</span>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() => markAsRead(notification.id)}
              >
                Отметить прочитанным
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-600">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Уведомления</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              Отметить все прочитанными
            </Button>
          )}
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-gray-50 rounded-none border-b">
            <TabsTrigger value="unread" className="relative">
              Непрочитанные
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 bg-blue-600">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Все</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[400px]">
              {unreadNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет новых уведомлений</p>
                </div>
              ) : (
                unreadNotifications.map(renderNotification)
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет уведомлений</p>
                </div>
              ) : (
                notifications.map(renderNotification)
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
