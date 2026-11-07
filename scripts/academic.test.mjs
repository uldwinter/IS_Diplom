import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAchievementDate, currentAcademicYear, academicYearForDate, availableAcademicYears, inAcademicPeriod, periodBounds, monthBuckets, rankStudents, studentClassForYear } from '../src/app/lib/academic.ts';
import { csvCell, toCsv, escapeHtml, tableHtml, printableHtml } from '../src/app/lib/export.ts';

test('academic year rolls over on September 1 and includes August 31', () => {
  assert.equal(currentAcademicYear(new Date(2026, 7, 31)), '2025-2026');
  assert.equal(currentAcademicYear(new Date(2026, 8, 1)), '2026-2027');
  assert.equal(inAcademicPeriod('2026-08-31', '2025-2026'), true);
  assert.equal(inAcademicPeriod('2026-09-01', '2025-2026'), false);
  assert.equal(inAcademicPeriod('2025-09-01', '2025-2026'), true);
});

test('date parser rejects rollover dates and accepts legacy and ISO dates consistently', () => {
  assert.equal(parseAchievementDate('31.02.2026'), null);
  assert.equal(parseAchievementDate('2025-02-29'), null);
  assert.equal(parseAchievementDate('2024-02-29')?.getDate(), 29);
  assert.equal(parseAchievementDate('not a date'), null);
  assert.equal(parseAchievementDate('01.09.2025')?.getTime(), parseAchievementDate('2025-09-01')?.getTime());
  assert.equal(academicYearForDate(parseAchievementDate('2025-12-31')), '2025-2026');
});

test('quarters are bounded by one selected academic year; summer is not fourth quarter', () => {
  assert.equal(inAcademicPeriod('2025-10-31', '2025-2026', 'q1'), true);
  assert.equal(inAcademicPeriod('2025-11-01', '2025-2026', 'q1'), false);
  assert.equal(inAcademicPeriod('2024-10-01', '2025-2026', 'q1'), false);
  assert.equal(inAcademicPeriod('2026-06-01', '2025-2026', 'q4'), false);
  assert.equal(inAcademicPeriod('2026-03-31', '2025-2026', 'q3'), true);
  assert.equal(inAcademicPeriod('2026-04-01', '2025-2026', 'q4'), true);
  assert.equal(inAcademicPeriod('2025-09-01', 'all', 'q1'), false);
  assert.equal(inAcademicPeriod('2025-09-01', 'all', 'all'), true);
  const custom = { q1: { start: [9, 1], end: [11, 2] } };
  assert.equal(periodBounds('2025-2026', 'q1', custom).end.getDate(), 2);
});

const students = [
  { id: 1, name: 'А', class: '10-1', classHistory: [{ class: '9-1', academicYear: '2025-2026' }] },
  { id: 2, name: 'Б', class: '10-1', classHistory: [{ class: '9-1', academicYear: '2025-2026' }] },
  { id: 3, name: 'Тарасов', class: '11-1', classHistory: [{ class: '10-1', academicYear: '2025-2026' }] },
];
const achievement = (studentUserId, expectedPoints, extras = {}) => ({ studentUserId, expectedPoints, category: 'Учебные достижения', status: 'approved', date: '2025-10-01', studentClass: studentUserId === 3 ? '10-1' : '9-1', ...extras });
const achievements = [achievement(1, 20), achievement(2, 20), achievement(3, 10), achievement(3, 1000, { status: 'pending' }), achievement(3, 100, { date: '2024-10-01' })];

test('rank is calculated before search with competition ties and confirmed points only', () => {
  const ranked = rankStudents(students, achievements, '2025-2026', 'all');
  assert.deepEqual(ranked.map((student) => student.rank), [1, 1, 3]);
  assert.equal(ranked.find((student) => student.name === 'Тарасов').totalPoints, 10);
  assert.equal(ranked.filter((student) => student.name.includes('Тарасов'))[0].rank, 3);
  assert.equal(rankStudents(students, achievements, '2025-2026', 'all', '10', '10-1')[0].rank, 1);
  assert.equal(rankStudents(students, achievements, 'all', 'all', '9', '9-1').length, 2);
});

test('historical class does not change when student moves up a grade', () => {
  assert.equal(studentClassForYear(students[0], achievements, '2025-2026'), '9-1');
  assert.equal(studentClassForYear({ id: 3, name: 'Тарасов', class: '11-1' }, achievements, '2025-2026'), '10-1');
  assert.equal(studentClassForYear({ id: 4, name: 'Новый', class: '10-1' }, achievements, '2001-2002'), '—');
});

test('reports can select roster-only years and omit graduates from the following year', () => {
  const transferred = { id: 5, name: 'Выпускник', class: '11-2', classHistory: [
    { class: '11-1', academicYear: '2025-2026' },
    { class: '11-2', academicYear: '2025-2026' },
    { class: '11-2', academicYear: '2026-2027', graduated: true },
  ] };
  assert.deepEqual(availableAcademicYears([], new Date(2026, 10, 7), [transferred]), ['2026-2027', '2025-2026']);
  assert.equal(studentClassForYear(transferred, [], '2025-2026'), '11-2');
  assert.equal(studentClassForYear(transferred, [], '2026-2027'), '—');
  assert.deepEqual(rankStudents([transferred], [], '2026-2027', 'all'), []);
});

test('year choices use event date and monthly series are chronological across January', () => {
  assert.deepEqual(availableAcademicYears([{ date: '2025-10-01' }], new Date(2026, 10, 6)), ['2026-2027', '2025-2026']);
  assert.deepEqual(monthBuckets('all', ['31.12.2025', '01.01.2026', '01.10.2025']).map((month) => month.key), ['2025-10', '2025-12', '2026-01']);
  const buckets = monthBuckets('2025-2026', []);
  assert.equal(buckets.length, 12);
  assert.equal(buckets[0].key, '2025-09');
  assert.equal(buckets[11].key, '2026-08');
  assert.deepEqual(monthBuckets('2025-2026', [], 'q1').map((month) => month.key), ['2025-09', '2025-10']);
});

test('exports escape untrusted HTML and prevent spreadsheet formulas', () => {
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell('\t@SUM(A1)'), '"\'\t@SUM(A1)"');
  assert.equal(csvCell(-10), '"-10"');
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.match(toCsv([['=HYPERLINK("url")']]), /^"'/);
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
  const html = printableHtml('<script>alert(1)</script>', '<img src=x>', tableHtml(['Name'], [['<svg onload=alert(1)>']]));
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('<svg'), false);
  assert.equal(html.includes('<img'), false);
});
