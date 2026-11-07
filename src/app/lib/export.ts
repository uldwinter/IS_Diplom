export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
export function csvCell(value: unknown): string {
  const text = String(value ?? '');
  // Quoting CSV fields alone does not prevent spreadsheet formula execution.
  const safe = typeof value === 'number' ? text : /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function toCsv(rows: unknown[][]): string { return rows.map((row) => row.map(csvCell).join(';')).join('\r\n'); }
export function tableHtml(headers: unknown[], rows: unknown[][]): string {
  return `<table><thead><tr>${headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
export function printableHtml(title: string, description: string, content: string): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>body{font:12pt Arial,sans-serif;margin:24px;color:#111}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #aaa;padding:7px;text-align:left}thead{display:table-header-group}tr{break-inside:avoid}h1{font-size:20pt}h2{font-size:15pt}p{line-height:1.4}@media print{body{margin:0}@page{margin:16mm}}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>${content}</body></html>`;
}
export function downloadText(content: string, filename: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  // Leave time for the browser to start consuming the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function printReport(html: string): boolean {
  const popup = window.open('', '_blank');
  if (!popup) return false;
  popup.opener = null;
  popup.document.open(); popup.document.write(html); popup.document.close();
  popup.focus();
  // The printable page stays available if printing is cancelled or asynchronous.
  popup.setTimeout(() => popup.print(), 100);
  return true;
}
