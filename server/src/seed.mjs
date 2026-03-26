import bcrypt from 'bcryptjs';
import { pool } from './db.mjs';

const users = [
  { login: 'admin', password: 'admin123', name: 'Смирнова Елена Владимировна', email: 'smirnova@school.edu', role: 'admin', class_name: null },
  { login: 'curator', password: 'curator123', name: 'Петров Андрей Николаевич', email: 'petrov@school.edu', role: 'curator', class_name: null },
  { login: 'student', password: 'student123', name: 'Иванов Иван Иванович', email: 'ivanov.student@school.edu', role: 'student', class_name: '10-1' }
];

async function run() {
  for (const user of users) {
    const exists = await pool.query('select id from users where login=$1', [user.login]);
    if (exists.rowCount) continue;

    const hash = await bcrypt.hash(user.password, 10);
    await pool.query(
      `insert into users (login, password_hash, name, email, role, class_name, status)
       values ($1,$2,$3,$4,$5,$6,'active')`,
      [user.login, hash, user.name, user.email, user.role, user.class_name]
    );
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
