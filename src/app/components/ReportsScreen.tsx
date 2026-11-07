import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendState } from '@/app/backend/store';
import { type AcademicPeriod, PERIOD_LABELS, availableAcademicYears, currentAcademicYear, inAcademicPeriod, periodLabel, studentClassForYear, classCollator, parseAchievementDate } from '@/app/lib/academic';
import { downloadText, printableHtml, printReport, tableHtml, toCsv } from '@/app/lib/export';

type GeneratedReport = { title: string; period: string; generatedAt: string; headers: string[]; rows: Array<Array<string | number>> };
const statusLabel = (status: string) => status === 'approved' ? 'Одобрено' : status === 'pending' ? 'На проверке' : 'Отклонено';

export function ReportsScreen() {
  const { users, achievements } = useBackendState();
  const [year, setYear] = useState(currentAcademicYear);
  const [period, setPeriod] = useState<AcademicPeriod>('all');
  const [classValue, setClassValue] = useState('');
  const [studentClass, setStudentClass] = useState('all');
  const [studentId, setStudentId] = useState('');
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const students = users.filter((user) => user.role === 'student');
  const years = availableAcademicYears(achievements, new Date(), students);
  const periodAchievements = achievements.filter((event) => inAcademicPeriod(event.date, year, period));
  const classes = [...new Set([
    ...students.map((student) => studentClassForYear(student, achievements, year)),
    ...periodAchievements.map((event) => event.studentClass),
  ])].filter((className) => className && className !== '—').sort(classCollator.compare);
  const studentMatchesClass = (id: number, className: string) => {
    const student = students.find((item) => item.id === id);
    return !!student && (studentClassForYear(student, achievements, year) === className || periodAchievements.some((event) => event.studentUserId === id && event.studentClass === className));
  };
  const filteredStudents = students.filter((student) => studentClass === 'all' || studentMatchesClass(student.id, studentClass));
  const changeYear = (value: string) => { setYear(value); setPeriod('all'); setClassValue(''); setStudentClass('all'); setStudentId(''); };
  const saveReport = (title: string, headers: string[], rows: GeneratedReport['rows']) => {
    setReport({ title, headers, rows, period: periodLabel(year, period), generatedAt: new Date().toLocaleString('ru-RU') });
    setReportDialogOpen(true);
  };
  const handleGenerateClassReport = () => {
    if (!classValue || !classes.includes(classValue)) return toast.error('Выберите класс');
    const approved = periodAchievements.filter((event) => event.status === 'approved' && event.studentClass === classValue);
    const ids = new Set(students.filter((student) => studentMatchesClass(student.id, classValue)).map((student) => student.id));
    approved.forEach((event) => ids.add(event.studentUserId));
    const rows = [...ids].map((id) => {
      const mine = approved.filter((event) => event.studentUserId === id);
      const name = students.find((student) => student.id === id)?.name || mine[0]?.studentName || `Ученик #${id}`;
      return { name, points: mine.reduce((total, event) => total + event.expectedPoints, 0), count: mine.length };
    }).sort((left, right) => right.points - left.points || classCollator.compare(left.name, right.name));
    saveReport(`Отчёт по классу ${classValue}`, ['Ученик', 'Подтверждённые баллы', 'Подтверждённые достижения'], rows.map((row) => [row.name, row.points, row.count]));
  };
  const handleGenerateStudentReport = () => {
    const student = filteredStudents.find((item) => String(item.id) === studentId);
    if (!student) return toast.error('Выберите ученика');
    const rows = periodAchievements.filter((event) => event.studentUserId === student.id && (studentClass === 'all' || event.studentClass === studentClass))
      .sort((left, right) => (parseAchievementDate(left.date)?.getTime() ?? 0) - (parseAchievementDate(right.date)?.getTime() ?? 0));
    saveReport(`Отчёт по ученику: ${student.name}`, ['Достижение', 'Класс на дату события', 'Категория', 'Утверждённые баллы', 'Статус', 'Дата события'], rows.map((event) => [event.achievementName, event.studentClass, event.category, event.status === 'approved' ? event.expectedPoints : 0, statusLabel(event.status), event.date]));
  };
  const exportReport = (format: 'csv' | 'html' | 'pdf') => {
    if (!report) return;
    const description = `${report.period}. По дате достижения; класс на дату события. Сформировано: ${report.generatedAt}.`;
    const html = printableHtml(report.title, description, tableHtml(report.headers, report.rows));
    const filename = `report-${new Date().toISOString().slice(0, 10)}`;
    if (format === 'csv') downloadText('\uFEFF' + toCsv([['Отчёт', report.title], ['Период', report.period], ['Сформировано', report.generatedAt], report.headers, ...report.rows]), `${filename}.csv`, 'text/csv;charset=utf-8');
    else if (format === 'html') downloadText(html, `${filename}.html`, 'text/html;charset=utf-8');
    else if (!printReport(html)) return toast.error('Разрешите открытие окна печати');
    toast.success(format === 'pdf' ? 'Открыта печатная версия. Выберите «Сохранить как PDF».' : 'Отчёт сохранён');
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl text-gray-900 mb-2">Отчеты</h2><p className="text-gray-600">По дате достижения и классу на дату события. Баллы учитываются только после подтверждения.</p></div>
      <Card><CardContent className="p-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="reports-year">Учебный год</Label><Select value={year} onValueChange={changeYear}><SelectTrigger id="reports-year"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">За все годы</SelectItem>{years.map((value) => <SelectItem key={value} value={value}>{value.replace('-', '/')}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="reports-period">Период</Label><Select value={period} onValueChange={(value) => setPeriod(value as AcademicPeriod)} disabled={year === 'all'}><SelectTrigger id="reports-period"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PERIOD_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{year === 'all' && value === 'all' ? 'За все годы' : label}</SelectItem>)}</SelectContent></Select></div>
        <p className="text-xs text-gray-500 sm:col-span-2">Учебный год: 1 сентября — 31 августа. Календарные границы четвертей указаны в списке периодов.</p>
      </CardContent></Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><FileText className="w-5 h-5 text-blue-600" /><CardTitle>Отчет по классу</CardTitle><CardDescription>Подтверждённые достижения выбранного класса за период</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="report-class">Класс</Label><Select value={classValue} onValueChange={setClassValue}><SelectTrigger id="report-class"><SelectValue placeholder="Выберите класс" /></SelectTrigger><SelectContent>{classes.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
          <Button onClick={handleGenerateClassReport} className="w-full gap-2"><Download className="w-4 h-4" />Сформировать отчет</Button>
        </CardContent></Card>
        <Card><CardHeader><FileText className="w-5 h-5 text-green-600" /><CardTitle>Отчет по ученику</CardTitle><CardDescription>Статусы и подтверждённые баллы каждого достижения</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="report-student-class">Класс</Label><Select value={studentClass} onValueChange={(value) => { setStudentClass(value); setStudentId(''); }}><SelectTrigger id="report-student-class"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все классы</SelectItem>{classes.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="report-student">Учащийся</Label><Select value={studentId} onValueChange={setStudentId}><SelectTrigger id="report-student"><SelectValue placeholder="Выберите учащегося" /></SelectTrigger><SelectContent>{filteredStudents.map((student) => <SelectItem key={student.id} value={String(student.id)}>{student.name}</SelectItem>)}</SelectContent></Select></div>
          <Button onClick={handleGenerateStudentReport} className="w-full gap-2"><Download className="w-4 h-4" />Сформировать отчет</Button>
        </CardContent></Card>
      </div>
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}><DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{report?.title}</DialogTitle><DialogDescription>{report?.period} · По дате достижения, класс на дату события · {report?.generatedAt}</DialogDescription></DialogHeader>
        {report && <><Table><TableHeader><TableRow>{report.headers.map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader><TableBody>{report.rows.length ? report.rows.map((row, index) => <TableRow key={index}>{row.map((cell, column) => <TableCell key={column}>{cell}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={report.headers.length}>За этот период данных нет.</TableCell></TableRow>}</TableBody></Table><div className="flex flex-wrap gap-2"><Button onClick={() => exportReport('csv')}>CSV</Button><Button variant="outline" onClick={() => exportReport('html')}>HTML</Button><Button variant="outline" onClick={() => exportReport('pdf')}>Печать / PDF</Button></div></>}
      </DialogContent></Dialog>
    </div>
  );
}
