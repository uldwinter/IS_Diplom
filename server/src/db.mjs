import 'dotenv/config';
import pg from 'pg';
export function createPool(env = process.env) {
  if (env.NODE_ENV === 'production' && !env.DATABASE_URL && !env.DB_PASSWORD)
    throw new Error(
      'Set DATABASE_URL or DB_PASSWORD before production startup',
    );
  return new pg.Pool(
    env.DATABASE_URL
      ? {
          connectionString: env.DATABASE_URL,
          ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
        }
      : {
          host: env.DB_HOST || 'localhost',
          port: Number(env.DB_PORT || 5432),
          user: env.DB_USER || 'postgres',
          password: env.DB_PASSWORD || 'postgres',
          database: env.DB_NAME || 'gifted_children',
        },
  );
}
