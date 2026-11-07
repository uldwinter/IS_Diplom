export type AcademicPeriod = 'all' | 'q1' | 'q2' | 'q3' | 'q4';
export type QuarterBoundary = { start: [number, number]; end: [number, number] };
// Default calendar boundaries; schools can supply their approved calendar to periodBounds.
export const DEFAULT_QUARTERS: Record<Exclude<AcademicPeriod, 'all'>, QuarterBoundary> = {
  q1: { start: [9, 1], end: [10, 31] },
  q2: { start: [11, 1], end: [12, 31] },
  q3: { start: [1, 1], end: [3, 31] },
  q4: { start: [4, 1], end: [5, 31] },
};
export const PERIOD_LABELS: Record<AcademicPeriod, string> = {
  all: 'Весь учебный год', q1: '1 четверть (сентябрь–октябрь)',
  q2: '2 четверть (ноябрь–декабрь)', q3: '3 четверть (январь–март)', q4: '4 четверть (апрель–май)',
};
export const classCollator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

export function parseAchievementDate(value?: string): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const ru = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!iso && !ru) return null;
  const year = Number(iso ? iso[1] : ru![3]);
  const month = Number(iso ? iso[2] : ru![2]);
  const day = Number(iso ? iso[3] : ru![1]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function academicYearForDate(date: Date): string {
  const start = date.getFullYear() - (date.getMonth() < 8 ? 1 : 0);
  return `${start}-${start + 1}`;
}
export function currentAcademicYear(today = new Date()): string { return academicYearForDate(today); }
export function normalizeAcademicYear(year: string): string | null {
  const match = /^(\d{4})(?:[-/](\d{4}))?$/.exec(year);
  if (!match) return null;
  const start = Number(match[1]);
  if (start < 1900 || start > 2200 || (match[2] && Number(match[2]) !== start + 1)) return null;
  return `${start}-${start + 1}`;
}

type ClassMembership = { class: string; academicYear: string; graduated?: boolean };

export function availableAcademicYears(
  achievements: Array<{ date: string }>,
  today = new Date(),
  students: Array<{ classHistory?: ClassMembership[] }> = [],
): string[] {
  const years = new Set([currentAcademicYear(today)]);
  achievements.forEach(({ date }) => { const parsed = parseAchievementDate(date); if (parsed) years.add(academicYearForDate(parsed)); });
  for (const student of students) {
    for (const membership of student.classHistory ?? []) {
      const year = normalizeAcademicYear(membership.academicYear);
      if (year && !membership.graduated) years.add(year);
    }
  }
  return [...years].sort().reverse();
}

export function periodBounds(year: string, period: AcademicPeriod = 'all', quarters = DEFAULT_QUARTERS): { start: Date; end: Date } | null {
  const normalized = normalizeAcademicYear(year);
  if (!normalized) return null;
  const startYear = Number(normalized.slice(0, 4));
  if (period === 'all') return { start: new Date(startYear, 8, 1), end: new Date(startYear + 1, 7, 31, 23, 59, 59, 999) };
  const boundary = quarters[period];
  const make = ([month, day]: [number, number], end: boolean) => new Date(startYear + (month < 9 ? 1 : 0), month - 1, day, end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
  return { start: make(boundary.start, false), end: make(boundary.end, true) };
}

export function inAcademicPeriod(value: string, year: string, period: AcademicPeriod = 'all'): boolean {
  const date = parseAchievementDate(value);
  if (!date) return false;
  if (year === 'all') return period === 'all';
  const bounds = periodBounds(year, period);
  return !!bounds && date >= bounds.start && date <= bounds.end;
}

export function periodLabel(year: string, period: AcademicPeriod): string {
  return year === 'all' ? 'За все годы' : `${year.replace('-', '/')} учебный год · ${PERIOD_LABELS[period]}`;
}
export function toMonthKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; }
export function monthBuckets(year: string, dates: string[], period: AcademicPeriod = 'all'): Array<{ key: string; label: string }> {
  let keys: string[];
  if (year === 'all') {
    keys = [...new Set(dates.map(parseAchievementDate).filter((date): date is Date => !!date).map(toMonthKey))].sort();
  } else {
    const bounds = periodBounds(year, period);
    if (!bounds) return [];
    keys = [];
    const month = new Date(bounds.start.getFullYear(), bounds.start.getMonth(), 1);
    while (month <= bounds.end) {
      keys.push(toMonthKey(month));
      month.setMonth(month.getMonth() + 1);
    }
  }
  return keys.map((key) => ({ key, label: new Date(`${key}-01T00:00:00`).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }) }));
}

type Student = { id: number; name: string; class?: string; classHistory?: ClassMembership[] };
type StudentAchievement = { studentUserId: number; studentClass: string; date: string; status: string; expectedPoints: number; category: string };
export function studentClassForYear(student: Student, achievements: StudentAchievement[], year: string): string {
  if (year === 'all') return student.class || '—';
  const normalizedYear = normalizeAcademicYear(year);
  if (!normalizedYear) return '—';
  const historical = student.classHistory?.filter((entry) => normalizeAcademicYear(entry.academicYear) === normalizedYear).at(-1);
  if (historical) return historical.graduated ? '—' : historical.class;
  const events = achievements.filter((event) => event.studentUserId === student.id && inAcademicPeriod(event.date, year))
    .sort((left, right) => (parseAchievementDate(right.date)?.getTime() ?? 0) - (parseAchievementDate(left.date)?.getTime() ?? 0));
  return events[0]?.studentClass || (year === currentAcademicYear() ? student.class || '—' : '—');
}

export function rankStudents(students: Student[], achievements: StudentAchievement[], year: string, period: AcademicPeriod, grade = 'all', selectedClass = 'all') {
  const approved = achievements.filter((event) => event.status === 'approved' && inAcademicPeriod(event.date, year, period));
  const inScope = (className: string) => (grade === 'all' || className.split('-')[0] === grade) && (selectedClass === 'all' || className === selectedClass);
  const rows = students.map((student) => {
    const className = studentClassForYear(student, achievements, year);
    const allMine = approved.filter((event) => event.studentUserId === student.id);
    const mine = allMine.filter((event) => inScope(event.studentClass));
    const membershipMatches = (className !== '—' && inScope(className)) || mine.length > 0 || (year === 'all' && student.classHistory?.some((entry) => inScope(entry.class)));
    const sum = (category: string) => mine.filter((event) => event.category === category).reduce((total, event) => total + event.expectedPoints, 0);
    return { id: student.id, name: student.name, class: selectedClass !== 'all' ? selectedClass : inScope(className) ? className : mine[0]?.studentClass || className, academicPoints: sum('Учебные достижения'), extracurricularPoints: sum('Внеурочная деятельность'), projectPoints: sum('Проектная деятельность'), totalPoints: mine.reduce((total, event) => total + event.expectedPoints, 0), membershipMatches };
  }).filter((student) => student.membershipMatches)
    .sort((left, right) => right.totalPoints - left.totalPoints || classCollator.compare(left.name, right.name) || left.id - right.id);
  let previousPoints: number | undefined;
  let rank = 0;
  return rows.map((student, index) => {
    if (previousPoints !== student.totalPoints) rank = index + 1;
    previousPoints = student.totalPoints;
    return { ...student, rank };
  });
}
