import fs from 'fs';

const content = fs.readFileSync('src/app/backend/store.ts', 'utf8');
const checks = [
  'failedLoginAttempts',
  'lockedUntil',
  'addSectionApplication',
  'capacity',
  'changeCurrentUserPassword',
  'addAudit(actor,',
  'hashPassword',
  'ensurePasswordHash',
];
const missing = checks.filter((c) => !content.includes(c));
if (missing.length) {
  console.error('Store hardening check failed. Missing markers:', missing.join(', '));
  process.exit(1);
}

const forbiddenPlainPasswords = ['admin123', 'curator123', 'student123'];
const foundPlain = forbiddenPlainPasswords.filter((p) => content.includes(`'${p}'`) || content.includes(`\"${p}\"`));
if (foundPlain.length) {
  console.error('Store hardening check failed. Plaintext password markers found:', foundPlain.join(', '));
  process.exit(1);
}

console.log('Store hardening smoke-check passed');
