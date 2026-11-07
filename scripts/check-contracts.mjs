import fs from 'node:fs';
import assert from 'node:assert/strict';
const contract = fs.readFileSync('server/contracts/openapi.yaml', 'utf8');
const routes = ['/health', '/bootstrap', '/auth/login', '/auth/logout', '/auth/me', '/state', '/commands', '/registrations', '/documents', '/documents/{id}', '/backup', '/restore'];
for (const route of routes) assert.ok(contract.includes(`${route}:`), `Missing API route in contract: ${route}`);
console.log('OpenAPI routes present');
