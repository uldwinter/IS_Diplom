/**
 * SectionsContext — thin compatibility shim.
 * All logic now lives in AppContext (/src/app/lib/AppContext.tsx).
 * This file re-exports the Section and SectionApplication types
 * and the useSections() hook so existing components don't need renaming.
 */

export type { Section, SectionApplication, SectionMember } from '@/app/lib/types';
export { AppProvider as SectionsProvider } from '@/app/lib/AppContext';

import { useApp } from '@/app/lib/AppContext';

export function useSections() {
  const {
    sections,
    sectionApplications,
    sectionMembers,
    addSection,
    updateSection,
    deleteSection,
    applyToSection,
    updateSectionAppStatus,
    getStudentSections,
    getSectionMembersCount,
    isStudentMember,
    hasApplied,
  } = useApp();

  // Compat alias used by the old API
  const addApplication = (appData: { studentId: number; studentName: string; studentClass: string; sectionId: string }) => {
    applyToSection(appData.studentId, appData.studentName, appData.studentClass, appData.sectionId);
  };

  const updateApplicationStatus = (appId: string, status: 'approved' | 'rejected') => {
    updateSectionAppStatus(appId, status);
  };

  return {
    sections,
    applications: sectionApplications,
    members: sectionMembers,
    addApplication,
    updateApplicationStatus,
    addSection,
    updateSection,
    deleteSection,
    getStudentSections,
    getSectionMembersCount,
    isStudentMember,
    hasApplied,
  };
}
