import fs from 'node:fs';
import assert from 'node:assert/strict';
const store = fs.readFileSync('src/app/backend/store.ts', 'utf8');
assert.doesNotMatch(store, /localStorage|hashPassword|INITIAL_STATE/, 'Client must not persist identities, password hashes, or demo data');
assert.match(store, /credentials: 'include'/, 'Use server cookie session');
assert.match(store, /response\.ok/, 'Reject failed responses');
console.log('Client authority boundary checked; behavior is covered by npm test');
