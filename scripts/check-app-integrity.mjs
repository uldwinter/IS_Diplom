import fs from 'fs';
import path from 'path';

const app = fs.readFileSync('src/app/App.tsx', 'utf8');
const studentAchievementsScreen = fs.readFileSync('src/app/components/StudentAchievementsScreen.tsx', 'utf8');
const root = process.cwd();

const criticalStateDecls = [
  'appState, setAppState',
  'userRole, setUserRole',
  'currentScreen, setCurrentScreen',
  'selectedStudentId, setSelectedStudentId',
];

for (const stateDecl of criticalStateDecls) {
  const escaped = stateDecl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = app.match(new RegExp(`const\\s*\\[\\s*${escaped}\\s*\\]\\s*=\\s*useState`, 'g')) ?? [];
  if (matches.length !== 1) {
    console.error(`App integrity check failed: expected exactly 1 state declaration for "${stateDecl}", found ${matches.length}`);
    process.exit(1);
  }
}

const resolvedCurrentUserMatches = app.match(/const resolvedCurrentUser = getCurrentUser\(\);/g) ?? [];
if (resolvedCurrentUserMatches.length > 1) {
  console.error(`App integrity check failed: duplicate resolvedCurrentUser declaration, found ${resolvedCurrentUserMatches.length}`);
  process.exit(1);
}

const deprecatedCurrentUserState = app.match(/const\s*\[\s*currentUser\s*,\s*setCurrentUser\s*\]\s*=\s*useState/g) ?? [];
if (deprecatedCurrentUserState.length > 0) {
  console.error('App integrity check failed: deprecated local currentUser state declaration detected. Use resolvedCurrentUser from store.');
  process.exit(1);
}

const conflictRegexes = [/^<{7}/m, /^={7}/m, /^>{7}/m];
const hasConflictMarkerInApp = conflictRegexes.some((re) => re.test(app));
if (hasConflictMarkerInApp) {
  console.error('App integrity check failed: merge conflict markers detected in src/app/App.tsx');
  process.exit(1);
}

const appContentMatches = app.match(/function AppContent\(/g) ?? [];
if (appContentMatches.length !== 1) {
  console.error(`App integrity check failed: expected exactly 1 AppContent function, found ${appContentMatches.length}`);
  process.exit(1);
}

const requiredAdminScreens = [
  /currentScreen === 'users'/,
  /currentScreen === 'audit-log'/,
];

for (const required of requiredAdminScreens) {
  if (!required.test(app)) {
    console.error(`App integrity check failed: missing admin route mapping for pattern ${required}`);
    process.exit(1);
  }
}

const deprecatedProjectsConst = studentAchievementsScreen.match(/const\s+projects\s*=/g) ?? [];
if (deprecatedProjectsConst.length > 0) {
  console.error('App integrity check failed: deprecated `const projects = ...` declaration detected in StudentAchievementsScreen. Use projectAchievements naming.');
  process.exit(1);
}

const walk = (dir, acc = []) => {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name === 'node_modules' || item.name === 'dist' || item.name === '.git') continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full, acc);
      continue;
    }
    if (!/\.(ts|tsx|js|mjs|json|yml|yaml|md|sql|sh)$/.test(item.name)) continue;
    acc.push(full);
  }
  return acc;
};

const files = walk(root);
const conflictFiles = files.filter((file) => {
  if (path.relative(root, file) === 'scripts/check-app-integrity.mjs') return false;
  const content = fs.readFileSync(file, 'utf8');
  return conflictRegexes.some((re) => re.test(content));
});

if (conflictFiles.length) {
  console.error('App integrity check failed: merge conflict markers found in files:');
  conflictFiles.forEach((f) => console.error(` - ${path.relative(root, f)}`));
  process.exit(1);
}

console.log('App integrity check passed');
