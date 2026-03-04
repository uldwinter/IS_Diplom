import { useState } from 'react';
import { useSections, Section, SectionApplication } from './SectionsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Check, X, Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function CuratorSectionsScreen() {
  const { sections, applications, members, updateApplicationStatus, addSection, deleteSection, getSectionMembersCount } = useSections();
  const [activeTab, setActiveTab] = useState('applications');
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  
  // New Section Form State
  const [newSection, setNewSection] = useState<Partial<Section>>({
    name: '',
    category: 'sport',
    teacher: '',
    schedule: '',
    location: '',
    description: '',
    capacity: 20
  });

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const processedApplications = applications.filter(app => app.status !== 'pending');

  const handleCreateSection = () => {
    if (!newSection.name || !newSection.teacher) {
      toast.error('Заполните обязательные поля');
      return;
    }
    addSection(newSection as any);
    setIsAddSectionOpen(false);
    toast.success('Секция успешно создана');
    setNewSection({ name: '', category: 'sport', teacher: '', schedule: '', location: '', description: '', capacity: 20 });
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Вы уверены? Все участники будут отчислены.')) {
      deleteSection(id);
      toast.success('Секция удалена');
    }
  };

  // Analytics Data
  const categoryData = [
    { name: 'Спорт', value: sections.filter(s => s.category === 'sport').length },
    { name: 'Наука', value: sections.filter(s => s.category === 'science').length },
    { name: 'Творчество', value: sections.filter(s => s.category === 'art').length },
  ];

  const popularityData = sections.map(s => ({
    name: s.name,
    count: getSectionMembersCount(s.id)
  })).sort((a, b) => b.count - a.count);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление секциями</h2>
          <p className="text-gray-600">Заявки, списки групп и аналитика</p>
        </div>
        <Button onClick={() => setIsAddSectionOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить секцию
        </Button>
      </div>

      <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="applications">Заявки ({pendingApplications.length})</TabsTrigger>
          <TabsTrigger value="sections">Список секций</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Новые заявки</CardTitle>
              <CardDescription>Требуют вашего решения</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Класс</TableHead>
                    <TableHead>Секция</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">Нет новых заявок</TableCell>
                    </TableRow>
                  ) : (
                    pendingApplications.map(app => {
                      const section = sections.find(s => s.id === app.sectionId);
                      return (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.studentName}</TableCell>
                          <TableCell>{app.studentClass}</TableCell>
                          <TableCell>{section?.name || 'Удаленная секция'}</TableCell>
                          <TableCell>{app.date}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => {
                              updateApplicationStatus(app.id, 'approved');
                              toast.success(`Заявка ${app.studentName} принята`);
                            }}>
                              <Check className="w-4 h-4 mr-1" /> Принять
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                              updateApplicationStatus(app.id, 'rejected');
                              toast.error(`Заявка ${app.studentName} отклонена`);
                            }}>
                              <X className="w-4 h-4 mr-1" /> Отклонить
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>История заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Секция</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedApplications.slice(0, 5).map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{app.studentName}</TableCell>
                      <TableCell>{sections.find(s => s.id === app.sectionId)?.name}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'approved' ? 'default' : 'destructive'}>
                          {app.status === 'approved' ? 'Принят' : 'Отклонен'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Management Tab */}
        <TabsContent value="sections" className="mt-6">
          <div className="grid gap-4">
            {sections.map(section => (
              <Card key={section.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{section.name}</h3>
                      <Badge variant="outline">{section.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {section.teacher} • {section.schedule} • {section.location}
                    </p>
                    <p className="text-sm mt-2 text-gray-600">
                      Участников: <strong>{getSectionMembersCount(section.id)}</strong> / {section.capacity}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteSection(section.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение по направлениям</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Популярность секций</CardTitle>
                <CardDescription>Количество участников</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularityData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '10px' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Новая секция</DialogTitle>
            <DialogDescription>Заполните информацию о кружке или секции</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Название</Label>
              <Input id="name" className="col-span-3" value={newSection.name} onChange={e => setNewSection({...newSection, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teacher" className="text-right">Преподаватель</Label>
              <Input id="teacher" className="col-span-3" value={newSection.teacher} onChange={e => setNewSection({...newSection, teacher: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Категория</Label>
              <Select value={newSection.category} onValueChange={(v: any) => setNewSection({...newSection, category: v})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sport">Спорт</SelectItem>
                  <SelectItem value="science">Наука</SelectItem>
                  <SelectItem value="art">Творчество</SelectItem>
                  <SelectItem value="social">Общество</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule" className="text-right">Расписание</Label>
              <Input id="schedule" className="col-span-3" placeholder="Пн, Ср 15:00" value={newSection.schedule} onChange={e => setNewSection({...newSection, schedule: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSection}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}