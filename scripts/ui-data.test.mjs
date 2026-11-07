import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStudentCsv } from '../src/app/components/admin/studentCsv.ts';

test('student import preserves quoted delimiters, quotes and CRLF names', () => {
  const rows = parseStudentCsv('\uFEFFname;email;login;password;class\r\n"Иванов; Иван ""И.""";ivan@example.com;ivan;testpassword;10-1\r\n');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Иванов; Иван "И."');
  assert.equal(rows[0].class, '10-1');
});

test('comma-delimited import supports multiline quoted names without splitting records', () => {
  const rows = parseStudentCsv('name,email,login,password,class\n"Иванов\nИван",ivan@example.com,ivan,testpassword,10-1');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Иванов\nИван');
});

test('incomplete or ambiguous CSV is rejected before any write', () => {
  for (const content of [
    'name;email;login;class\nИван;ivan@example.com;ivan;10-1',
    'name;email;login;password;class;class\nИван;ivan@example.com;ivan;testpassword;10-1;10-1',
    'name;email;login;password;class\nИван;ivan@example.com;ivan;testpassword',
    'name;email;login;password;class\n"Иван;ivan@example.com;ivan;testpassword;10-1',
    'name;email;login;password;class\nИван;ivan@example.com;ivan;x;10-1',
  ]) assert.throws(() => parseStudentCsv(content));
});

test('oversized import does not silently truncate student records', () => {
  const content = 'name;email;login;password;class\n' + Array.from({ length: 101 }, (_, i) => `Ученик ${i};s${i}@example.com;s${i};testpassword;10-1`).join('\n');
  assert.throws(() => parseStudentCsv(content), /100/);
});
