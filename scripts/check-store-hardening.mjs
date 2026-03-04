import fs from 'fs';

const content = fs.readFileSync('src/app/backend/store.ts', 'utf8');
const checks = [
  'failedLoginAttempts',
  'lockedUntil',
  'addSectionApplication',
  'capacity',
  'changeCurrentUserPassword',
  'addAudit(actor,',
];
const missing = checks.filter((c) => !content.includes(c));
if (missing.length) {
  console.error('Store hardening check failed. Missing markers:', missing.join(', '));
  process.exit(1);
}
console.log('Store hardening smoke-check passed');
