import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const CLASS_REPORT_DATA: Record<string, { name: string; points: number; achievements: number }[]> = {
  '10-1': [
    { name: 'Иванов Иван Иванович', points: 267, achievements: 12 },
    { name: 'Петрова Мария Сергеевна', points: 210, achievements: 9 },
    { name: 'Кузнецова Татьяна Алексеевна', points: 185, achievements: 8 },
  ],
  '9-3': [
    { name: 'Новиков Дмитрий Александрович', points: 155, achievements: 6 },
  ],
  '11-1': [
    { name: 'Козлова Елена Викторовна', points: 230, achievements: 10 },
    { name: 'Лебедев Андрей Владимирович', points: 190, achievements: 8 },
  ],
};

const STUDENT_REPORT_DATA: Record<string, { achievement: string; category: string; points: number; status: string; date: string }[]> = {
  '1': [
    { achievement: 'Всероссийская олимпиада по математике', category: 'Учебные', points: 40, status: 'approved', date: '15.01.2026' },
    { achievement: 'Олимпиада по информатике', category: 'Учебные', points: 10, status: 'approved', date: '10.01.2026' },
    { achievement: 'Участие в волонтёрской акции', category: 'Внеурочная', points: 25, status: 'pending', date: '18.01.2026' },
  ],
  '2': [
    { achievement: 'Муниципальная олимпиада по физике', category: 'Учебные', points: 20, status: 'approved', date: '12.01.2026' },
  ],
};

export function ReportsScreen() {
  const [classValue, setClassValue] = useState('');
  const [periodClass, setPeriodClass] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [periodStudent, setPeriodStudent] = useState('');

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'class' | 'student' | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateClassReport = () => {
    if (!classValue) { toast.error('Выберите класс'); return; }
    if (!periodClass) { toast.error('Выберите период'); return; }

    const data = CLASS_REPORT_DATA[classValue] || [
      { name: 'Соловьева Ольга Дмитриевна', points: 120, achievements: 5 },
      { name: 'Волков Сергей Николаевич', points: 95, achievements: 4 },
    ];

    setReportData({ class: classValue, period: periodClass, students: data });
    setReportType('class');
    setReportDialogOpen(true);
  };

  const handleGenerateStudentReport = () => {
    if (!studentId) { toast.error('Выберите учащегося'); return; }
    if (!periodStudent) { toast.error('Выберите период'); return; }

    const students: Record<string, string> = { '1': 'Иванов Иван Иванович', '2': 'Петрова Мария Сергеевна', '3': 'Сидоров Алексей Петрович' };
    const data = STUDENT_REPORT_DATA[studentId] || [];

    setReportData({ studentName: students[studentId], period: periodStudent, achievements: data });
    setReportType('student');
    setReportDialogOpen(true);
  };

  const handleDownload = () => {
    toast.success('Отчёт скачан (demo — реальная загрузка требует backend)');
    setReportDialogOpen(false);
  };

  const periodLabel: Record<string, string> = {
    current: 'Текущий учебный год', q1: '1 четверть', q2: '2 четверть', q3: '3 четверть', q4: '4 четверть', all: 'За все время',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Отчеты</h2>
        <p className="text-gray-600">Формирование отчетов по учащимся и классам</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Отчет по классу */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-md">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Отчет по классу</CardTitle>
                <CardDescription>
                  Сводный отчет об индивидуальных достижениях учащихся класса
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-select">Выберите класс</Label>
              <Select value={classValue} onValueChange={setClassValue}>
                <SelectTrigger id="class-select" className="bg-white">
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {['9-1','9-2','9-3','10-1','10-2','10-3','11-1','11-2'].map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period-class">Период</Label>
              <Select value={periodClass} onValueChange={setPeriodClass}>
                <SelectTrigger id="period-class" className="bg-white">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Текущий учебный год</SelectItem>
                  <SelectItem value="q1">1 четверть</SelectItem>
                  <SelectItem value="q2">2 четверть</SelectItem>
                  <SelectItem value="q3">3 четверть</SelectItem>
                  <SelectItem value="q4">4 четверть</SelectItem>
                  <SelectItem value="all">За все время</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerateClassReport} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <Download className="w-4 h-4" />
              Сформировать отчет
            </Button>
          </CardContent>
        </Card>

        {/* Отчет по ученику */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-md">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Отчет по ученику</CardTitle>
                <CardDescription>
                  Индивидуальный отчет о достижениях учащегося
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-class">Класс учащегося</Label>
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger id="student-class" className="bg-white">
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {['9-1','9-2','9-3','10-1','10-2','10-3','11-1','11-2'].map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls} класс</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-name">Учащийся</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="student-name" className="bg-white">
                  <SelectValue placeholder="Выберите учащегося" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Иванов Иван Иванович</SelectItem>
                  <SelectItem value="2">Петрова Мария Сергеевна</SelectItem>
                  <SelectItem value="3">Сидоров Алексей Петрович</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period-student">Период</Label>
              <Select value={periodStudent} onValueChange={setPeriodStudent}>
                <SelectTrigger id="period-student" className="bg-white">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Текущий учебный год</SelectItem>
                  <SelectItem value="q1">1 четверть</SelectItem>
                  <SelectItem value="q2">2 четверть</SelectItem>
                  <SelectItem value="q3">3 четверть</SelectItem>
                  <SelectItem value="q4">4 четверть</SelectItem>
                  <SelectItem value="all">За все время</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerateStudentReport} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <Download className="w-4 h-4" />
              Сформировать отчет
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные форматы отчетов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { format: 'PDF документ', desc: 'Для печати и архивирования' },
              { format: 'Excel таблица', desc: 'Для анализа и обработки данных' },
              { format: 'Word документ', desc: 'Для редактирования текста' },
            ].map((item) => (
              <button
                key={item.format}
                onClick={() => toast.info(`Выбран формат: ${item.format}`)}
                className="p-4 border border-gray-200 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <p className="text-sm text-gray-900 mb-1">{item.format}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Диалог отчёта */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reportType === 'class'
                ? `Отчёт по ${reportData?.class} классу`
                : `Отчёт по ученику: ${reportData?.studentName}`}
            </DialogTitle>
            <DialogDescription>
              Период: {periodLabel[reportType === 'class' ? periodClass : periodStudent]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="w-4 h-4" />
              <span>Отчёт успешно сформирован</span>
            </div>

            {reportType === 'class' && reportData && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>№</TableHead>
                      <TableHead>Учащийся</TableHead>
                      <TableHead className="text-center">Достижений</TableHead>
                      <TableHead className="text-center">Баллов</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.students.map((s: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-center">{s.achievements}</TableCell>
                        <TableCell className="text-center font-semibold text-blue-700">{s.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {reportType === 'student' && reportData && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>№</TableHead>
                      <TableHead>Достижение</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-center">Баллы</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.achievements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">Нет данных за выбранный период</TableCell>
                      </TableRow>
                    ) : (
                      reportData.achievements.map((a: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{a.achievement}</TableCell>
                          <TableCell className="text-sm text-gray-600">{a.category}</TableCell>
                          <TableCell className="text-center font-semibold text-blue-700">{a.points}</TableCell>
                          <TableCell>
                            {a.status === 'approved'
                              ? <Badge className="bg-green-600">Одобрено</Badge>
                              : <Badge className="bg-yellow-600">На проверке</Badge>}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{a.date}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="flex-1">
                Закрыть
              </Button>
              <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2">
                <Download className="w-4 h-4" />
                Скачать отчёт
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
