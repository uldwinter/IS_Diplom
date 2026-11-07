/** RFC-style quoted CSV cells, with comma or semicolon delimiter and optional BOM. */
export function parseStudentCsv(text: string): Array<Record<string, string>> {
  const content = text.replace(/^\uFEFF/, '');
  const delimiter = content.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (quoted && content[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted;
    } else if (ch === delimiter && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && content[i + 1] === '\n') i++;
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (quoted) throw new Error('Незакрытая кавычка в CSV');
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift()?.map(header => header.toLowerCase());
  const required = ['name', 'email', 'login', 'password', 'class'];
  if (!headers || required.some(header => !headers.includes(header)) || new Set(headers).size !== headers.length) {
    throw new Error('Нужны уникальные заголовки name;email;login;password;class');
  }
  if (!rows.length || rows.length > 100) throw new Error('В одном импорте должно быть от 1 до 100 учеников');
  return rows.map((cells, index) => {
    if (cells.length !== headers.length) throw new Error(`Неверное число столбцов в строке ${index + 2}`);
    const record = Object.fromEntries(headers.map((header, i) => [header, cells[i]]));
    if (required.some(header => !record[header])) throw new Error(`Заполните все поля в строке ${index + 2}`);
    if (record.password.length < 8) throw new Error(`Пароль в строке ${index + 2} короче 8 символов`);
    return record;
  });
}

