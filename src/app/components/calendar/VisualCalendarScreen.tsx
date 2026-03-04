import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: number;
  title: string;
  type: 'olympiad' | 'competition' | 'project' | 'volunteer' | 'announcement';
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  level: string;
}

const INITIAL_EVENTS: Event[] = [
  { id: 1, title: 'Всероссийская олимпиада по математике', type: 'olympiad', date: '2026-02-05', time: '10:00', location: 'Каб. 305', category: 'Учебные достижения', level: 'Всероссийский', description: 'Региональный этап олимпиады' },
  { id: 2, title: 'Конкурс проектов по информатике', type: 'project', date: '2026-02-10', time: '14:00', location: 'Актовый зал', category: 'Проектная деятельность', level: 'Школьный', description: 'Защита IT-проектов' },
  { id: 3, title: 'Волонтёрская акция', type: 'volunteer', date: '2026-02-15', time: '11:00', location: 'Приют', category: 'Внеурочная деятельность', level: '-', description: 'Помощь приюту для животных' },
  { id: 4, title: 'Объявление о родительском собрании', type: 'announcement', date: '2026-02-20', time: '18:00', location: 'Актовый зал', category: 'Объявления', level: '-', description: 'Общешкольное родительское собрание' },
];

export function VisualCalendarScreen({ userRole }: { userRole?: 'admin' | 'curator' | 'student' }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Февраль 2026
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    type: 'olympiad',
    date: '',
    time: '',
    location: '',
    description: '',
    category: '',
    level: '',
  });

  const canAddEvents = userRole === 'admin' || userRole === 'curator';

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => e.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setSelectedEvents(dayEvents);
      setIsDetailDialogOpen(true);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast.error('Заполните обязательные поля');
      return;
    }

    const eventToAdd: Event = {
      id: events.length + 1,
      title: newEvent.title || '',
      type: newEvent.type as Event['type'] || 'olympiad',
      date: newEvent.date || '',
      time: newEvent.time || '',
      location: newEvent.location || '',
      description: newEvent.description || '',
      category: newEvent.category || '',
      level: newEvent.level || '',
    };

    setEvents([...events, eventToAdd]);
    toast.success('Событие успешно добавлено!');
    setIsAddDialogOpen(false);
    setNewEvent({
      title: '',
      type: 'olympiad',
      date: '',
      time: '',
      location: '',
      description: '',
      category: '',
      level: '',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'olympiad': return 'bg-blue-500';
      case 'competition': return 'bg-green-500';
      case 'project': return 'bg-purple-500';
      case 'volunteer': return 'bg-orange-500';
      case 'announcement': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Календарь мероприятий</h2>
          <p className="text-base text-gray-600">Визуальное представление всех событий</p>
        </div>
        {canAddEvents && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить событие
          </Button>
        )}
      </div>

      {/* Навигация по месяцам */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isHovered = date && hoveredDate && date.toDateString() === hoveredDate.toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg transition-all ${
                    date
                      ? 'bg-white hover:bg-gray-50 cursor-pointer border-gray-200'
                      : 'bg-gray-50 border-gray-100'
                  } ${isToday ? 'border-2 border-blue-500' : ''} ${
                    isHovered && dayEvents.length > 0 ? 'shadow-md' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge variant="outline" className="h-5 px-1.5 text-xs">
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* События дня */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded text-white truncate ${getTypeColor(event.type)}`}
                          >
                            {event.time} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 px-2">
                            еще {dayEvents.length - 2}...
                          </div>
                        )}
                      </div>

                      {/* Подсказка при наведении */}
                      {isHovered && dayEvents.length > 0 && (
                        <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg w-64">
                          <p className="font-semibold text-sm text-gray-900 mb-2">
                            События {date.getDate()} {monthNames[date.getMonth()]}
                          </p>
                          <div className="space-y-2">
                            {dayEvents.map((event) => (
                              <div key={event.id} className="text-xs">
                                <p className="font-medium text-gray-900">{event.title}</p>
                                <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Легенда */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Типы событий:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm text-gray-600">Олимпиада</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm text-gray-600">Конкурс</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-sm text-gray-600">Проект</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-sm text-gray-600">Волонтёрство</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm text-gray-600">Объявление</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Диалог добавления события */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить новое событие</DialogTitle>
            <DialogDescription>Заполните информацию о мероприятии</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Название события *</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Всероссийская олимпиада по математике"
                />
              </div>
              <div className="space-y-2">
                <Label>Тип события *</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value as Event['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="olympiad">Олимпиада</SelectItem>
                    <SelectItem value="competition">Конкурс</SelectItem>
                    <SelectItem value="project">Проектная деятельность</SelectItem>
                    <SelectItem value="volunteer">Волонтёрство</SelectItem>
                    <SelectItem value="announcement">Объявление</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Категория</Label>
                <Input
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  placeholder="Учебные достижения"
                />
              </div>
              <div className="space-y-2">
                <Label>Дата *</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Время *</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Место проведения</Label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Каб. 305"
                />
              </div>
              <div className="space-y-2">
                <Label>Уровень</Label>
                <Input
                  value={newEvent.level}
                  onChange={(e) => setNewEvent({ ...newEvent, level: e.target.value })}
                  placeholder="Всероссийский"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Описание</Label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Подробное описание события..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleAddEvent} className="flex-1">
                Добавить событие
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра событий дня */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              События {selectedDate && `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvents.map((event) => (
              <Card key={event.id} className="border-l-4" style={{ borderLeftColor: getTypeColor(event.type).replace('bg-', '#') }}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="mt-2">{event.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {event.category && <Badge variant="outline">{event.category}</Badge>}
                      {event.level && <Badge variant="outline">{event.level}</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}