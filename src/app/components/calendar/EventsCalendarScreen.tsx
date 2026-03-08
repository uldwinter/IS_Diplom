import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, Bell, MapPin, Clock, Award } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  type: 'olympiad' | 'competition' | 'project' | 'volunteer';
  date: string;
  time: string;
  location: string;
  category: string;
  level: string;
  deadline?: string;
  description: string;
}

const MOCK_EVENTS: Event[] = [
  { id: 1, title: 'Всероссийская олимпиада по математике', type: 'olympiad', date: '28.01.2026', time: '10:00', location: 'Каб. 305', category: 'Учебные достижения', level: 'Всероссийский', deadline: '25.01.2026', description: 'Региональный этап олимпиады' },
  { id: 2, title: 'Конкурс проектов по информатике', type: 'project', date: '30.01.2026', time: '14:00', location: 'Актовый зал', category: 'Проектная деятельность', level: 'Школьный', deadline: '28.01.2026', description: 'Защита IT-проектов' },
  { id: 3, title: 'Волонтёрская акция "Помощь приюту"', type: 'volunteer', date: '02.02.2026', time: '11:00', location: 'Приют "Доброе сердце"', category: 'Внеурочная деятельность', level: '-', description: 'Участие в благотворительной акции' },
  { id: 4, title: 'Олимпиада по физике', type: 'olympiad', date: '05.02.2026', time: '09:00', location: 'Каб. 201', category: 'Учебные достижения', level: 'Региональный', deadline: '01.02.2026', description: 'Муниципальный этап' },
  { id: 5, title: 'Творческий конкурс', type: 'competition', date: '08.02.2026', time: '15:00', location: 'Школьная сцена', category: 'Внеурочная деятельность', level: 'Муниципальный', description: 'Конкурс талантов' },
];

export function EventsCalendarScreen() {
  const [events] = useState<Event[]>(MOCK_EVENTS);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'olympiad': return 'bg-blue-600';
      case 'competition': return 'bg-green-600';
      case 'project': return 'bg-purple-600';
      case 'volunteer': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'olympiad': return 'Олимпиада';
      case 'competition': return 'Конкурс';
      case 'project': return 'Проектная деятельность';
      case 'volunteer': return 'Волонтёрство';
      default: return type;
    }
  };

  const upcomingEvents = events.filter((e) => new Date(e.date.split('.').reverse().join('-')) >= new Date());
  const eventsWithDeadlines = events.filter((e) => e.deadline);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Календарь мероприятий</h2>
        <p className="text-gray-600">Предстоящие олимпиады, конкурсы и мероприятия</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего мероприятий</p>
                <p className="text-3xl font-semibold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Олимпиады</p>
                <p className="text-3xl font-semibold text-blue-700">
                  {events.filter((e) => e.type === 'olympiad').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Конкурсы</p>
                <p className="text-3xl font-semibold text-green-700">
                  {events.filter((e) => e.type === 'competition').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">С дедлайнами</p>
                <p className="text-3xl font-semibold text-orange-700">{eventsWithDeadlines.length}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Предстоящие события */}
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие мероприятия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 ${getTypeColor(event.type)} rounded-md`}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge className={getTypeColor(event.type)}>
                          {getTypeLabel(event.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        {event.deadline && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Регистрация до {event.deadline}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{event.category}</Badge>
                        <Badge variant="outline">{event.level}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                {event.deadline && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button className="w-full" variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Напомнить о дедлайне
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
