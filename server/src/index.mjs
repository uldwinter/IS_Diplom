import 'dotenv/config';
import { createPool } from './db.mjs';
import { PostgresRepository } from './repository.mjs';
import { createApp } from './app.mjs';
const pool = createPool();
const app = createApp({ repository: new PostgresRepository(pool) });
const server = app.listen(Number(process.env.PORT || 8080), () =>
  console.log('Achievement API ready'),
);
process.on('SIGTERM', () =>
  server.close(() => pool.end().finally(() => process.exit(0))),
);
