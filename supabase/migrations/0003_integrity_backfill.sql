-- ============================================================
-- AI Personal Tutor — integrity backfill
--
-- 1. public.users had no FK to auth.users, so deleting an auth user
--    left an orphaned application row behind.
-- 2. Users who signed up before the on_auth_user_created trigger
--    existed never got an application row. Backfill them.
-- ============================================================

-- Remove any rows whose auth account is already gone.
delete from public.users u
where not exists (select 1 from auth.users a where a.id = u.id);

-- Link public.users to auth.users so deletes cascade.
alter table public.users
  drop constraint if exists users_id_fkey;
alter table public.users
  add constraint users_id_fkey foreign key (id)
  references auth.users(id) on delete cascade;

-- Backfill app rows for auth users created before the trigger existed.
insert into public.users (id, email, role)
select a.id,
       a.email,
       coalesce(a.raw_user_meta_data->>'role', 'student')
from auth.users a
on conflict (id) do nothing;

-- Parent rows for any backfilled parents.
insert into public.parents (id, display_name)
select a.id,
       coalesce(a.raw_user_meta_data->>'display_name', split_part(a.email, '@', 1))
from auth.users a
where coalesce(a.raw_user_meta_data->>'role', 'student') = 'parent'
on conflict (id) do nothing;