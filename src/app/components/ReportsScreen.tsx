import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendState } from '@/app/backend/store';

export function ReportsScreen() {
  const { users, achievements } = useBackendState();
  const [classValue, setClassValue] = useState('');
  const [periodClass, setPeriodClass] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [periodStudent, setPeriodStudent] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'class' | 'student' | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const students = users.filter((u) => u.role === 'student');
  const classes = Array.from(new Set(students.map((s) => s.class ?? '—'))).sort();
  const filteredStudents = students.filter((s) => !studentClass || s.class === studentClass);

  const parseRuDate = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return new Date(`${trimmed}T00:00:00`);
    const match = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const isInPeriod = (dateValue: string, period: string) => {
    if (period === 'all') return true;
    const date = parseRuDate(dateValue);
    if (!date || Number.isNaN(date.getTime())) return false;
    const month = date.getMonth() + 1;
    if (period === 'current') {
      const nowDate = new Date();
      const currentYear = nowDate.getFullYear();
      const currentMonth = nowDate.getMonth() + 1;
      const academicYearStart = currentMonth >= 9 ? currentYear : currentYear - 1;
      const academicYearEnd = academicYearStart + 1;
      const dateYear = date.getFullYear();
      return (dateYear === academicYearStart && month >= 9) || (dateYear === academicYearEnd && month <= 8);
    }
    if (period === 'q1') return month >= 9 && month <= 11;
    if (period === 'q2') return month === 12 || month <= 2;
    if (period === 'q3') return month >= 3 && month <= 5;
    if (period === 'q4') return month >= 6 && month <= 8;
    return true;
  };

  const handleGenerateClassReport = () => {
    if (!classValue || !periodClass) return toast.error('Заполните все поля отчета по классу');
    const classStudents = students.filter((s) => s.class === classValue);
    const data = classStudents.map((s) => {
      const approved = achievements.filter((a) => (
        a.studentUserId === s.id &&
        a.status === 'approved' &&
        isInPeriod(a.date, periodClass)
      ));
      return { name: s.name, points: approved.reduce((sum, a) => sum + a.expectedPoints, 0), achievements: approved.length };
    }).sort((a, b) => b.points - a.points);
    setReportData({ class: classValue, period: periodClass, students: data });
    setReportType('class');
    setReportDialogOpen(true);
  };

  const handleGenerateStudentReport = () => {
    if (!studentId || !periodStudent) return toast.error('Заполните все поля отчета по ученику');
    const student = students.find((s) => String(s.id) === studentId);
    if (!student) return toast.error('Ученик не найден');
    const data = achievements
      .filter((a) => a.studentUserId === student.id && isInPeriod(a.date, periodStudent))
      .map((a) => ({ achievement: a.achievementName, category: a.category, points: a.expectedPoints, status: a.status, date: a.date }));
    setReportData({ studentName: student.name, period: periodStudent, achievements: data });
    setReportType('student');
    setReportDialogOpen(true);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportType === 'class' ? `report-class-${reportData?.class}.json` : `report-student-${reportData?.studentName ?? 'student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Отчёт сформирован и скачан');
    setReportDialogOpen(false);
  };

  const statusLabel = (status: string) => status === 'approved' ? 'Одобрено' : status === 'pending' ? 'На проверке' : 'Отклонено';

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl text-gray-900 mb-2">Отчеты</h2><p className="text-gray-600">Формирование отчетов по реальным данным системы</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><div className="flex items-start gap-3"><div className="p-2 bg-blue-50 rounded-md"><FileText className="w-5 h-5 text-blue-600" /></div><div><CardTitle>Отчет по классу</CardTitle><CardDescription>Сводный отчет по баллам и достижениям</CardDescription></div></div></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Класс</Label><Select value={classValue} onValueChange={setClassValue}><SelectTrigger className="bg-white"><SelectValue placeholder="Выберите класс" /></SelectTrigger><SelectContent>{classes.map((cls) => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Период</Label><Select value={periodClass} onValueChange={setPeriodClass}><SelectTrigger className="bg-white"><SelectValue placeholder="Выберите период" /></SelectTrigger><SelectContent><SelectItem value="current">Текущий учебный год</SelectItem><SelectItem value="q1">1 четверть</SelectItem><SelectItem value="q2">2 четверть</SelectItem><SelectItem value="q3">3 четверть</SelectItem><SelectItem value="q4">4 четверть</SelectItem><SelectItem value="all">За все время</SelectItem></SelectContent></Select></div><Button onClick={handleGenerateClassReport} className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Download className="w-4 h-4" />Сформировать отчет</Button></CardContent></Card>

        <Card><CardHeader><div className="flex items-start gap-3"><div className="p-2 bg-green-50 rounded-md"><FileText className="w-5 h-5 text-green-600" /></div><div><CardTitle>Отчет по ученику</CardTitle><CardDescription>Индивидуальная детализация достижений</CardDescription></div></div></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Класс</Label><Select value={studentClass} onValueChange={(v) => { setStudentClass(v); setStudentId(''); }}><SelectTrigger className="bg-white"><SelectValue placeholder="Выберите класс" /></SelectTrigger><SelectContent>{classes.map((cls) => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Учащийся</Label><Select value={studentId} onValueChange={setStudentId}><SelectTrigger className="bg-white"><SelectValue placeholder="Выберите учащегося" /></SelectTrigger><SelectContent>{filteredStudents.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Период</Label><Select value={periodStudent} onValueChange={setPeriodStudent}><SelectTrigger className="bg-white"><SelectValue placeholder="Выберите период" /></SelectTrigger><SelectContent><SelectItem value="current">Текущий учебный год</SelectItem><SelectItem value="q1">1 четверть</SelectItem><SelectItem value="q2">2 четверть</SelectItem><SelectItem value="q3">3 четверть</SelectItem><SelectItem value="q4">4 четверть</SelectItem><SelectItem value="all">За все время</SelectItem></SelectContent></Select></div><Button onClick={handleGenerateStudentReport} className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Download className="w-4 h-4" />Сформировать отчет</Button></CardContent></Card>
      </div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}><DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{reportType === 'class' ? `Отчёт по ${reportData?.class} классу` : `Отчёт по ученику: ${reportData?.studentName}`}</DialogTitle><DialogDescription>Сформирован на основании актуальных данных backend</DialogDescription></DialogHeader><div className="space-y-4"><div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md"><CheckCircle className="w-4 h-4" /><span>Отчёт успешно сформирован</span></div>{reportType === 'class' && reportData && <Table><TableHeader><TableRow><TableHead>Ученик</TableHead><TableHead className="text-center">Баллы</TableHead><TableHead className="text-center">Достижения</TableHead></TableRow></TableHeader><TableBody>{reportData.students.map((s: any) => <TableRow key={s.name}><TableCell>{s.name}</TableCell><TableCell className="text-center">{s.points}</TableCell><TableCell className="text-center">{s.achievements}</TableCell></TableRow>)}</TableBody></Table>}{reportType === 'student' && reportData && <Table><TableHeader><TableRow><TableHead>Достижение</TableHead><TableHead>Категория</TableHead><TableHead className="text-center">Баллы</TableHead><TableHead>Статус</TableHead><TableHead>Дата</TableHead></TableRow></TableHeader><TableBody>{reportData.achievements.map((a: any, i: number) => <TableRow key={a.achievement + i}><TableCell>{a.achievement}</TableCell><TableCell>{a.category}</TableCell><TableCell className="text-center">{a.points}</TableCell><TableCell>{statusLabel(a.status)}</TableCell><TableCell>{a.date}</TableCell></TableRow>)}</TableBody></Table>}<Button onClick={handleDownload} className="w-full gap-2"><Download className="w-4 h-4" />Скачать отчет</Button></div></DialogContent></Dialog>
    </div>
  );
}
