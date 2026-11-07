import { attachDatabasePool } from '@vercel/functions';
import { createApp } from '../server/src/app.mjs';
import { createPool } from '../server/src/db.mjs';
import { PostgresRepository } from '../server/src/repository.mjs';

// Express owns request parsing, including the binary document route.
export const config = { helpers: false };
let app;

function application() {
  if (app) return app;
  const preview = process.env.VERCEL_ENV === 'preview';
  const databaseUrl = preview ? process.env.PREVIEW_DATABASE_URL : process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error(preview ? 'Set PREVIEW_DATABASE_URL for the isolated preview database' : 'Set DATABASE_URL');
  if (preview && databaseUrl === process.env.DATABASE_URL) throw new Error('Preview database must be isolated');
  const appOrigin = preview && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.APP_ORIGIN;
  if (!appOrigin) throw new Error('Set APP_ORIGIN');
  const pool = createPool({ ...process.env, DATABASE_URL: databaseUrl });
  attachDatabasePool(pool);
  app = createApp({ repository: new PostgresRepository(pool), production: true, appOrigin });
  return app;
}

export default function handler(request, response) {
  const url = new URL(request.url, 'http://localhost');
  if (!url.pathname.startsWith('/api/v1/') && url.pathname !== '/health') {
    const path = url.searchParams.get('__api_path');
    if (path && /^[a-zA-Z0-9/-]+$/.test(path)) request.url = path === 'health' ? '/health' : `/api/v1/${path}`;
  } else if (url.pathname === '/api/v1/health') request.url = '/health';
  try {
    application()(request, response);
  } catch (error) {
    console.error('API configuration:', error.message);
    response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ok: false, message: 'Серверная база ещё не настроена для этой публикации' }));
  }
}
