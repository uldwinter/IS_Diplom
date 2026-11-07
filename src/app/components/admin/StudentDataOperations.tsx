import { parseStudentCsv } from './studentCsv';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { bulkImportStudents, promoteStudents, useBackendState } from '@/app/backend/store';
import { useMutation } from '@/app/components/useMutation';
import { toast } from 'sonner';

export function StudentDataOperations() {
  const { classCatalog, users } = useBackendState();
  const { pending, execute } = useMutation();
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const now = new Date();
  const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const [academicYear, setAcademicYear] = useState(`${start + 1}-${start + 2}`);
  const classes = Array.from(new Set(users.filter(user => user.role === 'student' && user.status === 'active').map(user => user.class).filter(Boolean))).sort();

  const selectCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    setRows([]);
    if (!file) return;
    if (file.size > 1024 * 1024) return toast.error('CSV должен быть не больше 1 МБ');
    try { setRows(parseStudentCsv(await file.text())); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось прочитать CSV'); }
  };

  const importStudents = async () => {
    const result = await execute(() => bulkImportStudents(rows));
    if (!result?.ok) return;
    toast.success(`Добавлено учеников: ${rows.length}`);
    setRows([]);
  };

  const promote = async () => {
    const changes = Object.fromEntries(Object.entries(mapping).filter(([source, target]) => source !== target));
    if (!Object.keys(changes).length) return toast.error('Выберите классы для перевода');
    if (!/^\d{4}-\d{4}$/.test(academicYear) || Number(academicYear.slice(5)) !== Number(academicYear.slice(0, 4)) + 1) return toast.error('Укажите учебный год, например 2027-2028');
    const summary = Object.entries(changes).map(([source, target]) => `${source} → ${target || 'архив выпускников'}`).join('\n');
    if (!window.confirm(`Подтвердите перевод на ${academicYear}:\n${summary}\nИстория классов и достижения сохранятся.`)) return;
    const result = await execute(() => promoteStudents(changes, academicYear));
    if (!result?.ok) return;
    setMapping({});
    toast.success('Перевод выполнен, история классов сохранена');
  };

  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card><CardHeader><CardTitle>Импорт учеников</CardTitle></CardHeader><CardContent className="space-y-3">
      <p className="text-sm text-gray-600">CSV UTF-8 с заголовками name;email;login;password;class. Все строки проверяются перед записью; при ошибке импорт отменяется целиком.</p>
      <Input aria-label="CSV учеников" type="file" accept=".csv,text/csv" onChange={selectCsv} disabled={pending} />
      {rows.length > 0 && <><p>Готово к импорту: {rows.length}</p><ul className="text-sm">{rows.slice(0, 10).map((row, index) => <li key={index}>{row.name} — {row.class} — {row.login}</li>)}</ul><Button disabled={pending} onClick={importStudents}>Импортировать {rows.length} учеников</Button><Button variant="outline" disabled={pending} onClick={() => setRows([])}>Отменить</Button></>}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Перевод классов и архив выпускников</CardTitle></CardHeader><CardContent className="space-y-3">
      <Label htmlFor="promotion-year">Новый учебный год</Label><Input id="promotion-year" value={academicYear} onChange={event => setAcademicYear(event.target.value)} placeholder="2027-2028" />
      {classes.map(className => <div className="flex gap-3 items-center" key={className}><span className="w-20">{className}</span><select aria-label={`Перевод ${className}`} className="border rounded px-2 py-2" value={mapping[className] ?? className} onChange={event => setMapping(previous => ({ ...previous, [className]: event.target.value }))}><option value={className}>Без перевода</option>{classCatalog.filter(target => target !== className).map(target => <option key={target} value={target}>{target}</option>)}<option value="">Архив выпускников</option></select></div>)}
      <Button disabled={pending || classes.length === 0} onClick={promote}>Подтвердить перевод</Button>
    </CardContent></Card>
  </div>;
}
