import { getCurrentUser, getUserSettings } from '@/app/backend/store';

/** Display ISO dates without shifting date-only achievements across time zones. */
export function formatDate(value?: string, withTime = false): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) return value || '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  const user = getCurrentUser();
  const format = user && getUserSettings(user.id)?.dateFormat;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const displayed = format === 'yyyy-mm-dd' ? `${year}-${month}-${day}` : format === 'mm/dd/yyyy' ? `${month}/${day}/${year}` : `${day}.${month}.${year}`;
  return withTime && value.length > 10 ? `${displayed}, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : displayed;
}
