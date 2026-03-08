import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Plus, Newspaper, Megaphone, Award, ThumbsUp, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface News {
  id: number;
  type: 'news' | 'announcement';
  title: string;
  content: string;
  image?: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
}

const INITIAL_NEWS: News[] = [
  { 
    id: 1, 
    type: 'news', 
    title: 'Иванов И.И. стал призером Всероссийской олимпиады по математике!', 
    content: 'Ученик 10-1 класса Иванов Иван Иванович занял 2 место на региональном этапе Всероссийской олимпиады школьников по математике. Поздравляем!', 
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
    author: 'Куратор Иванова М.П.', 
    date: '01.02.2026', 
    likes: 45, 
    comments: 12 
  },
  { 
    id: 2, 
    type: 'news', 
    title: 'Защита IT-проектов прошла успешно', 
    content: 'Вчера состоялась защита проектов по информатике. Участвовало 15 учеников. Лучшими признаны проекты Новикова Д.А. и Петровой М.С.', 
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    author: 'Администратор', 
    date: '31.01.2026', 
    likes: 38, 
    comments: 8 
  },
  { 
    id: 3, 
    type: 'announcement', 
    title: 'Внимание! Родительское собрание 20 февраля', 
    content: 'Уважаемые родители! Приглашаем вас на общешкольное родительское собрание 20 февраля в 18:00 в актовый зал. Будут обсуждаться итоги 2 четверти и планы на 3 четверть.', 
    author: 'Администрация школы', 
    date: '01.02.2026', 
    likes: 15, 
    comments: 3 
  },
  { 
    id: 4, 
    type: 'news', 
    title: 'Волонтеры посетили приют для животных', 
    content: '15 учеников 9-11 классов приняли участие в волонтёрской акции помощи приюту. Ребята помогали ухаживать за животными и провели с ними время.', 
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
    author: 'Куратор Петров А.В.', 
    date: '30.01.2026', 
    likes: 52, 
    comments: 15 
  },
];

export function NewsAndAnnouncementsScreen({ canEdit }: { canEdit: boolean }) {
  const [items, setItems] = useState<News[]>(INITIAL_NEWS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<News>>({
    type: 'news',
    title: '',
    content: '',
    image: '',
    author: 'Куратор',
    date: new Date().toLocaleDateString('ru-RU'),
    likes: 0,
    comments: 0,
  });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.content) {
      toast.error('Заполните обязательные поля');
      return;
    }

    const itemToAdd: News = {
      id: items.length + 1,
      type: newItem.type as 'news' | 'announcement',
      title: newItem.title || '',
      content: newItem.content || '',
      image: newItem.image || undefined,
      author: newItem.author || 'Куратор',
      date: new Date().toLocaleDateString('ru-RU'),
      likes: 0,
      comments: 0,
    };

    setItems([itemToAdd, ...items]);
    toast.success(newItem.type === 'news' ? 'Новость опубликована!' : 'Объявление опубликовано!');
    setIsAddDialogOpen(false);
    setNewItem({
      type: 'news',
      title: '',
      content: '',
      image: '',
      author: 'Куратор',
      date: new Date().toLocaleDateString('ru-RU'),
      likes: 0,
      comments: 0,
    });
  };

  const newsItems = items.filter((i) => i.type === 'news');
  const announcements = items.filter((i) => i.type === 'announcement');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Новости и объявления</h2>
          <p className="text-base text-gray-600">Важная информация и успехи учащихся</p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Создать публикацию
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="news">Новости ({newsItems.length})</TabsTrigger>
          <TabsTrigger value="announcements">Объявления ({announcements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                {item.image && (
                  <div className="md:w-64 h-48 md:h-auto">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.type === 'news' ? (
                          <Award className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Megaphone className="w-5 h-5 text-orange-600" />
                        )}
                        <Badge className={item.type === 'news' ? 'bg-blue-600' : 'bg-orange-600'}>
                          {item.type === 'news' ? 'Новость' : 'Объявление'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <CardTitle className="mt-3">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{item.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                      <span className="font-medium">{item.author}</span>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          {item.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {item.comments}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="news" className="space-y-6 mt-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                {item.image && (
                  <div className="md:w-64 h-48 md:h-auto">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="bg-blue-600">Новость</Badge>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <CardTitle className="mt-3">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{item.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                      <span className="font-medium">{item.author}</span>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          {item.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {item.comments}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6 mt-6">
          {announcements.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge className="bg-orange-600">Объявление</Badge>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
                <CardTitle className="mt-3">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{item.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                  <span className="font-medium">{item.author}</span>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      {item.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {item.comments}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Диалог создания публикации */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать публикацию</DialogTitle>
            <DialogDescription>Добавьте новость или объявление</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тип публикации *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={newItem.type === 'news' ? 'default' : 'outline'}
                  onClick={() => setNewItem({ ...newItem, type: 'news' })}
                  className="flex-1"
                >
                  <Newspaper className="w-4 h-4 mr-2" />
                  Новость
                </Button>
                <Button
                  type="button"
                  variant={newItem.type === 'announcement' ? 'default' : 'outline'}
                  onClick={() => setNewItem({ ...newItem, type: 'announcement' })}
                  className="flex-1"
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Объявление
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Заголовок *</Label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Введите заголовок..."
              />
            </div>
            <div className="space-y-2">
              <Label>Содержание *</Label>
              <Textarea
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                placeholder="Введите текст публикации..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>URL изображения (необязательно)</Label>
              <Input
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleAddItem} className="flex-1">
                Опубликовать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}