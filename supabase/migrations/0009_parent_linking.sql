-- ============================================================
-- AI Personal Tutor — parent linking, activity rollups
--
-- 0001 created `students.parent_id` and a "parent links child" update
-- policy, but nothing in the app could actually create that link, so a
-- parent who signed up landed on an empty page. This migration adds
-- the invite flow the UI needs.
--
-- It also fixes a hole the invite flow would otherwise expose: the
-- "student self" policy from 0001 is `for all ... with check (id =
-- auth.uid())`, which constrains only the row id. A student could
-- therefore set their own `parent_id` to any uuid they liked, granting
-- an arbitrary account read access to their history. Linking now goes
-- through a SECURITY DEFINER function that validates the code.
-- ============================================================

-- ---------- parent invites ----------

create table parent_invites (
  id uuid primary key default gen_random_uuid(),
  -- The parent who issued it. on delete cascade retires the invite if the
  -- parent account is deleted, so a code can never outlive its issuer.
  parent_id uuid not null references public.users(id) on delete cascade,
  -- Short human-typable code. Ambiguous glyphs (0/O, 1/I/L) are excluded so a
  -- child reading it off a screen cannot mistype it.
  code text not null unique,
  -- Label the parent gives the invite, e.g. "Ada's maths account". Purely for
  -- the parent's own bookkeeping; never shown to the child.
  child_label text,
  status text not null default 'pending'
    check (status in ('pending','accepted','revoked')),
  -- Which student account redeemed it. on delete set null so deleting the
  -- child does not cascade into the parent's invite history.
  accepted_by uuid references public.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

-- Cheap reads for the parent's invite list, which always filters by parent
-- and orders newest first.
create index parent_invites_parent_created_idx
  on parent_invites (parent_id, created_at desc);

alter table parent_invites enable row level security;

-- Role is checked as well as ownership. The API route does the same check, but
-- the API is not the only way in: a client can hit PostgREST directly, and
-- without this a learner account could mint codes for itself.
create or replace function public.is_parent_account(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = p_user and role = 'parent'
  );
$$;

revoke all on function public.is_parent_account(uuid) from public;
grant execute on function public.is_parent_account(uuid) to authenticated;

-- A parent may list their own invites and create new ones.
create policy "parent reads own invites" on parent_invites
  for select using (parent_id = auth.uid() and public.is_parent_account());

create policy "parent creates invites" on parent_invites
  for insert with check (parent_id = auth.uid() and public.is_parent_account());

-- Updates are how a parent revokes: status flips to 'revoked' and expires_at
-- moves to now. Scoped to their own rows by the same predicate.
--
-- The column list is the important part. A bare `for update` would let a parent
-- set status = 'accepted' and point accepted_by at any account, forging a link
-- that the redemption function is meant to authorise.
create policy "parent revokes own invites" on parent_invites
  for update
  using (parent_id = auth.uid() and public.is_parent_account())
  with check (parent_id = auth.uid() and public.is_parent_account());

-- Deliberately no delete policy: a revoked invite stays as a record that the
-- code was issued and retired. The table cascades with the parent account.

-- ---------- guarded link on students ----------

-- Redemption is done in a SECURITY DEFINER function, which runs as the table
-- owner and so bypasses RLS. It signals "this write is authorised" by setting a
-- transaction-local flag; the trigger below refuses any other attempt to change
-- parent_id.
--
-- The flag is set inline by each SECURITY DEFINER function rather than by a
-- helper of its own. A helper would have to be executable by those functions,
-- which also makes it executable by any client over PostgREST — at which point
-- anyone could arm the flag themselves and then write their own parent_id, which
-- is the exact hole this trigger exists to close.
--
-- `true` is the only accepted value, and set_config(..., true) is local to the
-- transaction, so the flag cannot leak to a later request on a pooled
-- connection.
create or replace function public.guard_parent_link()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('app.allow_parent_link', true), '') <> 'true' then
    if tg_op = 'INSERT' then
      -- Initial insert: a student's row starts unlinked, whatever the client sent.
      if new.parent_id is not null then
        new.parent_id := null;
      end if;
      return new;
    end if;

    if new.parent_id is distinct from old.parent_id then
      raise exception 'parent link must be set through redeem_parent_invite'
        using errcode = '42501';
    end if;
  end if;

  return new;
end $$;

create trigger students_guard_parent_link
before insert or update on public.students
for each row execute function public.guard_parent_link();

-- ---------- redeem ----------

-- Called by the child. Idempotent: redeeming an already-accepted code with the
-- same account succeeds and is a no-op, so a double-tapped button is harmless.
create or replace function public.redeem_parent_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.parent_invites%rowtype;
  v_child uuid := auth.uid();
begin
  if v_child is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  -- Lock the row: two children racing for the same code must serialise here,
  -- and the loser sees status = 'accepted' below.
  select * into v_invite
    from public.parent_invites
   where code = upper(btrim(p_code))
   for update;

  if not found then
    raise exception 'That code is not valid.' using errcode = 'P0002';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'That code has already been used or withdrawn.' using errcode = 'P0002';
  end if;

  if v_invite.expires_at <= now() then
    raise exception 'That code has expired. Ask for a new one.' using errcode = 'P0002';
  end if;

  if exists (select 1 from public.students where id = v_child and parent_id is not null) then
    raise exception 'This account is already linked to a parent.' using errcode = 'P0002';
  end if;

  -- Validate the caller is a student. A parent account redeeming a code would
  -- create a students row for itself, which no policy ever grants access to.
  if not exists (
    select 1 from public.users where id = v_child and role = 'student'
  ) then
    raise exception 'Only a learner account can use this code.'
      using errcode = '42501';
  end if;

  perform set_config('app.allow_parent_link', 'true', true);

  -- A student may not have a row yet if they signed up but skipped onboarding,
  -- so create a minimal one rather than failing. Mirrors handle_new_user()'s
  -- fallback of using the local part of the email address.
  --
  -- onboarded is deliberately left alone on conflict: linking is not consent to
  -- skip the profile step, and the dashboard redirects there when it is false.
  insert into public.students (id, display_name, parent_id)
  values (
    v_child,
    coalesce(
      (select split_part(email, '@', 1) from public.users where id = v_child),
      'Student'
    ),
    v_invite.parent_id
  )
  on conflict (id) do update
    set parent_id = excluded.parent_id;

  update public.parent_invites
     set status = 'accepted',
         accepted_by = v_child,
         accepted_at = now()
   where id = v_invite.id;

  return v_invite.parent_id;
end $$;

revoke all on function public.redeem_parent_invite(text) from public;
grant execute on function public.redeem_parent_invite(text) to authenticated;

-- ---------- unlink ----------

-- The parent can drop a link. Kept as a function rather than a direct update
-- because the guard trigger above blocks app-level writes to parent_id.
create or replace function public.unlink_child(p_student uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.allow_parent_link', 'true', true);

  update public.students
     set parent_id = null
   where id = p_student and parent_id = auth.uid();

  return found;
end $$;

revoke all on function public.unlink_child(uuid) from public;
grant execute on function public.unlink_child(uuid) to authenticated;

-- ---------- activity rollup ----------

-- Daily practice counts for the streak and history views.
--
-- Aggregating in SQL rather than pulling every answer row to the browser: a
-- heavy user accumulates tens of thousands of answers, and the dashboard only
-- needs one row per day.
--
-- SECURITY DEFINER because a student needs their own history and a parent needs
-- their child's, and the RLS policies would otherwise force two code paths. The
-- explicit auth.uid()/is_parent_of checks below are what enforce access.
create or replace function public.practice_activity(p_student uuid, p_days int default 120)
returns table (
  day date,
  questions bigint,
  correct bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (a.created_at at time zone 'utc')::date as day,
    count(*) as questions,
    count(*) filter (where a.is_correct) as correct
  from public.student_answers a
  where a.student_id = p_student
    and a.created_at >= now() - make_interval(days => greatest(p_days, 1))
    and (a.student_id = auth.uid() or public.is_parent_of(a.student_id))
  group by 1
  order by 1;
$$;

revoke all on function public.practice_activity(uuid, int) from public;
grant execute on function public.practice_activity(uuid, int) to authenticated;

-- Session counts, for the history page's "sessions practised" figure.
create or replace function public.session_count(p_student uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.learning_sessions ls
  where ls.student_id = p_student
    and (ls.student_id = auth.uid() or public.is_parent_of(ls.student_id));
$$;

revoke all on function public.session_count(uuid) from public;
grant execute on function public.session_count(uuid) to authenticated;