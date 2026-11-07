-- Legacy tables are retained intact. Import is one-time and performed by migrate.mjs.
create table if not exists application_state (
  id integer primary key check (id = 1),
  revision bigint not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists application_sessions (
  token_hash varchar(64) primary key,
  user_id bigint not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_application_sessions_user on application_sessions(user_id);
create table if not exists application_documents (
  id uuid primary key,
  owner_id bigint not null,
  name varchar(255) not null,
  mime varchar(100) not null,
  content bytea not null,
  created_at timestamptz not null default now()
);
