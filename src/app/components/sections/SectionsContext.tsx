import React, { createContext, useContext } from 'react';
import {
  addSection as addSectionInStore,
  addSectionApplication,
  deleteSection as deleteSectionInStore,
  getSectionMembersCount as getSectionMembersCountFromStore,
  getStudentSections as getStudentSectionsFromStore,
  updateSectionApplicationStatus,
  useBackendState,
} from '@/app/backend/store';

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

interface SectionsContextType {
  sections: Section[];
  applications: SectionApplication[];
  members: SectionMember[];
  addApplication: (app: Omit<SectionApplication, 'id' | 'status' | 'date'>) => { ok: boolean; message?: string };
  updateApplicationStatus: (appId: string, status: 'approved' | 'rejected') => { ok: boolean; message?: string };
  addSection: (section: Omit<Section, 'id'>) => void;
  deleteSection: (id: string) => void;
  getStudentSections: (studentId: number) => Section[];
  getSectionMembersCount: (sectionId: string) => number;
}

const SectionsContext = createContext<SectionsContextType | undefined>(undefined);

export function SectionsProvider({ children }: { children: React.ReactNode }) {
  const { sections, sectionApplications, sectionMembers } = useBackendState();

  const value: SectionsContextType = {
    sections,
    applications: sectionApplications,
    members: sectionMembers,
    addApplication: addSectionApplication,
    updateApplicationStatus: updateSectionApplicationStatus,
    addSection: addSectionInStore,
    deleteSection: deleteSectionInStore,
    getStudentSections: getStudentSectionsFromStore,
    getSectionMembersCount: getSectionMembersCountFromStore,
  };

  return <SectionsContext.Provider value={value}>{children}</SectionsContext.Provider>;
}

export function useSections() {
  const context = useContext(SectionsContext);
  if (context === undefined) {
    throw new Error('useSections must be used within a SectionsProvider');
  }
  return context;
}
