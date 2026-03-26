import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Newspaper, Trash2 } from 'lucide-react';
import { addNewsItem, deleteNewsItem, updateNewsItem, useBackendState } from '@/app/backend/store';

export function NewsAndAnnouncementsScreen({ canEdit }: { canEdit: boolean }) {
  const { news } = useBackendState();
  const visibleNews = canEdit ? news : news.filter((item) => item.published);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', content: '', author: '', priority: 'normal' as 'low'|'normal'|'high', published: true });
  const priorityLabel = (value: 'low' | 'normal' | 'high') => (value === 'high' ? 'Важная' : value === 'normal' ? 'Обычная' : 'Низкий приоритет');

  const handleAdd = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    addNewsItem(form);
    setIsOpen(false);
    setForm({ title: '', content: '', author: '', priority: 'normal', published: true });
  };

  const handleOpenEdit = (id: number) => {
    const item = news.find((n) => n.id === id);
    if (!item) return;
    setEditingId(id);
    setForm({ title: item.title, content: item.content, author: item.author, priority: item.priority, published: item.published });
    setIsOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingId || !form.title.trim() || !form.content.trim()) return;
    updateNewsItem(editingId, form);
    setEditingId(null);
    setIsOpen(false);
    setForm({ title: '', content: '', author: '', priority: 'normal', published: true });
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (open) return;
    setEditingId(null);
    setForm({ title: '', content: '', author: '', priority: 'normal', published: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl text-gray-900 mb-2">Новости и объявления</h2><p className="text-gray-600">Актуальная информация системы</p></div>{canEdit && <Button onClick={() => { setEditingId(null); setForm({ title: '', content: '', author: '', priority: 'normal', published: true }); setIsOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Добавить</Button>}</div>
      <div className="space-y-4">{visibleNews.length === 0 ? <Card><CardContent className="p-6 text-center text-gray-500">Новостей пока нет</CardContent></Card> : visibleNews.map((item) => <Card key={item.id}><CardHeader><div className="flex justify-between items-start gap-2"><div><CardTitle className="text-lg flex items-center gap-2"><Newspaper className="w-4 h-4 text-blue-600" />{item.title}</CardTitle><p className="text-xs text-gray-500 mt-1">{item.date} • {item.author || 'Система'}</p></div><div className="flex gap-2 items-center"><Badge>{priorityLabel(item.priority)}</Badge>{!item.published && canEdit && <Badge variant="secondary">Черновик</Badge>}{canEdit && <><Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item.id)}>Изм.</Button><Button variant="ghost" size="sm" onClick={() => deleteNewsItem(item.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button></>}</div></div></CardHeader><CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p></CardContent></Card>)}</div>

      <Dialog open={isOpen} onOpenChange={handleDialogChange}><DialogContent><DialogHeader><DialogTitle>{editingId ? 'Редактирование новости' : 'Новая новость'}</DialogTitle></DialogHeader><div className="space-y-3"><Label>Заголовок</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Label>Содержимое</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} /><Label>Автор</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /><Label>Категория</Label><Select value={form.priority} onValueChange={(v: 'low' | 'normal' | 'high') => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Обычная новость</SelectItem><SelectItem value="high">Важная новость</SelectItem><SelectItem value="low">Низкий приоритет</SelectItem></SelectContent></Select><div className="flex items-center justify-between rounded-md border p-3"><Label htmlFor="news-published">Опубликовано</Label><Switch id="news-published" checked={form.published} onCheckedChange={(value) => setForm({ ...form, published: value })} /></div><Button onClick={editingId ? handleSaveEdit : handleAdd} className="w-full">{editingId ? 'Сохранить изменения' : 'Опубликовать'}</Button></div></DialogContent></Dialog>
    </div>
  );
}
