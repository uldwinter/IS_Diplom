import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const source = stripTypeScriptTypes(fs.readFileSync(new URL('../src/app/backend/store.ts', import.meta.url), 'utf8'))
  .replace(/import \{ useSyncExternalStore \} from 'react';/, 'const useSyncExternalStore = (_subscribe, snapshot) => snapshot();')
  .replace('import.meta.env.VITE_API_URL', "''").replace(/^export /gm, '');
function fixture(fetch) {
  const context = vm.createContext({ fetch, AbortController, setTimeout, clearTimeout, console,
    document: { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} },
    window: { setInterval, addEventListener() {}, removeEventListener() {} },
  });
  vm.runInContext(source + '\n globalThis.api = { initializeBackend, login, submitAchievement, submitStudentRegistrationWithFallback, useBackendState, refreshBackendState, getCurrentUser, logout };', context);
  return context.api;
}
const snapshot = (id = 3) => ({currentUserId:id, users:[{id,name:'Student',role:'student',status:'active'}], achievements:[], registrations:[], notifications:[], auditLogs:[], calendarEvents:[], news:[], sections:[], sectionApplications:[], sectionMembers:[], userSettings:[], scoringRules:{}, classCatalog:['10-1']});
const response = (status, body) => ({ok:status>=200&&status<300,status,json:async()=>body});

test('server rejected registration never becomes local success', async () => {
  const api = fixture(async()=>response(400,{message:'Класс не выбран'}));
  const result = await api.submitStudentRegistrationWithFallback({login:'x'});
  assert.equal(result.ok,false); assert.equal(result.message,'Класс не выбран');
  assert.equal(api.useBackendState().registrations.length,0);
});
test('network failure does not fabricate user or achievement', async () => {
  const api = fixture(async()=>{ throw new TypeError('offline'); });
  assert.equal((await api.login('student','secret')).ok,false);
  assert.equal((await api.submitAchievement(3,{name:'Award'})).ok,false);
  assert.equal(api.getCurrentUser(),null); assert.equal(api.useBackendState().achievements.length,0);
});
test('bootstrap catalog survives reload and anonymous session response', async () => {
  const fetch = async path => path.endsWith('/bootstrap') ? response(200,{classCatalog:['10-1','10-2'],scoringRules:{}}) : response(401,{message:'Войдите'});
  for(let i=0;i<2;i++) { const api = fixture(fetch); await api.initializeBackend(); assert.equal(api.useBackendState().classCatalog.length,2); assert.equal(api.useBackendState().currentUserId,null); }
});
test('login and commands use cookie credentials and server snapshots', async () => {
  const calls=[];
  const api=fixture(async(path,init)=>{calls.push({path,init});return response(200,{ok:true,state:snapshot(),user:snapshot().users[0]});});
  assert.equal((await api.login('student','secret')).ok,true);
  assert.equal(api.getCurrentUser().id,3);
  assert.equal((await api.submitAchievement(3,{name:'Award'})).ok,true);
  assert.equal(calls[0].init.credentials,'include');
  assert.equal(JSON.parse(calls[1].init.body).name,'submitAchievement');
});
test('stale read response cannot overwrite a completed write', async () => {
  let resolveRead;
  const api=fixture(async path=>path.endsWith('/state')?new Promise(resolve=>{resolveRead=resolve;}):response(200,{ok:true,state:snapshot(7),user:snapshot(7).users[0]}));
  const reading=api.refreshBackendState();
  await api.login('new','secret');
  resolveRead(response(200,snapshot(3)));await reading;
  assert.equal(api.getCurrentUser().id,7);
});
test('failed logout leaves session visible rather than claiming success', async () => {
  let fail=false;
  const api=fixture(async()=>fail?response(503,{message:'Unavailable'}):response(200,{state:snapshot(),user:snapshot().users[0]}));
  await api.login('student','secret');fail=true;
  assert.equal((await api.logout()).ok,false);assert.equal(api.getCurrentUser().id,3);
});

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test('late unauthorized read from old session cannot clear a fresh login', async () => {
  const oldRead = deferred();
  const readStarted = deferred();
  const api = fixture(async path => {
    if (path.endsWith('/state')) { readStarted.resolve(); return oldRead.promise; }
    return response(200, { ok: true, state: snapshot(7), user: snapshot(7).users[0] });
  });
  const reading = api.refreshBackendState();
  await readStarted.promise;
  assert.equal((await api.login('new-student', 'secret')).ok, true);
  oldRead.resolve(response(401, { message: 'Old session expired' }));
  await reading;
  assert.equal(api.getCurrentUser().id, 7);
  assert.equal(api.useBackendState().connectionStatus, 'ready');
});

test('in-flight command cannot resurrect a logged out session', async () => {
  const oldCommand = deferred();
  const commandStarted = deferred();
  const api = fixture(async path => {
    if (path.endsWith('/commands')) { commandStarted.resolve(); return oldCommand.promise; }
    if (path.endsWith('/auth/logout')) return response(200, { ok: true });
    return response(200, { ok: true, state: snapshot(), user: snapshot().users[0] });
  });
  await api.login('student', 'secret');
  const writing = api.submitAchievement(3, { name: 'Old action' });
  await commandStarted.promise;
  assert.equal((await api.logout()).ok, true);
  oldCommand.resolve(response(200, { ok: true, state: snapshot() }));
  assert.equal((await writing).ok, false);
  assert.equal(api.getCurrentUser(), null);
});

test('old commands and queued writes never run as a different logged in user', async () => {
  const oldCommand = deferred();
  const commandStarted = deferred();
  let calls = 0;
  const api = fixture(async (path, init) => {
    if (path.endsWith('/commands')) { calls++; commandStarted.resolve(); return oldCommand.promise; }
    if (path.endsWith('/auth/logout')) return response(200, { ok: true });
    const id = JSON.parse(init.body).login === 'new-student' ? 7 : 3;
    return response(200, { ok: true, state: snapshot(id), user: snapshot(id).users[0] });
  });
  await api.login('student', 'secret');
  const writing = api.submitAchievement(3, { name: 'Old action' });
  await commandStarted.promise;
  const queued = api.submitAchievement(3, { name: 'Queued old action' });
  await api.logout();
  await api.login('new-student', 'secret');
  oldCommand.resolve(response(200, { ok: true, state: snapshot() }));
  assert.equal((await writing).ok, false);
  assert.equal((await queued).ok, false);
  assert.equal(calls, 1, 'queued command must be rejected before reaching the server');
  assert.equal(api.getCurrentUser().id, 7);
});

test('read started during write cannot roll back the committed snapshot', async () => {
  const writeResponse = deferred();
  const readResponse = deferred();
  const writeStarted = deferred();
  const readStarted = deferred();
  const api = fixture(async path => {
    if (path.endsWith('/commands')) { writeStarted.resolve(); return writeResponse.promise; }
    if (path.endsWith('/state')) { readStarted.resolve(); return readResponse.promise; }
    return response(200, { ok: true, state: snapshot(), user: snapshot().users[0] });
  });
  await api.login('student', 'secret');
  const writing = api.submitAchievement(3, { name: 'New award' });
  await writeStarted.promise;
  const reading = api.refreshBackendState();
  await readStarted.promise;
  writeResponse.resolve(response(200, { ok: true, state: { ...snapshot(), achievements: [{ id: 99, achievementName: 'New award' }] } }));
  assert.equal((await writing).ok, true);
  readResponse.resolve(response(200, snapshot()));
  await reading;
  assert.equal(api.useBackendState().achievements.length, 1);
  assert.equal(api.useBackendState().achievements[0].id, 99);
});

test('successful HTTP with invalid snapshot does not create a session', async () => {
  const api = fixture(async () => response(200, { ok: true }));
  const result = await api.login('student', 'secret');
  assert.equal(result.ok, false);
  assert.equal(api.getCurrentUser(), null);
});
