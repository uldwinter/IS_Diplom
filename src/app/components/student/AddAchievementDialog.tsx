import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface NewAchievement {
  name: string;
  category: string;
  level: string;
  result: string;
  points: number;
  date: string;
  documents?: string[];
  description?: string;
}

interface AddAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (achievement: NewAchievement) => void;
}

const CATEGORY_POINTS: Record<string, Record<string, number>> = {
  'Учебные достижения': { 'Международный': 60, 'Всероссийский': 50, 'Региональный': 40, 'Муниципальный': 20, 'Школьный': 10 },
  'Проектная деятельность': { 'Международный': 60, 'Всероссийский': 50, 'Региональный': 40, 'Муниципальный': 20, 'Школьный': 40 },
  'Внеурочная деятельность': { 'Региональный': 30, 'Муниципальный': 25, 'Школьный': 20, '-': 25 },
};

export function AddAchievementDialog({ open, onOpenChange, onAdd }: AddAchievementDialogProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [achievementName, setAchievementName] = useState('');
  const [level, setLevel] = useState('');
  const [result, setResult] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const calculatePoints = () => {
    if (!category || !level) return 0;
    return CATEGORY_POINTS[category]?.[level] || 15;
  };

  const handleAddFile = () => {
    setFiles([...files, `Документ_${files.length + 1}.pdf`]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) { toast.error('Выберите категорию достижения'); return; }
    if (!achievementName.trim()) { toast.error('Введите наименование достижения'); return; }
    if (!date) { toast.error('Укажите дату достижения'); return; }

    const points = calculatePoints();
    const dateFormatted = new Date(date).toLocaleDateString('ru-RU');

    const newAchievement: NewAchievement = {
      name: achievementName,
      category,
      level: level || '-',
      result: result || '-',
      points,
      date: dateFormatted,
      documents: files,
      description: description || undefined,
    };

    if (onAdd) {
      onAdd(newAchievement);
    }

    toast.success('Заявка отправлена на проверку куратору!');
    resetForm();
    onOpenChange(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить достижение</DialogTitle>
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
              <Button type="button" variant="outline" size="sm" onClick={handleAddFile}>
                Выбрать файлы
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Поддерживаемые форматы: PDF, JPG, PNG (макс. 10 МБ)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{file}</span>
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Отправить на проверку
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}