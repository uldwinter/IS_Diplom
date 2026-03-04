import { useState } from 'react';
import { useSections, Section } from './SectionsContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Calendar, Users, Clock, MapPin, CheckCircle, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

export function StudentSectionsScreen() {
  const { sections, applications, getStudentSections, addApplication } = useSections();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock logged-in student
  const currentStudentId = 1;
  const currentStudentName = 'Иванов Иван';
  const currentStudentClass = '10-1';

  const mySections = getStudentSections(currentStudentId);
  const myApplications = applications.filter(app => app.studentId === currentStudentId);

  const getStatusForSection = (sectionId: string) => {
    const isMember = mySections.some(s => s.id === sectionId);
    if (isMember) return 'member';
    
    const pendingApp = myApplications.find(a => a.sectionId === sectionId && a.status === 'pending');
    if (pendingApp) return 'pending';
    
    const rejectedApp = myApplications.find(a => a.sectionId === sectionId && a.status === 'rejected');
    if (rejectedApp) return 'rejected';

    return null;
  };

  const handleApply = () => {
    if (!selectedSection) return;
    
    addApplication({
      studentId: currentStudentId,
      studentName: currentStudentName,
      studentClass: currentStudentClass,
      sectionId: selectedSection.id,
    });
    
    toast.success(`Заявка в секцию "${selectedSection.name}" отправлена`);
    setIsDialogOpen(false);
  };

  const SectionCard = ({ section }: { section: Section }) => {
    const status = getStatusForSection(section.id);
    
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <Badge variant={
              section.category === 'sport' ? 'default' : 
              section.category === 'science' ? 'secondary' : 
              section.category === 'art' ? 'destructive' : 'outline'
            } className="mb-2">
              {section.category === 'sport' ? 'Спорт' : 
               section.category === 'science' ? 'Наука' : 
               section.category === 'art' ? 'Творчество' : 'Другое'}
            </Badge>
            {status === 'member' && <Badge variant="outline" className="text-green-600 border-green-600">Участник</Badge>}
            {status === 'pending' && <Badge variant="outline" className="text-yellow-600 border-yellow-600">Заявка на рассмотрении</Badge>}
          </div>
          <CardTitle className="text-xl">{section.name}</CardTitle>
          <CardDescription className="line-clamp-2">{section.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {section.schedule}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {section.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {section.teacher}
          </div>
        </CardContent>
        <CardFooter>
          {status === 'member' ? (
            <Button variant="outline" className="w-full cursor-default hover:bg-background" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Вы записаны
            </Button>
          ) : status === 'pending' ? (
            <Button variant="outline" className="w-full cursor-default hover:bg-background" disabled>
              <Clock3 className="w-4 h-4 mr-2" />
              Ждем ответа
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => {
                setSelectedSection(section);
                setIsDialogOpen(true);
              }}
            >
              Записаться
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Секции и кружки</h2>
        <p className="text-gray-600">Выбирайте дополнительные занятия по душе</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Все секции</TabsTrigger>
          <TabsTrigger value="my">Мои секции</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(section => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {mySections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500 mb-4">Вы пока не записаны ни в одну секцию</p>
              <Button onClick={() => setActiveTab('all')}>Выбрать секцию</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySections.map(section => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Запись в секцию</DialogTitle>
            <DialogDescription>
              Вы хотите подать заявку на вступление в "{selectedSection?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm">
            <p><strong>Преподаватель:</strong> {selectedSection?.teacher}</p>
            <p><strong>Расписание:</strong> {selectedSection?.schedule}</p>
            <p><strong>Место:</strong> {selectedSection?.location}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleApply}>Подтвердить запись</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
