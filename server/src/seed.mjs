import bcrypt from 'bcryptjs';
import { pool } from './db.mjs';

const defaultUsers = [
  { login: 'admin', password: 'admin123', name: 'Смирнова Елена Владимировна', email: 'smirnova@school.edu', role: 'admin', class_name: null },
  { login: 'curator', password: 'curator123', name: 'Петров Андрей Николаевич', email: 'petrov@school.edu', role: 'curator', class_name: null },
  { login: 'student', password: 'student123', name: 'Иванов Иван Иванович', email: 'ivanov.student@school.edu', role: 'student', class_name: '10-1' }
];

const curatorUsers = [
  { login: 'curator01', password: 'curator123', name: 'Кузнецова Марина Олеговна', email: 'kuznetsova.curator@school.edu', role: 'curator', class_name: null },
  { login: 'curator02', password: 'curator123', name: 'Соколов Дмитрий Артемович', email: 'sokolov.curator@school.edu', role: 'curator', class_name: null },
  { login: 'curator03', password: 'curator123', name: 'Васильева Ирина Сергеевна', email: 'vasileva.curator@school.edu', role: 'curator', class_name: null }
];

const studentProfiles = [
  ['student01', 'student123', 'Алексеев Кирилл Романович', 'alekseev.kirill@school.edu', '8-1'],
  ['student02', 'student123', 'Морозова Анна Игоревна', 'morozova.anna@school.edu', '8-1'],
  ['student03', 'student123', 'Федоров Максим Денисович', 'fedorov.maxim@school.edu', '8-2'],
  ['student04', 'student123', 'Никитина София Павловна', 'nikitina.sofia@school.edu', '8-2'],
  ['student05', 'student123', 'Волков Артем Евгеньевич', 'volkov.artem@school.edu', '9-1'],
  ['student06', 'student123', 'Семенова Дарья Олеговна', 'semenova.daria@school.edu', '9-1'],
  ['student07', 'student123', 'Павлов Егор Михайлович', 'pavlov.egor@school.edu', '9-2'],
  ['student08', 'student123', 'Козлова Мария Андреевна', 'kozlova.maria@school.edu', '9-2'],
  ['student09', 'student123', 'Орлов Никита Сергеевич', 'orlov.nikita@school.edu', '10-1'],
  ['student10', 'student123', 'Беляева Полина Викторовна', 'belyaeva.polina@school.edu', '10-1'],
  ['student11', 'student123', 'Громов Илья Алексеевич', 'gromov.ilya@school.edu', '10-2'],
  ['student12', 'student123', 'Тихонова Екатерина Романовна', 'tikhonova.ekaterina@school.edu', '10-2'],
  ['student13', 'student123', 'Захаров Матвей Кириллович', 'zakharov.matvey@school.edu', '11-1'],
  ['student14', 'student123', 'Комарова Алиса Сергеевна', 'komarova.alisa@school.edu', '11-1'],
  ['student15', 'student123', 'Давыдов Тимофей Андреевич', 'davydov.timofey@school.edu', '11-2'],
  ['student16', 'student123', 'Ершова Вероника Ильинична', 'ershova.veronika@school.edu', '11-2'],
  ['student17', 'student123', 'Попов Владислав Николаевич', 'popov.vladislav@school.edu', '7-3'],
  ['student18', 'student123', 'Жукова Валерия Дмитриевна', 'zhukova.valeria@school.edu', '7-3'],
  ['student19', 'student123', 'Крылов Степан Олегович', 'krylov.stepan@school.edu', '8-3'],
  ['student20', 'student123', 'Лебедева Ульяна Павловна', 'lebedeva.ulyana@school.edu', '8-3'],
  ['student21', 'student123', 'Виноградов Ярослав Игоревич', 'vinogradov.yaroslav@school.edu', '9-3'],
  ['student22', 'student123', 'Киселева Милана Артемовна', 'kiseleva.milana@school.edu', '9-3'],
  ['student23', 'student123', 'Тарасов Роман Евгеньевич', 'tarasov.roman@school.edu', '10-3'],
  ['student24', 'student123', 'Щербакова Алина Маратовна', 'shcherbakova.alina@school.edu', '10-3']
].map(([login, password, name, email, class_name]) => ({
  login,
  password,
  name,
  email,
  role: 'student',
  class_name
}));

const achievementTemplates = [
  { title: 'Победитель школьной олимпиады по математике', category: 'Олимпиада', level: 'Школьный', result: '1 место', points: 12 },
  { title: 'Призер муниципальной олимпиады по информатике', category: 'Олимпиада', level: 'Муниципальный', result: '2 место', points: 18 },
  { title: 'Участник регионального конкурса исследовательских работ', category: 'Научная работа', level: 'Региональный', result: 'Участник', points: 16 },
  { title: 'Победитель конкурса проектов по робототехнике', category: 'Проект', level: 'Региональный', result: '1 место', points: 25 },
  { title: 'Призер литературного конкурса', category: 'Творчество', level: 'Муниципальный', result: '3 место', points: 10 },
  { title: 'Победитель турнира по шахматам', category: 'Спорт', level: 'Муниципальный', result: '1 место', points: 14 },
  { title: 'Призер конференции юных исследователей', category: 'Научная работа', level: 'Всероссийский', result: 'Лауреат', points: 28 },
  { title: 'Участник волонтерского форума', category: 'Общественная деятельность', level: 'Региональный', result: 'Сертификат', points: 8 },
  { title: 'Победитель конкурса рисунков', category: 'Творчество', level: 'Школьный', result: '1 место', points: 9 },
  { title: 'Призер соревнований по плаванию', category: 'Спорт', level: 'Региональный', result: '2 место', points: 17 },
  { title: 'Участник инженерного хакатона', category: 'Проект', level: 'Муниципальный', result: 'Финалист', points: 20 },
  { title: 'Победитель дебатного турнира', category: 'Общественная деятельность', level: 'Школьный', result: '1 место', points: 11 }
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
  { year: 2026, month: 6 }
];

const statusSequence = [
  'approved',
  'approved',
  'pending',
  'approved',
  'approved',
  'rejected',
  'approved',
  'pending',
  'approved',
  'approved'
];

function buildAchievements(studentIndex) {
  const count = 2 + ((studentIndex * 5) % 9);
  const achievements = [];

  for (let offset = 0; offset < count; offset += 1) {
    const template = achievementTemplates[(studentIndex * 3 + offset) % achievementTemplates.length];
    const monthInfo = analyticsMonths[(studentIndex + offset) % analyticsMonths.length];
    const day = ((studentIndex * 3 + offset * 2) % 20) + 5;
    const points = template.points + ((studentIndex + offset) % 3) * 2;
    const status = statusSequence[(studentIndex + offset) % statusSequence.length];

    achievements.push({
      title: template.title,
      category: template.category,
      level: template.level,
      result: template.result,
      points,
      status,
      eventDate: `${monthInfo.year}-${String(monthInfo.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  return achievements;
}

const achievementSeedMap = new Map(
  studentProfiles.map((student, index) => [student.login, buildAchievements(index + 1)])
);
achievementSeedMap.set('student', buildAchievements(0));

async function ensureUser(user) {
  const exists = await pool.query('select id from users where login=$1', [user.login]);
  if (exists.rowCount) {
    return exists.rows[0].id;
  }

  const hash = await bcrypt.hash(user.password, 10);
  const inserted = await pool.query(
    `insert into users (login, password_hash, name, email, role, class_name, status)
     values ($1,$2,$3,$4,$5,$6,'active')
     returning id`,
    [user.login, hash, user.name, user.email, user.role, user.class_name]
  );

  return inserted.rows[0].id;
}

async function ensureAchievements(studentUserId, achievements) {
  if (!achievements?.length) return;

  const exists = await pool.query('select id from achievements where student_user_id=$1 limit 1', [studentUserId]);
  if (exists.rowCount) return;

  for (const achievement of achievements) {
    await pool.query(
      `insert into achievements (student_user_id, title, category, level, result, points, status, event_date)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        studentUserId,
        achievement.title,
        achievement.category,
        achievement.level,
        achievement.result,
        achievement.points,
        achievement.status,
        achievement.eventDate
      ]
    );
  }
}

async function run() {
  const users = [...defaultUsers, ...curatorUsers, ...studentProfiles];

  for (const user of users) {
    const userId = await ensureUser(user);

    if (user.role === 'student') {
      await ensureAchievements(userId, achievementSeedMap.get(user.login) || []);
    }
  }

  console.log('Seed completed');
}

run()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error('Seed failed:', err.message);
    await pool.end();
    process.exit(1);
  });
