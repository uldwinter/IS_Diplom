import fs from 'fs';

const path = 'server/contracts/openapi.yaml';
const content = fs.readFileSync(path, 'utf8');
const required = ['/auth/login', '/auth/refresh', '/users', '/achievements', '/registrations'];
const missing = required.filter((r) => !content.includes(r));
if (missing.length) {
  console.error('Missing API routes in contract:', missing.join(', '));
  process.exit(1);
}
console.log('OpenAPI contract smoke-check passed');
