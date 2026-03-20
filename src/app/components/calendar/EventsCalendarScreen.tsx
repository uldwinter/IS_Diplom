import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { useBackendState } from '@/app/backend/store';

export function EventsCalendarScreen() {
  const { calendarEvents } = useBackendState();
  const upcoming = [...calendarEvents].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl text-gray-900 mb-2">Календарь событий</h2><p className="text-gray-600">Ближайшие события системы</p></div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-600" />Предстоящие события ({upcoming.length})</CardTitle></CardHeader><CardContent><div className="space-y-3">{upcoming.length === 0 ? <p className="text-sm text-gray-500">Событий пока нет</p> : upcoming.map((event) => <div key={event.id} className="border rounded-md p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium text-gray-900">{event.title}</p><p className="text-sm text-gray-600 mt-1">{event.description}</p><div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.date} {event.time}</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span></div></div><Badge>{event.category || event.type}</Badge></div></div>)}</div></CardContent></Card>
    </div>
  );
}
