import type {
  SystemUser,
  StudentProfile,
  Achievement,
  Section,
  SectionApplication,
  SectionMember,
  NewsItem,
  CalendarEvent,
  AuditLogEntry,
  PendingRegistration,
  PersistedState,
} from './types';

// ─── System Users (with passwords for prototype auth) ─────────
export const INITIAL_USERS: SystemUser[] = [
  {
    id: 1,
    name: 'Смирнова Елена Владимировна',
    email: 'admin@school.edu',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    lastLogin: '08.03.2026 10:30',
  },
  {
    id: 2,
    name: 'Петров Андрей Николаевич',
    email: 'petrov@school.edu',
    password: 'curator123',
    role: 'curator',
    status: 'active',
    lastLogin: '08.03.2026 09:15',
  },
  {
    id: 3,
    name: 'Иванова Мария Сергеевна',
    email: 'ivanova@school.edu',
    password: 'curator123',
    role: 'curator',
    status: 'active',
    lastLogin: '07.03.2026 16:45',
  },
  // Students
  {
    id: 4,
    name: 'Иванов Иван Иванович',
    email: 'ivanov@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 1,
    class: '10-1',
    status: 'active',
    lastLogin: '08.03.2026 08:20',
  },
  {
    id: 5,
    name: 'Петрова Мария Сергеевна',
    email: 'petrova@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 2,
    class: '10-1',
    status: 'active',
    lastLogin: '07.03.2026 14:30',
  },
  {
    id: 6,
    name: 'Сидоров Алексей Петрович',
    email: 'sidorov@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 3,
    class: '10-2',
    status: 'active',
    lastLogin: '06.03.2026 11:00',
  },
  {
    id: 7,
    name: 'Козлова Елена Викторовна',
    email: 'kozlova@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 4,
    class: '11-1',
    status: 'active',
    lastLogin: '08.03.2026 07:45',
  },
  {
    id: 8,
    name: 'Новиков Дмитрий Александрович',
    email: 'novikov@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 5,
    class: '9-3',
    status: 'inactive',
    lastLogin: '20.02.2026 15:20',
  },
  {
    id: 9,
    name: 'Морозова Анна Игоревна',
    email: 'morozova@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 6,
    class: '11-2',
    status: 'active',
    lastLogin: '07.03.2026 13:10',
  },
  {
    id: 10,
    name: 'Волков Сергей Николаевич',
    email: 'volkov@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 7,
    class: '10-3',
    status: 'active',
    lastLogin: '06.03.2026 10:30',
  },
  {
    id: 11,
    name: 'Соловьева Ольга Дмитриевна',
    email: 'solovieva@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 8,
    class: '9-1',
    status: 'active',
    lastLogin: '08.03.2026 09:00',
  },
  {
    id: 12,
    name: 'Лебедев Андрей Владимирович',
    email: 'lebedev@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 9,
    class: '11-1',
    status: 'active',
    lastLogin: '05.03.2026 14:20',
  },
  {
    id: 13,
    name: 'Кузнецова Татьяна Алексеевна',
    email: 'kuznetsova@school.edu',
    password: 'student123',
    role: 'student',
    studentId: 10,
    class: '10-1',
    status: 'active',
    lastLogin: '07.03.2026 16:00',
  },
];

// ─── Student Profiles ─────────────────────────────────────────
export const INITIAL_STUDENTS: StudentProfile[] = [
  { id: 1, userId: 4,  lastName: 'Иванов',    firstName: 'Иван',    middleName: 'Иванович',    class: '10-1' },
  { id: 2, userId: 5,  lastName: 'Петрова',   firstName: 'Мария',   middleName: 'Сергеевна',   class: '10-1' },
  { id: 3, userId: 6,  lastName: 'Сидоров',   firstName: 'Алексей', middleName: 'Петрович',    class: '10-2' },
  { id: 4, userId: 7,  lastName: 'Козлова',   firstName: 'Елена',   middleName: 'Викторовна',  class: '11-1' },
  { id: 5, userId: 8,  lastName: 'Новиков',   firstName: 'Дмитрий', middleName: 'Александрович', class: '9-3' },
  { id: 6, userId: 9,  lastName: 'Морозова',  firstName: 'Анна',    middleName: 'Игоревна',    class: '11-2' },
  { id: 7, userId: 10, lastName: 'Волков',    firstName: 'Сергей',  middleName: 'Николаевич',  class: '10-3' },
  { id: 8, userId: 11, lastName: 'Соловьева', firstName: 'Ольга',   middleName: 'Дмитриевна',  class: '9-1' },
  { id: 9, userId: 12, lastName: 'Лебедев',   firstName: 'Андрей',  middleName: 'Владимирович', class: '11-1' },
  { id: 10, userId: 13, lastName: 'Кузнецова', firstName: 'Татьяна', middleName: 'Алексеевна', class: '10-1' },
];

// ─── Achievements ─────────────────────────────────────────────
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Иванов (studentId: 1)
  { id: 1, studentId: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', name: 'Всероссийская олимпиада по математике', category: 'Учебные достижения', level: 'Региональный', result: 'Призёр', points: 40, status: 'approved', date: '15.01.2026', submittedDate: '16.01.2026', documents: ['Диплом_ВОШ_математика.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '17.01.2026' },
  { id: 2, studentId: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', name: 'Олимпиада по информатике', category: 'Учебные достижения', level: 'Школьный', result: 'Победитель', points: 10, status: 'approved', date: '10.01.2026', submittedDate: '11.01.2026', documents: ['Грамота_информатика.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '12.01.2026' },
  { id: 3, studentId: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', name: 'Участие в волонтёрской акции', category: 'Внеурочная деятельность', level: '-', result: '25 часов', points: 25, status: 'pending', date: '18.01.2026', submittedDate: '18.01.2026', documents: ['Справка_волонтер.pdf'], description: 'Организация школьного мероприятия' },
  { id: 4, studentId: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', name: 'Защита проекта по информатике', category: 'Проектная деятельность', level: '-', result: 'Отлично', points: 40, status: 'pending', date: '19.01.2026', submittedDate: '19.01.2026', documents: ['Презентация.pdf', 'Оценочный_лист.pdf'] },
  { id: 5, studentId: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', name: 'Участие в школьном театре', category: 'Внеурочная деятельность', level: '-', result: '20 часов', points: 20, status: 'rejected', date: '12.01.2026', submittedDate: '12.01.2026', documents: ['Справка_театр.pdf'], comment: 'Необходимо предоставить справку от руководителя кружка', reviewedBy: 'Петров А.Н.', reviewedAt: '14.01.2026' },
  // Петрова (studentId: 2)
  { id: 6, studentId: 2, studentName: 'Петрова Мария Сергеевна', studentClass: '10-1', name: 'Городской конкурс живописи', category: 'Учебные достижения', level: 'Муниципальный', result: '1 место', points: 30, status: 'approved', date: '20.12.2025', submittedDate: '21.12.2025', documents: ['Грамота_живопись.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '22.12.2025' },
  { id: 7, studentId: 2, studentName: 'Петрова Мария Сергеевна', studentClass: '10-1', name: 'Участие в волонтёрской акции', category: 'Внеурочная деятельность', level: '-', result: '30 часов', points: 30, status: 'pending', date: '18.01.2026', submittedDate: '18.01.2026', documents: ['Справка_волонтер.pdf'], description: 'Помощь в организации школьного мероприятия' },
  { id: 8, studentId: 2, studentName: 'Петрова Мария Сергеевна', studentClass: '10-1', name: 'Школьная ярмарка талантов', category: 'Внеурочная деятельность', level: 'Школьный', result: 'Участие', points: 10, status: 'approved', date: '05.12.2025', submittedDate: '06.12.2025', documents: [], reviewedBy: 'Петров А.Н.', reviewedAt: '07.12.2025' },
  // Сидоров (studentId: 3)
  { id: 9, studentId: 3, studentName: 'Сидоров Алексей Петрович', studentClass: '10-2', name: 'Региональный конкурс по робототехнике', category: 'Учебные достижения', level: 'Региональный', result: '2 место', points: 35, status: 'approved', date: '10.11.2025', submittedDate: '11.11.2025', documents: ['Диплом_робот.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '12.11.2025' },
  { id: 10, studentId: 3, studentName: 'Сидоров Алексей Петрович', studentClass: '10-2', name: 'Защита проекта по информатике', category: 'Проектная деятельность', level: '-', result: 'Отлично', points: 40, status: 'pending', date: '19.01.2026', submittedDate: '19.01.2026', documents: ['Презентация.pdf', 'Оценочный_лист.pdf'] },
  { id: 11, studentId: 3, studentName: 'Сидоров Алексей Петрович', studentClass: '10-2', name: 'Олимпиада по химии', category: 'Учебные достижения', level: 'Школьный', result: 'Победитель', points: 10, status: 'approved', date: '15.10.2025', submittedDate: '16.10.2025', documents: ['Грамота_химия.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '17.10.2025' },
  // Козлова (studentId: 4)
  { id: 12, studentId: 4, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', name: 'Участие в спортивных соревнованиях по лёгкой атлетике', category: 'Внеурочная деятельность', level: 'Региональный', result: '2 место', points: 30, status: 'approved', date: '10.01.2026', submittedDate: '11.01.2026', documents: ['Грамота_спорт.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '13.01.2026' },
  { id: 13, studentId: 4, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', name: 'Олимпиада по биологии', category: 'Учебные достижения', level: 'Муниципальный', result: 'Призёр', points: 20, status: 'approved', date: '05.11.2025', submittedDate: '06.11.2025', documents: ['Диплом_биология.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '08.11.2025' },
  { id: 14, studentId: 4, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', name: 'Участие в хоровом ансамбле', category: 'Внеурочная деятельность', level: '-', result: 'Городской фестиваль', points: 15, status: 'approved', date: '20.12.2025', submittedDate: '21.12.2025', documents: ['Справка_хор.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '23.12.2025' },
  // Новиков (studentId: 5)
  { id: 15, studentId: 5, studentName: 'Новиков Дмитрий Александрович', studentClass: '9-3', name: 'Муниципальная олимпиада по физике', category: 'Учебные достижения', level: 'Муниципальный', result: 'Победитель', points: 20, status: 'approved', date: '12.01.2026', submittedDate: '13.01.2026', documents: ['Диплом_физика.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '14.01.2026' },
  { id: 16, studentId: 5, studentName: 'Новиков Дмитрий Александрович', studentClass: '9-3', name: 'Школьная олимпиада по математике', category: 'Учебные достижения', level: 'Школьный', result: 'Победитель', points: 10, status: 'approved', date: '20.11.2025', submittedDate: '21.11.2025', documents: ['Грамота_математика.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '22.11.2025' },
  // Морозова (studentId: 6)
  { id: 17, studentId: 6, studentName: 'Морозова Анна Игоревна', studentClass: '11-2', name: 'Конкурс чтецов', category: 'Учебные достижения', level: 'Муниципальный', result: '1 место', points: 30, status: 'approved', date: '25.11.2025', submittedDate: '26.11.2025', documents: ['Диплом_чтецы.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '27.11.2025' },
  { id: 18, studentId: 6, studentName: 'Морозова Анна Игоревна', studentClass: '11-2', name: 'Волонтёрская деятельность', category: 'Внеурочная деятельность', level: '-', result: '40 часов', points: 40, status: 'approved', date: '15.01.2026', submittedDate: '15.01.2026', documents: ['Справка.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '16.01.2026' },
  { id: 19, studentId: 6, studentName: 'Морозова Анна Игоревна', studentClass: '11-2', name: 'Исследовательская работа по истории', category: 'Проектная деятельность', level: 'Региональный', result: '2 место', points: 35, status: 'pending', date: '20.01.2026', submittedDate: '20.01.2026', documents: ['Работа.pdf', 'Рецензия.pdf'] },
  // Волков (studentId: 7)
  { id: 20, studentId: 7, studentName: 'Волков Сергей Николаевич', studentClass: '10-3', name: 'Первенство области по баскетболу', category: 'Внеурочная деятельность', level: 'Региональный', result: '3 место', points: 25, status: 'approved', date: '10.12.2025', submittedDate: '11.12.2025', documents: ['Грамота_баскетбол.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '13.12.2025' },
  { id: 21, studentId: 7, studentName: 'Волков Сергей Николаевич', studentClass: '10-3', name: 'НПК по физике', category: 'Проектная деятельность', level: 'Муниципальный', result: 'Участие', points: 10, status: 'approved', date: '15.10.2025', submittedDate: '16.10.2025', documents: [], reviewedBy: 'Иванова М.С.', reviewedAt: '18.10.2025' },
  // Соловьева (studentId: 8)
  { id: 22, studentId: 8, studentName: 'Соловьева Ольга Дмитриевна', studentClass: '9-1', name: 'Всероссийская олимпиада по русскому языку', category: 'Учебные достижения', level: 'Муниципальный', result: 'Призёр', points: 20, status: 'approved', date: '20.11.2025', submittedDate: '21.11.2025', documents: ['Диплом_русский.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '23.11.2025' },
  { id: 23, studentId: 8, studentName: 'Соловьева Ольга Дмитриевна', studentClass: '9-1', name: 'Городская олимпиада по литературе', category: 'Учебные достижения', level: 'Муниципальный', result: '1 место', points: 30, status: 'approved', date: '05.12.2025', submittedDate: '06.12.2025', documents: ['Диплом_литература.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '08.12.2025' },
  { id: 24, studentId: 8, studentName: 'Соловьева Ольга Дмитриевна', studentClass: '9-1', name: 'Участие в эко-акции "Чистый город"', category: 'Внеурочная деятельность', level: '-', result: '15 часов', points: 15, status: 'pending', date: '22.01.2026', submittedDate: '22.01.2026', documents: ['Справка_эко.pdf'] },
  // Лебедев (studentId: 9)
  { id: 25, studentId: 9, studentName: 'Лебедев Андрей Владимирович', studentClass: '11-1', name: 'Региональный этап ВОШ по химии', category: 'Учебные достижения', level: 'Региональный', result: 'Призёр', points: 40, status: 'approved', date: '18.01.2026', submittedDate: '19.01.2026', documents: ['Диплом_химия.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '20.01.2026' },
  { id: 26, studentId: 9, studentName: 'Лебедев Андрей Владимирович', studentClass: '11-1', name: 'Конкурс научно-исследовательских работ', category: 'Проектная деятельность', level: 'Муниципальный', result: '2 место', points: 20, status: 'approved', date: '10.12.2025', submittedDate: '11.12.2025', documents: ['Работа_НПК.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '13.12.2025' },
  // Кузнецова (studentId: 10)
  { id: 27, studentId: 10, studentName: 'Кузнецова Татьяна Алексеевна', studentClass: '10-1', name: 'Олимпиада по обществознанию', category: 'Учебные достижения', level: 'Муниципальный', result: 'Победитель', points: 20, status: 'approved', date: '25.11.2025', submittedDate: '26.11.2025', documents: ['Диплом_обществознание.pdf'], reviewedBy: 'Иванова М.С.', reviewedAt: '28.11.2025' },
  { id: 28, studentId: 10, studentName: 'Кузнецова Татьяна Алексеевна', studentClass: '10-1', name: 'Дебаты "Гражданин и общество"', category: 'Внеурочная деятельность', level: 'Муниципальный', result: 'Победитель', points: 25, status: 'approved', date: '10.01.2026', submittedDate: '11.01.2026', documents: ['Сертификат_дебаты.pdf'], reviewedBy: 'Петров А.Н.', reviewedAt: '13.01.2026' },
  { id: 29, studentId: 10, studentName: 'Кузнецова Татьяна Алексеевна', studentClass: '10-1', name: 'Исследовательский проект "Экономика школы"', category: 'Проектная деятельность', level: '-', result: 'Защита', points: 30, status: 'pending', date: '21.01.2026', submittedDate: '21.01.2026', documents: ['Проект.pdf'] },
];

// ─── Sections ─────────────────────────────────────────────────
export const INITIAL_SECTIONS: Section[] = [
  { id: '1', name: 'Шахматный клуб "Гамбит"', category: 'sport', description: 'Обучение игре в шахматы, участие в турнирах, развитие стратегического мышления.', schedule: 'Пн, Ср 15:00–16:30', location: 'Каб. 305', teacher: 'Карпов А.Е.', capacity: 20 },
  { id: '2', name: 'Робототехника', category: 'science', description: 'Конструирование и программирование роботов на базе LEGO Mindstorms и Arduino.', schedule: 'Вт, Чт 16:00–17:30', location: 'Лаборатория 2', teacher: 'Техников С.П.', capacity: 15 },
  { id: '3', name: 'Лёгкая атлетика', category: 'sport', description: 'Бег, прыжки, общая физическая подготовка. Подготовка к городским соревнованиям.', schedule: 'Пн, Пт 14:30–16:00', location: 'Спортзал 1', teacher: 'Быстроногов В.В.', capacity: 30 },
  { id: '4', name: 'Изостудия "Палитра"', category: 'art', description: 'Живопись, графика, композиция. Работа с различными материалами.', schedule: 'Ср, Пт 15:30–17:00', location: 'Каб. 201', teacher: 'Краскина Е.И.', capacity: 12 },
  { id: '5', name: 'Школьный театр', category: 'art', description: 'Актёрское мастерство, сценическая речь, постановка спектаклей.', schedule: 'Вт, Чт 17:00–19:00', location: 'Актовый зал', teacher: 'Сценова М.А.', capacity: 25 },
  { id: '6', name: 'Юный программист', category: 'science', description: 'Основы программирования на Python, web-разработка, алгоритмы.', schedule: 'Пн, Ср 17:00–18:30', location: 'Каб. 302', teacher: 'Кодов И.В.', capacity: 18 },
  { id: '7', name: 'Экологический клуб', category: 'social', description: 'Экологические акции, исследования, проектная деятельность.', schedule: 'Пт 16:00–17:30', location: 'Каб. 105', teacher: 'Природина Е.С.', capacity: 20 },
];

// ─── Section Applications ─────────────────────────────────────
export const INITIAL_SECTION_APPLICATIONS: SectionApplication[] = [
  { id: 'app-1', studentId: 2, studentName: 'Петрова Мария Сергеевна', studentClass: '10-1', sectionId: '4', status: 'pending', date: '20.01.2026' },
  { id: 'app-2', studentId: 3, studentName: 'Сидоров Алексей Петрович', studentClass: '10-2', sectionId: '2', status: 'approved', date: '10.01.2026' },
  { id: 'app-3', studentId: 4, studentName: 'Козлова Елена Викторовна', studentClass: '11-1', sectionId: '3', status: 'approved', date: '05.09.2025' },
  { id: 'app-4', studentId: 7, studentName: 'Волков Сергей Николаевич', studentClass: '10-3', sectionId: '3', status: 'approved', date: '05.09.2025' },
  { id: 'app-5', studentId: 1, studentName: 'Иванов Иван Иванович', studentClass: '10-1', sectionId: '6', status: 'approved', date: '08.09.2025' },
  { id: 'app-6', studentId: 8, studentName: 'Соловьева Ольга Дмитриевна', studentClass: '9-1', sectionId: '7', status: 'pending', date: '22.01.2026' },
];

// ─── Section Members ──────────────────────────────────────────
export const INITIAL_SECTION_MEMBERS: SectionMember[] = [
  { sectionId: '2', studentId: 3 },
  { sectionId: '3', studentId: 4 },
  { sectionId: '3', studentId: 7 },
  { sectionId: '6', studentId: 1 },
  { sectionId: '1', studentId: 5 },
];

// ─── News ─────────────────────────────────────────────────────
export const INITIAL_NEWS: NewsItem[] = [
  { id: 1, title: 'Поздравляем призёров регионального этапа ВОШ!', content: 'Ученики нашей школы показали отличные результаты на региональном этапе Всероссийской олимпиады школьников. Особого внимания заслуживают Иванов Иван (10-1) — призёр по математике, и Лебедев Андрей (11-1) — призёр по химии.', author: 'Смирнова Е.В.', authorRole: 'admin', date: '20.01.2026', category: 'Достижения', pinned: true },
  { id: 2, title: 'Приём заявок на региональный этап НПК', content: 'До 5 февраля принимаются заявки на участие в региональном этапе научно-практической конференции. Подайте заявку через личный кабинет или обратитесь к куратору.', author: 'Петров А.Н.', authorRole: 'curator', date: '18.01.2026', category: 'Мероприятия', pinned: true },
  { id: 3, title: 'Обновление системы оценивания достижений', content: 'С 1 февраля вводится обновлённая система оценивания достижений учащихся. Подробнее — в разделе "Правила" личного кабинета.', author: 'Смирнова Е.В.', authorRole: 'admin', date: '15.01.2026', category: 'Объявления', pinned: false },
  { id: 4, title: 'Запись в секцию "Юный программист"', content: 'Открыт набор в секцию "Юный программист" на II полугодие. Занятия проводятся по понедельникам и средам. Для записи подайте заявку в системе.', author: 'Иванова М.С.', authorRole: 'curator', date: '10.01.2026', category: 'Секции', pinned: false },
  { id: 5, title: 'Итоги школьного этапа олимпиад', content: 'Завершился школьный этап предметных олимпиад. В этом году приняли участие более 200 учащихся. Поздравляем всех победителей!', author: 'Смирнова Е.В.', authorRole: 'admin', date: '05.01.2026', category: 'Достижения', pinned: false },
];

// ─── Calendar Events ──────────────────────────────────────────
export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Муниципальный этап ВОШ по математике', date: '2026-02-10', time: '09:00', type: 'olympiad', description: 'Участвуют учащиеся 9–11 классов. Место проведения: МАОУ ОЦ2.' },
  { id: 2, title: 'Региональный НПК', date: '2026-02-15', time: '10:00', type: 'competition', description: 'Научно-практическая конференция регионального уровня. Дедлайн заявок: 5 февраля.' },
  { id: 3, title: 'Дедлайн: заявки на НПК', date: '2026-02-05', type: 'deadline', description: 'Последний день приёма заявок на региональный этап НПК.' },
  { id: 4, title: 'Педагогический совет', date: '2026-02-20', time: '16:00', type: 'meeting', description: 'Подведение итогов II четверти, обсуждение рейтинга достижений.' },
  { id: 5, title: 'День науки — школьный фестиваль', date: '2026-02-08', time: '12:00', type: 'event', description: 'Ярмарка проектов, квизы по предметам, мастер-классы.' },
  { id: 6, title: 'Олимпиада по информатике (школьный)', date: '2026-03-01', time: '09:00', type: 'olympiad', description: 'Школьный этап олимпиады по информатике.' },
  { id: 7, title: 'Городской конкурс "Ученик года"', date: '2026-03-15', time: '14:00', type: 'competition', description: 'Финал городского конкурса.' },
  { id: 8, title: 'Дедлайн: подача достижений за четверть', date: '2026-03-25', type: 'deadline', description: 'Последний день подачи заявок за 3-ю четверть.' },
];

// ─── Audit Log ────────────────────────────────────────────────
export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  { id: 1, timestamp: '08.03.2026 10:30:25', userId: 1, user: 'Смирнова Е.В.', userRole: 'admin', action: 'Вход в систему', entity: 'Сессия', details: 'Успешный вход администратора' },
  { id: 2, timestamp: '08.03.2026 09:15:10', userId: 2, user: 'Петров А.Н.', userRole: 'curator', action: 'Вход в систему', entity: 'Сессия', details: 'Успешный вход куратора' },
  { id: 3, timestamp: '07.03.2026 16:00:33', userId: 3, user: 'Иванова М.С.', userRole: 'curator', action: 'Одобрение достижения', entity: 'Достижения', details: 'Одобрена заявка Лебедева А.В.: "Региональный этап ВОШ по химии"' },
  { id: 4, timestamp: '07.03.2026 15:45:10', userId: 2, user: 'Петров А.Н.', userRole: 'curator', action: 'Одобрение достижения', entity: 'Достижения', details: 'Одобрена заявка Кузнецовой Т.А.: "Дебаты «Гражданин и общество»"' },
  { id: 5, timestamp: '07.03.2026 14:20:00', userId: 2, user: 'Петров А.Н.', userRole: 'curator', action: 'Отклонение достижения', entity: 'Достижения', details: 'Отклонена заявка Иванова И.И.: "Школьный театр" — требуется справка от руководителя' },
  { id: 6, timestamp: '06.03.2026 13:50:45', userId: 4, user: 'Иванов И.И.', userRole: 'student', action: 'Создание заявки', entity: 'Достижения', details: 'Создана заявка: "Защита проекта по информатике"' },
  { id: 7, timestamp: '06.03.2026 12:30:22', userId: 5, user: 'Петрова М.С.', userRole: 'student', action: 'Создание заявки', entity: 'Достижения', details: 'Создана заявка: "Участие в волонтёрской акции"' },
  { id: 8, timestamp: '05.03.2026 11:00:11', userId: 1, user: 'Смирнова Е.В.', userRole: 'admin', action: 'Создание пользователя', entity: 'Пользователи', details: 'Добавлен новый ученик: Кузнецова Т.А. (10-1)' },
  { id: 9, timestamp: '05.03.2026 10:30:05', userId: 1, user: 'Смирнова Е.В.', userRole: 'admin', action: 'Обновление настроек', entity: 'Система', details: 'Обновлена система баллов: региональный уровень — 40 б.' },
  { id: 10, timestamp: '04.03.2026 09:45:30', userId: 3, user: 'Иванова М.С.', userRole: 'curator', action: 'Одобрение заявки в секцию', entity: 'Секции', details: 'Одобрена заявка Сидорова А.П. в секцию "Робототехника"' },
];

// ─── Pending Registrations ────────────────────────────────────
export const INITIAL_REGISTRATIONS: PendingRegistration[] = [
  { id: 1, lastName: 'Смирнов', firstName: 'Алексей', middleName: 'Петрович', email: 'smirnov.new@school.edu', phone: '+7 (900) 111-11-11', class: '9-1', birthDate: '15.05.2009', parentEmail: 'smirnov.parent@example.com', parentPhone: '+7 (900) 111-11-12', submittedAt: '01.03.2026 14:30', status: 'pending' },
  { id: 2, lastName: 'Фёдорова', firstName: 'Екатерина', middleName: 'Владимировна', email: 'fedorova.new@school.edu', phone: '+7 (900) 222-22-22', class: '10-2', birthDate: '22.08.2008', parentEmail: 'fedorova.parent@example.com', parentPhone: '+7 (900) 222-22-23', submittedAt: '02.03.2026 15:45', status: 'pending' },
  { id: 3, lastName: 'Николаев', firstName: 'Дмитрий', middleName: 'Сергеевич', email: 'nikolaev.new@school.edu', phone: '+7 (900) 333-33-33', class: '11-1', birthDate: '10.11.2007', parentEmail: 'nikolaev.parent@example.com', parentPhone: '+7 (900) 333-33-34', submittedAt: '03.03.2026 16:20', status: 'pending' },
];

// ─── Full initial state ───────────────────────────────────────
export const INITIAL_STATE: PersistedState = {
  users: INITIAL_USERS,
  students: INITIAL_STUDENTS,
  achievements: INITIAL_ACHIEVEMENTS,
  sections: INITIAL_SECTIONS,
  sectionApplications: INITIAL_SECTION_APPLICATIONS,
  sectionMembers: INITIAL_SECTION_MEMBERS,
  news: INITIAL_NEWS,
  events: INITIAL_EVENTS,
  auditLog: INITIAL_AUDIT_LOG,
  registrations: INITIAL_REGISTRATIONS,
};
