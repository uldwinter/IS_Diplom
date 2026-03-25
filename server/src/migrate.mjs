import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');

async function run() {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  if (!files.length) {
    console.log('No migration files found');
    return;
  }

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    process.stdout.write(`Applying ${file} ... `);
    await pool.query(sql);
    console.log('OK');
  }
}

run()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error('Migration failed:', err.message);
    await pool.end();
    process.exit(1);
  });
