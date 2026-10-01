-- ============================================================
-- AI Personal Tutor — initial schema
-- ============================================================
create extension if not exists "pgcrypto";

-- ---------- identity ----------
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text check (role in ('student','parent')) not null,
  created_at timestamptz default now()
);

create table parents (
  id uuid primary key references users(id) on delete cascade,
  display_name text
);

create table students (
  id uuid primary key references users(id) on delete cascade,
  parent_id uuid references parents(id) on delete set null,
  display_name text not null,
  age int,
  grade int,
  country text,
  goals text,
  onboarded boolean default false,
  created_at timestamptz default now()
);

-- ---------- curriculum ----------
create table subjects (
  id text primary key,
  name text not null
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  subject_id text references subjects(id) on delete cascade,
  name text not null,
  slug text not null,
  parent_topic_id uuid references topics(id) on delete cascade,
  unique (subject_id, slug)
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  name text not null,
  description text,
  order_index int default 0
);

-- ---------- learning ----------
create table student_profiles (
  student_id uuid primary key references students(id) on delete cascade,
  learning_style jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table learning_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  subject_id text references subjects(id),
  topic_id uuid references topics(id),
  kind text check (kind in ('diagnostic','practice')) default 'practice',
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references learning_sessions(id) on delete cascade,
  skill_id uuid references skills(id),
  prompt text not null,
  answer text not null,
  difficulty int check (difficulty between 1 and 5) default 2,
  source text default 'ai',
  created_at timestamptz default now()
);

create table student_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  answer text not null,
  is_correct boolean,
  time_taken_ms int,
  hints_used int default 0,
  created_at timestamptz default now()
);

create table misconceptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  description text not null,
  confidence numeric check (confidence between 0 and 1) default 0.5,
  resolved boolean default false,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  unique (student_id, skill_id, description)
);

create table skill_progress (
  student_id uuid references students(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  mastery numeric check (mastery between 0 and 1) default 0,
  attempts int default 0,
  correct int default 0,
  updated_at timestamptz default now(),
  primary key (student_id, skill_id)
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  reason text,
  dismissed boolean default false,
  created_at timestamptz default now()
);

-- ---------- indexes ----------
-- Matched to the actual query patterns in app/ and lib/tutor/.
create index on learning_sessions (student_id, started_at desc);
create index on learning_sessions (student_id, topic_id) where ended_at is null;
create index on learning_sessions (topic_id);
create index on questions (session_id);
create index on questions (skill_id);
create index on student_answers (student_id, created_at desc);
create index on student_answers (student_id, question_id);
create index on misconceptions (student_id, resolved);
create index on recommendations (student_id, dismissed);
create index on recommendations (student_id, created_at desc);
create index on students (parent_id);
create index on skills (topic_id, order_index);
create index on topics (subject_id, name);

-- ============================================================
-- Auto-create app-level user row on Supabase auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'student'))
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data->>'role', 'student') = 'parent' then
    insert into public.parents (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table users               enable row level security;
alter table parents             enable row level security;
alter table students            enable row level security;
alter table student_profiles    enable row level security;
alter table learning_sessions   enable row level security;
alter table questions           enable row level security;
alter table student_answers     enable row level security;
alter table misconceptions      enable row level security;
alter table skill_progress      enable row level security;
alter table recommendations     enable row level security;
-- subjects/topics/skills are public read
alter table subjects            enable row level security;
alter table topics              enable row level security;
alter table skills              enable row level security;

-- users: read/update self
create policy "users read self" on users for select using (id = auth.uid());
create policy "users update self" on users for update using (id = auth.uid());

-- parents: self
create policy "parent self" on parents for all using (id = auth.uid()) with check (id = auth.uid());

-- helper: is the current user the parent of this student?
create or replace function public.is_parent_of(s uuid)
returns boolean language sql stable as $$
  select exists (select 1 from students where id = s and parent_id = auth.uid())
$$;

-- students
create policy "student self" on students for all using (id = auth.uid()) with check (id = auth.uid());
create policy "parent reads child" on students for select using (parent_id = auth.uid());

-- student-scoped tables: owner OR parent
create policy "sp_owner" on student_profiles for all
  using (student_id = auth.uid() or public.is_parent_of(student_id))
  with check (student_id = auth.uid());

create policy "ls_owner" on learning_sessions for all
  using (student_id = auth.uid() or public.is_parent_of(student_id))
  with check (student_id = auth.uid());

create policy "q_owner" on questions for all
  using (exists (select 1 from learning_sessions ls where ls.id = session_id and (ls.student_id = auth.uid() or public.is_parent_of(ls.student_id))))
  with check (exists (select 1 from learning_sessions ls where ls.id = session_id and ls.student_id = auth.uid()));

create policy "sa_owner" on student_answers for all
  using (student_id = auth.uid() or public.is_parent_of(student_id))
  with check (student_id = auth.uid());

create policy "mc_owner" on misconceptions for all
  using (student_id = auth.uid() or public.is_parent_of(student_id))
  with check (student_id = auth.uid());

create policy "skp_owner" on skill_progress for all
  using (student_id = auth.uid() or public.is_parent_of(student_id))
  with check (student_id = auth.uid());

create policy "rec_owner" on recommendations for all
  using (student_id = auth.uid() or public.is_parent_of(student_id))
  with check (student_id = auth.uid());

-- curriculum: public read
create policy "subjects read" on subjects for select using (true);
create policy "topics read"   on topics   for select using (true);
create policy "skills read"   on skills   for select using (true);

-- parent can link a pre-existing student by email
create policy "parent links child" on students for update
  using (parent_id is null) with check (parent_id = auth.uid());