import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Section {
  id: string;
  name: string;
  category: 'sport' | 'science' | 'art' | 'social';
  description: string;
  schedule: string;
  location: string;
  teacher: string;
  capacity: number;
}

export interface SectionApplication {
  id: string;
  studentId: number;
  studentName: string;
  studentClass: string;
  sectionId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface SectionMember {
  sectionId: string;
  studentId: number;
}

// Mock Data
const MOCK_SECTIONS: Section[] = [
  {
    id: '1',
    name: 'Шахматный клуб "Гамбит"',
    category: 'sport',
    description: 'Обучение игре в шахматы, участие в турнирах, развитие стратегического мышления.',
    schedule: 'Пн, Ср 15:00-16:30',
    location: 'Каб. 305',
    teacher: 'Карпов А.Е.',
    capacity: 20,
  },
  {
    id: '2',
    name: 'Робототехника',
    category: 'science',
    description: 'Конструирование и программирование роботов на базе LEGO Mindstorms и Arduino.',
    schedule: 'Вт, Чт 16:00-17:30',
    location: 'Лаборатория 2',
    teacher: 'Техников С.П.',
    capacity: 15,
  },
  {
    id: '3',
    name: 'Легкая атлетика',
    category: 'sport',
    description: 'Бег, прыжки, общая физическая подготовка. Подготовка к городским соревнованиям.',
    schedule: 'Пн, Пт 14:30-16:00',
    location: 'Спортзал 1',
    teacher: 'Быстроногов В.В.',
    capacity: 30,
  },
  {
    id: '4',
    name: 'Изостудия "Палитра"',
    category: 'art',
    description: 'Живопись, графика, композиция. Работа с различными материалами.',
    schedule: 'Ср, Пт 15:30-17:00',
    location: 'Каб. 201',
    teacher: 'Краскина Е.И.',
    capacity: 12,
  },
  {
    id: '5',
    name: 'Школьный театр',
    category: 'art',
    description: 'Актерское мастерство, сценическая речь, постановка спектаклей.',
    schedule: 'Вт, Чт 17:00-19:00',
    location: 'Актовый зал',
    teacher: 'Сценова М.А.',
    capacity: 25,
  },
];

const MOCK_APPLICATIONS: SectionApplication[] = [
  {
    id: 'app-1',
    studentId: 2,
    studentName: 'Петрова Мария',
    studentClass: '10-1',
    sectionId: '4',
    status: 'pending',
    date: '2023-10-15',
  },
  {
    id: 'app-2',
    studentId: 3,
    studentName: 'Сидоров Алексей',
    studentClass: '10-2',
    sectionId: '2',
    status: 'approved',
    date: '2023-09-20',
  },
];

const MOCK_MEMBERS: SectionMember[] = [
  { sectionId: '2', studentId: 3 }, // Sidorov is in Robotics
  { sectionId: '1', studentId: 5 }, // Novikov in Chess
];

interface SectionsContextType {
  sections: Section[];
  applications: SectionApplication[];
  members: SectionMember[];
  addApplication: (app: Omit<SectionApplication, 'id' | 'status' | 'date'>) => void;
  updateApplicationStatus: (appId: string, status: 'approved' | 'rejected') => void;
  addSection: (section: Omit<Section, 'id'>) => void;
  deleteSection: (id: string) => void;
  getStudentSections: (studentId: number) => Section[];
  getSectionMembersCount: (sectionId: string) => number;
}

const SectionsContext = createContext<SectionsContextType | undefined>(undefined);

export function SectionsProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
  const [applications, setApplications] = useState<SectionApplication[]>(MOCK_APPLICATIONS);
  const [members, setMembers] = useState<SectionMember[]>(MOCK_MEMBERS);

  const addApplication = (appData: Omit<SectionApplication, 'id' | 'status' | 'date'>) => {
    const newApp: SectionApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    setApplications([...applications, newApp]);
  };

  const updateApplicationStatus = (appId: string, status: 'approved' | 'rejected') => {
    setApplications(apps =>
      apps.map(app => (app.id === appId ? { ...app, status } : app))
    );

    if (status === 'approved') {
      const app = applications.find(a => a.id === appId);
      if (app) {
        // Add to members if not already there
        const isMember = members.some(m => m.sectionId === app.sectionId && m.studentId === app.studentId);
        if (!isMember) {
          setMembers([...members, { sectionId: app.sectionId, studentId: app.studentId }]);
        }
      }
    }
  };

  const addSection = (sectionData: Omit<Section, 'id'>) => {
    const newSection: Section = {
      ...sectionData,
      id: `sect-${Date.now()}`,
    };
    setSections([...sections, newSection]);
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const getStudentSections = (studentId: number) => {
    const memberOf = members.filter(m => m.studentId === studentId).map(m => m.sectionId);
    return sections.filter(s => memberOf.includes(s.id));
  };

  const getSectionMembersCount = (sectionId: string) => {
    return members.filter(m => m.sectionId === sectionId).length;
  };

  return (
    <SectionsContext.Provider
      value={{
        sections,
        applications,
        members,
        addApplication,
        updateApplicationStatus,
        addSection,
        deleteSection,
        getStudentSections,
        getSectionMembersCount,
      }}
    >
      {children}
    </SectionsContext.Provider>
  );
}

export function useSections() {
  const context = useContext(SectionsContext);
  if (context === undefined) {
    throw new Error('useSections must be used within a SectionsProvider');
  }
  return context;
}
