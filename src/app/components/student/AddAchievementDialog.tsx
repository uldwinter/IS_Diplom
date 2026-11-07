import { useEffect, useState } from 'react';
import { useMutation } from '@/app/components/useMutation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { AchievementRecord, uploadDocument, useBackendState } from '@/app/backend/store';

export interface NewAchievement {
  name: string;
  category: string;
  level: string;
  result: string;
  points: number;
  date: string;
  description?: string;
  documents?: string[];
}

interface AddAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (achievement: NewAchievement) => Promise<{ ok: boolean; message?: string }>;
  initialAchievement?: AchievementRecord | null;
}

export function AddAchievementDialog({ open, onOpenChange, onAdd, initialAchievement }: AddAchievementDialogProps) {
  const { pending, execute } = useMutation();
  const [uploading, setUploading] = useState(false);
  const { scoringRules } = useBackendState();
  const [files, setFiles] = useState<Array<{ name: string; payload: string }>>([]);
  const [category, setCategory] = useState('');
  const [achievementName, setAchievementName] = useState('');
  const [level, setLevel] = useState('');
  const [result, setResult] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const calculatePoints = () => {
    if (!category || !level) return 0;
    return scoringRules[category]?.[level] ?? 0;
  };

  const handleAddFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selected = Array.from(input.files ?? []);
    if (selected.length === 0) return;
    if (files.length + selected.length > 10) { toast.error('Можно приложить не более 10 документов'); input.value = ''; return; }
    if (selected.some(file => !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || !file.size || file.size > 4 * 1024 * 1024)) {
      toast.error('Допустимы PDF, JPG и PNG размером до 4 МБ каждый'); input.value = ''; return;
    }
    setUploading(true);
    try {
      for (const file of selected) {
        const uploaded = await uploadDocument(file);
        if (!uploaded.ok || !uploaded.document) throw new Error(uploaded.message || 'Не удалось загрузить документ');
        setFiles(prev => [...prev, { name: file.name, payload: uploaded.document! }]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки документа');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCategory('');
    setAchievementName('');
    setLevel('');
    setResult('');
    setDate('');
    setDescription('');
    setFiles([]);
  };

  useEffect(() => {
    if (!open) return;
    if (!initialAchievement) { resetForm(); return; }
    setCategory(initialAchievement.category);
    setAchievementName(initialAchievement.achievementName);
    setLevel(initialAchievement.level);
    setResult(initialAchievement.result);
    const raw = initialAchievement.date;
    setDate(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : raw.split('.').reverse().join('-'));
    setDescription(initialAchievement.description || '');
    setFiles(initialAchievement.documents.filter(doc => doc.startsWith('document::')).map(doc => ({
      name: (() => { try { return decodeURIComponent(doc.split('::')[2] || 'Документ'); } catch { return 'Документ'; } })(), payload: doc,
    })));
  }, [open, initialAchievement?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading || pending) return;
    if (!category) return toast.error('Выберите категорию достижения');
    if (!achievementName.trim()) return toast.error('Введите наименование достижения');
    if (!date || date > new Date().toISOString().slice(0, 10)) return toast.error('Укажите прошедшую дату достижения');
    if (!level || calculatePoints() <= 0) return toast.error('Выберите уровень с утверждённым правилом начисления');
    if (!result.trim()) return toast.error('Укажите результат участия');
    if (!files.length) return toast.error('Прикрепите подтверждающий документ');
    const response = await execute(() => onAdd({
      name: achievementName.trim(), category, level, result: result.trim(),
      points: calculatePoints(), date, description: description.trim() || undefined,
      documents: files.map(file => file.payload),
    }));
    if (!response?.ok) return;
    toast.success('Заявка отправлена на проверку куратору');
    resetForm();
    onOpenChange(false);
  };

  const handleClose = () => {
    if (pending || uploading) return;
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialAchievement ? 'Исправить достижение' : 'Добавить достижение'}</DialogTitle>
          <DialogDescription>
            Заполните информацию о достижении и прикрепите подтверждающие документы
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Категория достижения *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="bg-white">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Учебные достижения">Учебные достижения</SelectItem>
                <SelectItem value="Внеурочная деятельность">Внеурочная деятельность</SelectItem>
                <SelectItem value="Проектная деятельность">Проектная деятельность</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievement-name">Наименование достижения *</Label>
            <Input
              id="achievement-name"
              type="text"
              placeholder="Например: Всероссийская олимпиада по математике"
              value={achievementName}
              onChange={(e) => setAchievementName(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Уровень</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level" className="bg-white">
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Международный">Международный</SelectItem>
                  <SelectItem value="Всероссийский">Всероссийский</SelectItem>
                  <SelectItem value="Региональный">Региональный</SelectItem>
                  <SelectItem value="Муниципальный">Муниципальный</SelectItem>
                  <SelectItem value="Школьный">Школьный</SelectItem>
                  <SelectItem value="-">Не применимо</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Результат</Label>
              <Input
                id="result"
                type="text"
                placeholder="Например: Призёр, 1 место"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Дата достижения *</Label>
            <Input
              id="date"
              max={new Date().toISOString().slice(0, 10)}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white"
            />
          </div>

          {(category || level) && (
            <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              Ориентировочное количество баллов за данное достижение: <span className="font-semibold">{calculatePoints()} баллов</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Дополнительная информация о достижении"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Прикрепить документы</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Загрузите грамоты, сертификаты, дипломы
              </p>
              <Input type="file" accept="application/pdf,image/jpeg,image/png" multiple disabled={uploading || pending} onChange={handleAddFile} />
              {uploading && <p role="status">Документы загружаются…</p>}
              <p className="text-xs text-gray-500 mt-2">
                Поддерживаемые форматы: PDF, JPG, PNG (макс. 4 МБ)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button disabled={pending || uploading} type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button disabled={pending || uploading} type="submit" className="bg-green-600 hover:bg-green-700">
              Отправить на проверку
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
