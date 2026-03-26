import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Bell, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';
import { deleteNotification, markAllNotificationsRead, markNotificationRead, useBackendState, UserRole } from '@/app/backend/store';

interface NotificationCenterProps {
  userRole: UserRole;
  userId?: number;
}

export function NotificationCenter({ userRole, userId }: NotificationCenterProps) {
  const { notifications } = useBackendState();
  const [open, setOpen] = useState(false);

  const userNotifications = useMemo(
    () => notifications.filter((n) => n.userRole === userRole && (userRole !== 'student' || !n.userId || n.userId === userId)),
    [notifications, userRole, userId]
  );

  const unreadCount = userNotifications.filter((n) => !n.read).length;
  const unreadNotifications = userNotifications.filter((n) => !n.read);

  const getIcon = (type: string) => type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : type === 'error' ? <XCircle className="w-4 h-4 text-red-600" /> : type === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-600" /> : <Clock className="w-4 h-4 text-blue-600" />;
  const getBackgroundColor = (type: string) => type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';

  const renderNotification = (notification: (typeof userNotifications)[number]) => (
    <div key={notification.id} className={`p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${getBackgroundColor(notification.type)}`}>{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <div className="flex items-center gap-1">
              {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteNotification(notification.id)}><X className="w-3 h-3" /></Button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{notification.timestamp}</span>
            {!notification.read && <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => markNotificationRead(notification.id)}>Отметить прочитанным</Button>}
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
          {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-600">{unreadCount}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Уведомления</h3>
          {unreadCount > 0 && <Button variant="ghost" size="sm" className="text-xs" onClick={() => markAllNotificationsRead(userRole, userId)}>Отметить все прочитанными</Button>}
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-gray-50 rounded-none border-b">
            <TabsTrigger value="unread" className="relative">Непрочитанные{unreadCount > 0 && <Badge className="ml-2 h-5 min-w-5 bg-blue-600">{unreadCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="all">Все</TabsTrigger>
          </TabsList>
          <TabsContent value="unread" className="m-0"><ScrollArea className="h-[400px]">{unreadNotifications.length === 0 ? <div className="p-8 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p className="text-sm">Нет новых уведомлений</p></div> : unreadNotifications.map(renderNotification)}</ScrollArea></TabsContent>
          <TabsContent value="all" className="m-0"><ScrollArea className="h-[400px]">{userNotifications.length === 0 ? <div className="p-8 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p className="text-sm">Нет уведомлений</p></div> : userNotifications.map(renderNotification)}</ScrollArea></TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
