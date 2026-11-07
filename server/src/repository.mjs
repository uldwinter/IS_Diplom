import { emptyState } from './domain.mjs';

function toDocument(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: Number(row.owner_id),
    name: row.name,
    mime: row.mime,
    content: Buffer.from(row.content),
    createdAt: row.created_at,
  };
}

async function insertDocument(client, document) {
  await client.query(
    'insert into application_documents (id, owner_id, name, mime, content) values ($1, $2, $3, $4, $5)',
    [
      document.id,
      document.ownerId,
      document.name,
      document.mime,
      document.content,
    ],
  );
}

async function lookupSession(client, hash) {
  const result = await client.query(
    'select user_id from application_sessions where token_hash = $1 and expires_at > now()',
    [hash],
  );
  return result.rowCount ? { userId: Number(result.rows[0].user_id) } : null;
}

export class PostgresRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async health() {
    await this.read();
  }

  async read() {
    const result = await this.pool.query(
      'select data from application_state where id = 1',
    );
    if (!result.rowCount)
      throw new Error('Run npm run migrate before starting the API');
    return result.rows[0].data;
  }

  async readSession(hash) {
    const result = await this.pool.query(
      `select sessions.user_id, state.data
       from application_sessions as sessions
       cross join application_state as state
       where sessions.token_hash = $1 and sessions.expires_at > now() and state.id = 1`,
      [hash],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return { userId: Number(row.user_id), state: row.data };
  }

  async withState(mutate) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const result = await client.query(
        'select data from application_state where id = 1 for update',
      );
      if (!result.rowCount)
        throw new Error('Run npm run migrate before starting the API');
      const state = result.rows[0].data;
      const context = {
        getSession: (hash) => lookupSession(client, hash),
        createSession: async (hash, userId, expiresAt) => {
          await client.query(
            'delete from application_sessions where expires_at <= now()',
          );
          await client.query(
            'insert into application_sessions (token_hash, user_id, expires_at) values ($1, $2, $3)',
            [hash, userId, expiresAt],
          );
        },
        deleteSession: async (hash) => {
          await client.query(
            'delete from application_sessions where token_hash = $1',
            [hash],
          );
        },
        revokeUserSessions: async (userId) => {
          await client.query(
            'delete from application_sessions where user_id = $1',
            [userId],
          );
        },
        revokeAllSessions: async () => {
          await client.query('delete from application_sessions');
        },
        getDocument: async (id) =>
          toDocument(
            (
              await client.query(
                'select * from application_documents where id = $1',
                [id],
              )
            ).rows[0],
          ),
        putDocument: (document) => insertDocument(client, document),
        getDocuments: async () =>
          (await client.query('select * from application_documents')).rows.map(
            toDocument,
          ),
        replaceDocuments: async (documents) => {
          await client.query('delete from application_documents');
          for (const document of documents)
            await insertDocument(client, document);
        },
      };
      const response = await mutate(state, context);
      await client.query(
        'update application_state set data = $1, revision = revision + 1, updated_at = now() where id = 1',
        [JSON.stringify(state)],
      );
      await client.query('commit');
      return response;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async getDocument(id) {
    return toDocument(
      (
        await this.pool.query(
          'select * from application_documents where id = $1',
          [id],
        )
      ).rows[0],
    );
  }
}

// The behavior tests use a serialized transaction model with rollback.
export class MemoryRepository {
  constructor(state = emptyState()) {
    this.state = structuredClone(state);
    this.documents = new Map();
    this.sessions = new Map();
    this.queue = Promise.resolve();
  }

  async health() {}

  async read() {
    return structuredClone(this.state);
  }

  async readSession(hash) {
    const session = this.sessions.get(hash);
    return session && Date.parse(session.expiresAt) > Date.now()
      ? { userId: session.userId, state: structuredClone(this.state) }
      : null;
  }

  async withState(mutate) {
    const run = this.queue.then(async () => {
      const state = structuredClone(this.state);
      const documents = new Map(this.documents);
      const sessions = new Map(this.sessions);
      const context = {
        getSession: async (hash) => {
          const session = sessions.get(hash);
          return session && Date.parse(session.expiresAt) > Date.now()
            ? session
            : null;
        },
        createSession: async (hash, userId, expiresAt) =>
          sessions.set(hash, { userId, expiresAt }),
        deleteSession: async (hash) => sessions.delete(hash),
        revokeUserSessions: async (userId) => {
          for (const [hash, session] of sessions) {
            if (session.userId === userId) sessions.delete(hash);
          }
        },
        revokeAllSessions: async () => sessions.clear(),
        getDocument: async (id) => documents.get(id),
        putDocument: async (document) => documents.set(document.id, document),
        getDocuments: async () => Array.from(documents.values()),
        replaceDocuments: async (replacement) => {
          documents.clear();
          for (const document of replacement)
            documents.set(document.id, document);
        },
      };
      const response = await mutate(state, context);
      this.state = state;
      this.documents = documents;
      this.sessions = sessions;
      return response;
    });
    this.queue = run.catch(() => {});
    return run;
  }

  async getDocument(id) {
    return this.documents.get(id);
  }
}
