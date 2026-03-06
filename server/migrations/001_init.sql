-- PostgreSQL bootstrap migration
create table if not exists users (
  id bigserial primary key,
  login varchar(100) unique not null,
  password_hash text not null,
  name varchar(255) not null,
  email varchar(255),
  role varchar(20) not null check (role in ('admin','curator','student')),
  status varchar(20) not null default 'active' check (status in ('active','inactive')),
  class_name varchar(20),
  failed_login_attempts int not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists refresh_sessions (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  refresh_token_hash text not null,
  device text,
  ip_address inet,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  actor_user_id bigint references users(id),
  action varchar(120) not null,
  entity varchar(120) not null,
  details text,
  device text,
  ip_address inet,
  created_at timestamptz not null default now()
);

create table if not exists registrations (
  id bigserial primary key,
  last_name varchar(120) not null,
  first_name varchar(120) not null,
  middle_name varchar(120) not null,
  email varchar(255) not null,
  class_name varchar(20) not null,
  login varchar(120) not null,
  password_hash text not null,
  status varchar(20) not null default 'pending' check (status in ('pending','approved','rejected')),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists achievements (
  id bigserial primary key,
  student_user_id bigint not null references users(id) on delete cascade,
  title varchar(255) not null,
  category varchar(120) not null,
  level varchar(120),
  result varchar(255),
  points int not null,
  status varchar(20) not null default 'pending' check (status in ('pending','approved','rejected')),
  moderator_comment text,
  event_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_achievements_student on achievements(student_user_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);
