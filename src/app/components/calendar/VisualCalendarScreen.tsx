import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addCalendarEvent, deleteCalendarEvent, useBackendState } from '@/app/backend/store';

export function VisualCalendarScreen({ userRole }: { userRole?: 'admin' | 'curator' | 'student' }) {
  const { calendarEvents } = useBackendState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<typeof calendarEvents>([]);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'olympiad' as const, date: '', time: '', location: '', description: '', category: '', level: '' });
  const canAddEvents = userRole === 'admin' || userRole === 'curator';

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const arr: (Date | null)[] = [];
    const start = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < start; i++) arr.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) arr.push(new Date(year, month, i));
    return arr;
  }, [currentDate]);

  const eventsForDate = (date: Date | null) => date ? calendarEvents.filter((e) => e.date === date.toISOString().split('T')[0]) : [];

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return toast.error('Заполните обязательные поля');
    addCalendarEvent(newEvent);
    toast.success('Событие успешно добавлено');
    setIsAddDialogOpen(false);
    setNewEvent({ title: '', type: 'olympiad', date: '', time: '', location: '', description: '', category: '', level: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl text-gray-900 mb-2">Календарь событий</h2></div>{canAddEvents && <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2"><Plus className="w-4 h-4" />Добавить событие</Button>}</div>
      <Card><CardHeader><div className="flex items-center justify-between"><Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1,1))}><ChevronLeft className="w-4 h-4" /></Button><CardTitle>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle><Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1,1))}><ChevronRight className="w-4 h-4" /></Button></div></CardHeader><CardContent><div className="grid grid-cols-7 gap-2 mb-2">{weekDays.map((d) => <div key={d} className="text-center text-sm text-gray-500">{d}</div>)}</div><div className="grid grid-cols-7 gap-2">{days.map((date, idx) => { const dayEvents = eventsForDate(date); return <button key={idx} disabled={!date} onClick={() => { if (dayEvents.length) { setSelectedEvents(dayEvents); setIsDetailDialogOpen(true); } }} className={`min-h-[90px] border rounded-md p-2 text-left ${date ? 'hover:bg-gray-50' : 'bg-gray-50/40'}`}><div className="text-sm">{date?.getDate() ?? ''}</div><div className="mt-1 space-y-1">{dayEvents.slice(0,2).map((e) => <Badge key={e.id} className="block text-[10px] bg-blue-600">{e.title}</Badge>)}</div></button>; })}</div></CardContent></Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Добавить событие</DialogTitle></DialogHeader><div className="space-y-3"><Label>Название</Label><Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} /><Label>Дата</Label><Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} /><Label>Время</Label><Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} /><Label>Локация</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} /><Label>Тип</Label><Select value={newEvent.type} onValueChange={(v: any) => setNewEvent({ ...newEvent, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="olympiad">Олимпиада</SelectItem><SelectItem value="competition">Конкурс</SelectItem><SelectItem value="project">Проект</SelectItem><SelectItem value="volunteer">Волонтёрство</SelectItem><SelectItem value="announcement">Объявление</SelectItem></SelectContent></Select><Label>Описание</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} /><Button onClick={handleAddEvent} className="w-full">Сохранить</Button></div></DialogContent></Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}><DialogContent><DialogHeader><DialogTitle>События дня</DialogTitle><DialogDescription>{selectedEvents[0]?.date}</DialogDescription></DialogHeader><div className="space-y-3">{selectedEvents.map((e) => <div key={e.id} className="border rounded p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{e.title}</p><p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</p><p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</p></div>{canAddEvents && <Button variant="outline" size="sm" className="text-red-600" onClick={() => { deleteCalendarEvent(e.id); setSelectedEvents((prev) => prev.filter((item) => item.id !== e.id)); toast.success('Событие удалено'); }}><Trash2 className="w-4 h-4" /></Button>}</div></div>)}</div></DialogContent></Dialog>
    </div>
  );
}
