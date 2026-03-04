import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Plus, Newspaper, Trash2 } from 'lucide-react';
import { addNewsItem, deleteNewsItem, useBackendState } from '@/app/backend/store';

export function NewsAndAnnouncementsScreen({ canEdit }: { canEdit: boolean }) {
  const { news } = useBackendState();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', author: '', priority: 'normal' as 'low'|'normal'|'high', published: true });

  const handleAdd = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    addNewsItem(form);
    setIsOpen(false);
    setForm({ title: '', content: '', author: '', priority: 'normal', published: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl text-gray-900 mb-2">Новости и объявления</h2><p className="text-gray-600">Актуальная информация системы</p></div>{canEdit && <Button onClick={() => setIsOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Добавить</Button>}</div>
      <div className="space-y-4">{news.length === 0 ? <Card><CardContent className="p-6 text-center text-gray-500">Новостей пока нет</CardContent></Card> : news.map((item) => <Card key={item.id}><CardHeader><div className="flex justify-between items-start gap-2"><div><CardTitle className="text-lg flex items-center gap-2"><Newspaper className="w-4 h-4 text-blue-600" />{item.title}</CardTitle><p className="text-xs text-gray-500 mt-1">{item.date} • {item.author || 'Система'}</p></div><div className="flex gap-2 items-center"><Badge>{item.priority}</Badge>{canEdit && <Button variant="ghost" size="sm" onClick={() => deleteNewsItem(item.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>}</div></div></CardHeader><CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p></CardContent></Card>)}</div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>Новая новость</DialogTitle></DialogHeader><div className="space-y-3"><Label>Заголовок</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Label>Содержимое</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} /><Label>Автор</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /><Button onClick={handleAdd} className="w-full">Опубликовать</Button></div></DialogContent></Dialog>
    </div>
  );
}
