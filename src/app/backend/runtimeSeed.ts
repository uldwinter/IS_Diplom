import { __getStateForTests } from './store';

const STORAGE_KEY = 'gifted-children-backend-v2';
const CURATOR_PASSWORD = String.fromCharCode(99, 117, 114, 97, 116, 111, 114, 49, 50, 51);
const STUDENT_PASSWORD = String.fromCharCode(115, 116, 117, 100, 101, 110, 116, 49, 50, 51);

type PersistedState = ReturnType<typeof __getStateForTests>;
type PersistedUser = PersistedState['users'][number];
type PersistedAchievement = PersistedState['achievements'][number];

type SeedUser = Omit<PersistedUser, 'id' | 'lastLogin'> & { lastLogin?: string };

type AchievementTemplate = {
  achievementName: string;
  category: PersistedAchievement['category'];
  level: PersistedAchievement['level'];
  result: PersistedAchievement['result'];
  expectedPoints: PersistedAchievement['expectedPoints'];
  document: string;
};

const curatorUsers: SeedUser[] = [
  { login: 'curator01', password: CURATOR_PASSWORD, name: 'Кузнецова Марина Олеговна', email: 'kuznetsova.curator@school.edu', role: 'curator', status: 'active' },
  { login: 'curator02', password: CURATOR_PASSWORD, name: 'Соколов Дмитрий Артемович', email: 'sokolov.curator@school.edu', role: 'curator', status: 'active' },
  { login: 'curator03', password: CURATOR_PASSWORD, name: 'Васильева Ирина Сергеевна', email: 'vasileva.curator@school.edu', role: 'curator', status: 'active' },
];

const studentProfiles = [
  ['student01', 'Алексеев Кирилл Романович', 'alekseev.kirill@school.edu', '8-1'],
  ['student02', 'Морозова Анна Игоревна', 'morozova.anna@school.edu', '8-1'],
  ['student03', 'Федоров Максим Денисович', 'fedorov.maxim@school.edu', '8-2'],
  ['student04', 'Никитина София Павловна', 'nikitina.sofia@school.edu', '8-2'],
  ['student05', 'Волков Артем Евгеньевич', 'volkov.artem@school.edu', '9-1'],
  ['student06', 'Семенова Дарья Олеговна', 'semenova.daria@school.edu', '9-1'],
  ['student07', 'Павлов Егор Михайлович', 'pavlov.egor@school.edu', '9-2'],
  ['student08', 'Козлова Мария Андреевна', 'kozlova.maria@school.edu', '9-2'],
  ['student09', 'Орлов Никита Сергеевич', 'orlov.nikita@school.edu', '10-1'],
  ['student10', 'Беляева Полина Викторовна', 'belyaeva.polina@school.edu', '10-1'],
  ['student11', 'Громов Илья Алексеевич', 'gromov.ilya@school.edu', '10-2'],
  ['student12', 'Тихонова Екатерина Романовна', 'tikhonova.ekaterina@school.edu', '10-2'],
  ['student13', 'Захаров Матвей Кириллович', 'zakharov.matvey@school.edu', '11-1'],
  ['student14', 'Комарова Алиса Сергеевна', 'komarova.alisa@school.edu', '11-1'],
  ['student15', 'Давыдов Тимофей Андреевич', 'davydov.timofey@school.edu', '11-2'],
  ['student16', 'Ершова Вероника Ильинична', 'ershova.veronika@school.edu', '11-2'],
  ['student17', 'Попов Владислав Николаевич', 'popov.vladislav@school.edu', '7-3'],
  ['student18', 'Жукова Валерия Дмитриевна', 'zhukova.valeria@school.edu', '7-3'],
  ['student19', 'Крылов Степан Олегович', 'krylov.stepan@school.edu', '8-3'],
  ['student20', 'Лебедева Ульяна Павловна', 'lebedeva.ulyana@school.edu', '8-3'],
  ['student21', 'Виноградов Ярослав Игоревич', 'vinogradov.yaroslav@school.edu', '9-3'],
  ['student22', 'Киселева Милана Артемовна', 'kiseleva.milana@school.edu', '9-3'],
  ['student23', 'Тарасов Роман Евгеньевич', 'tarasov.roman@school.edu', '10-3'],
  ['student24', 'Щербакова Алина Маратовна', 'shcherbakova.alina@school.edu', '10-3'],
] as const;

const studentUsers: SeedUser[] = studentProfiles.map(([login, name, email, className]) => ({
  login,
  password: STUDENT_PASSWORD,
  name,
  email,
  role: 'student',
  class: className,
  status: 'active',
}));

const achievementTemplates: AchievementTemplate[] = [
  { achievementName: 'Победитель школьной олимпиады по математике', category: 'Учебные достижения', level: 'Школьный', result: '1 место', expectedPoints: 10, document: 'Грамота.pdf' },
  { achievementName: 'Призер муниципальной олимпиады по информатике', category: 'Учебные достижения', level: 'Муниципальный', result: '2 место', expectedPoints: 20, document: 'Диплом.pdf' },
  { achievementName: 'Лауреат региональной научной конференции', category: 'Учебные достижения', level: 'Региональный', result: 'Лауреат', expectedPoints: 40, document: 'Сертификат.pdf' },
  { achievementName: 'Финалист всероссийского конкурса проектов', category: 'Проектная деятельность', level: 'Всероссийский', result: 'Финалист', expectedPoints: 50, document: 'Проект.pdf' },
  { achievementName: 'Победитель школьного конкурса исследовательских работ', category: 'Проектная деятельность', level: 'Школьный', result: '1 место', expectedPoints: 40, document: 'Исследование.pdf' },
  { achievementName: 'Призер регионального хакатона', category: 'Проектная деятельность', level: 'Региональный', result: '2 место', expectedPoints: 40, document: 'Хакатон.pdf' },
  { achievementName: 'Активный участник волонтерского движения', category: 'Внеурочная деятельность', level: '-', result: '32 часа', expectedPoints: 25, document: 'Волонтерство.pdf' },
  { achievementName: 'Победитель школьного дебатного турнира', category: 'Внеурочная деятельность', level: 'Школьный', result: '1 место', expectedPoints: 20, document: 'Дебаты.pdf' },
  { achievementName: 'Призер муниципального шахматного турнира', category: 'Внеурочная деятельность', level: 'Муниципальный', result: '3 место', expectedPoints: 25, document: 'Шахматы.pdf' },
  { achievementName: 'Участник регионального форума лидеров', category: 'Внеурочная деятельность', level: 'Региональный', result: 'Сертификат', expectedPoints: 30, document: 'Форум.pdf' },
];

const analyticsMonths = [
  { year: 2025, month: 9 },
  { year: 2025, month: 10 },
  { year: 2025, month: 11 },
  { year: 2025, month: 12 },
  { year: 2026, month: 1 },
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
  { year: 2026, month: 4 },
  { year: 2026, month: 5 },
  { year: 2026, month: 6 },
] as const;

const statusSequence: PersistedAchievement['status'][] = [
  'approved',
  'approved',
  'pending',
  'approved',
  'approved',
  'rejected',
  'approved',
  'pending',
  'approved',
  'approved',
];

const analyticsPeriodStart = new Date(2025, 8, 1, 0, 0, 0, 0);
const analyticsPeriodEnd = new Date(2026, 5, 30, 23, 59, 59, 999);
const seedAchievementNames = new Set(achievementTemplates.map((template) => template.achievementName));

function shortName(fullName: string) {
  const [lastName = '', firstName = '', middleName = ''] = fullName.split(' ');
  return `${lastName} ${firstName[0] ?? ''}.${middleName[0] ?? ''}.`;
}

function formatDate(day: number, month: number, year: number) {
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function parseAchievementDate(value?: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function isWithinAnalyticsPeriod(date: Date) {
  return date >= analyticsPeriodStart && date <= analyticsPeriodEnd;
}

function shouldRebuildStudentAchievements(studentAchievements: PersistedAchievement[]) {
  if (!studentAchievements.length) return true;

  const allSeedLike = studentAchievements.every((achievement) => seedAchievementNames.has(achievement.achievementName));
  const hasOutOfPeriodDates = studentAchievements.some((achievement) => {
    const parsedDate = parseAchievementDate(achievement.submittedDate || achievement.date);
    return !parsedDate || !isWithinAnalyticsPeriod(parsedDate);
  });

  return allSeedLike && hasOutOfPeriodDates;
}

function buildAchievements(student: PersistedUser, studentIndex: number): Omit<PersistedAchievement, 'id'>[] {
  const count = 2 + ((studentIndex * 5) % 9);
  const achievements: Omit<PersistedAchievement, 'id'>[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    const template = achievementTemplates[(studentIndex * 3 + offset) % achievementTemplates.length];
    const monthInfo = analyticsMonths[(studentIndex + offset) % analyticsMonths.length];
    const status = statusSequence[(studentIndex + offset) % statusSequence.length];
    const day = ((studentIndex * 3 + offset * 2) % 20) + 5;
    const submittedDay = Math.max(1, day - (((studentIndex + offset) % 3) + 1));
    const eventDate = formatDate(day, monthInfo.month, monthInfo.year);
    const submittedDate = formatDate(submittedDay, monthInfo.month, monthInfo.year);
    const expectedPoints = template.expectedPoints + ((studentIndex + offset) % 3) * 2;

    const history: PersistedAchievement['history'] = [
      { id: 1, action: 'created', user: shortName(student.name), userRole: 'Ученик', timestamp: `${submittedDate} 09:00` },
    ];

    if (status === 'approved') {
      history.push({
        id: 2,
        action: 'approved',
        user: 'Петров А.Н.',
        userRole: 'Куратор',
        timestamp: `${eventDate} 14:30`,
        comment: 'Подтверждено куратором',
      });
    }

    if (status === 'rejected') {
      history.push({
        id: 2,
        action: 'rejected',
        user: 'Петров А.Н.',
        userRole: 'Куратор',
        timestamp: `${eventDate} 13:10`,
        comment: 'Не хватает подтверждающего документа',
      });
    }

    achievements.push({
      studentUserId: student.id,
      studentName: student.name,
      studentClass: student.class ?? '—',
      achievementName: template.achievementName,
      category: template.category,
      level: template.level,
      result: template.result,
      expectedPoints,
      date: eventDate,
      submittedDate,
      documents: [template.document],
      description: `${template.achievementName} (${template.level})`,
      status,
      history,
    });
  }

  return achievements;
}

function getBaseState(): PersistedState {
  const fallbackState = JSON.parse(JSON.stringify(__getStateForTests())) as PersistedState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackState;

    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...fallbackState,
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : fallbackState.users,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : fallbackState.achievements,
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : fallbackState.registrations,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : fallbackState.notifications,
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : fallbackState.auditLogs,
      calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : fallbackState.calendarEvents,
      news: Array.isArray(parsed.news) ? parsed.news : fallbackState.news,
      sections: Array.isArray(parsed.sections) ? parsed.sections : fallbackState.sections,
      sectionApplications: Array.isArray(parsed.sectionApplications) ? parsed.sectionApplications : fallbackState.sectionApplications,
      sectionMembers: Array.isArray(parsed.sectionMembers) ? parsed.sectionMembers : fallbackState.sectionMembers,
      userSettings: Array.isArray(parsed.userSettings) ? parsed.userSettings : fallbackState.userSettings,
      classCatalog: Array.isArray(parsed.classCatalog) ? parsed.classCatalog : fallbackState.classCatalog,
    };
  } catch {
    return fallbackState;
  }
}

export function ensureFrontendSeedData() {
  if (typeof window === 'undefined') return false;

  const baseState = getBaseState();
  const users = [...baseState.users];
  let achievements = [...baseState.achievements];
  let classCatalog = [...baseState.classCatalog];
  const usersByLogin = new Map(users.map((user) => [user.login.toLowerCase(), user]));
  const classCatalogSet = new Set(classCatalog.map((className) => className.trim()));
  let nextUserId = users.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1;
  let nextAchievementId = achievements.reduce((maxId, achievement) => Math.max(maxId, achievement.id), 0) + 1;
  let changed = false;

  for (const [, , , className] of studentProfiles) {
    if (classCatalogSet.has(className)) continue;
    classCatalog.push(className);
    classCatalogSet.add(className);
    changed = true;
  }

  for (const seedUser of [...curatorUsers, ...studentUsers]) {
    if (usersByLogin.has(seedUser.login.toLowerCase())) continue;

    const createdUser: PersistedUser = {
      ...seedUser,
      id: nextUserId,
      lastLogin: 'Никогда',
    };

    nextUserId += 1;
    users.push(createdUser);
    usersByLogin.set(createdUser.login.toLowerCase(), createdUser);
    changed = true;
  }

  studentProfiles.forEach(([login], index) => {
    const student = usersByLogin.get(login.toLowerCase());
    if (!student) return;

    const existingAchievements = achievements.filter((achievement) => achievement.studentUserId === student.id);
    if (!shouldRebuildStudentAchievements(existingAchievements)) return;

    if (existingAchievements.length > 0) {
      const removableIds = new Set(existingAchievements.map((achievement) => achievement.id));
      achievements = achievements.filter((achievement) => !removableIds.has(achievement.id));
    }

    for (const achievement of buildAchievements(student, index + 1)) {
      achievements.push({
        ...achievement,
        id: nextAchievementId,
      });
      nextAchievementId += 1;
    }

    changed = true;
  });

  if (!changed) return false;

  classCatalog = [...new Set(classCatalog)].sort((left, right) => left.localeCompare(right, 'ru', { numeric: true }));

  const nextState: PersistedState = {
    ...baseState,
    users,
    achievements,
    classCatalog,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  return true;
}
