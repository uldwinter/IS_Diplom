import { PGlite } from '@electric-sql/pglite';

// PGlite provides one PostgreSQL connection. Queue statements behind a checked-out
// transaction the same way a pg Pool with max=1 would.
export async function createTestPool(dataDir) {
  const database = new PGlite(dataDir);
  await database.waitReady;
  let queue = Promise.resolve();

  async function query(sql, values) {
    if (!values && !/^\s*(select|insert|update|delete)\b/i.test(sql)) {
      const results = await database.exec(sql);
      return normalize(results.at(-1));
    }
    return normalize(await database.query(sql, values));
  }
  function normalize(result) {
    const rows = result?.rows ?? [];
    return { rows, rowCount: rows.length || result?.affectedRows || 0 };
  }
  async function connect() {
    const pending = queue;
    let release;
    queue = new Promise((resolve) => {
      release = resolve;
    });
    await pending;
    return { query, release };
  }
  return {
    database,
    connect,
    async query(sql, values) {
      const connection = await connect();
      try {
        return await connection.query(sql, values);
      } finally {
        connection.release();
      }
    },
    async end() {
      await queue;
      await database.close();
    },
  };
}
