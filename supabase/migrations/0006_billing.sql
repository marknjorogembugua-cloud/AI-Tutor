-- ============================================================
-- AI Personal Tutor — billing and usage metering
--
-- Two concerns:
--   subscriptions  — mirrors Stripe state so entitlements can be read
--                     without calling Stripe on every request.
--   usage_counters  — daily question allowance per learner.
--
-- The free-tier limit is enforced by consume_question_quota(), a
-- SECURITY DEFINER function, because checking-then-incrementing from
-- application code races: two concurrent requests would both read
-- "4 of 5 used" and both consume the fifth slot. The row lock inside
-- the function makes the read-modify-write atomic.
-- ============================================================

create table subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text check (plan in ('free','family')) not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table usage_counters (
  user_id uuid not null references public.users(id) on delete cascade,
  day date not null default current_date,
  questions int not null default 0,
  primary key (user_id, day)
);

-- Cheap reads: "how much did this learner use today".
create index usage_counters_day_idx on usage_counters (day);

alter table subscriptions   enable row level security;
alter table usage_counters  enable row level security;

-- A learner may read their own subscription (to render plan state).
-- There is deliberately no write policy: only the service role writes these.
create policy "subscription read self" on subscriptions
  for select using (user_id = auth.uid());

-- usage_counters has RLS on and no policies at all, so the browser client can
-- never read or write it. All access goes through the SECURITY DEFINER function
-- below, which validates the caller.

create or replace function public.consume_question_quota(p_user uuid, p_limit int)
returns table (allowed boolean, used int, remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := current_date;
  v_used int := 0;
begin
  -- Service-role callers arrive without a JWT (auth.uid() is null) and are
  -- trusted. A signed-in learner may only spend their own allowance.
  if auth.uid() is not null and auth.uid() <> p_user then
    raise exception 'not allowed to meter this user';
  end if;

  insert into usage_counters (user_id, day, questions)
  values (p_user, v_day, 0)
  on conflict (user_id, day) do nothing;

  -- Serialise concurrent callers on this learner's row for today.
  select questions into v_used
  from usage_counters
  where user_id = p_user and day = v_day
  for update;

  if v_used >= p_limit then
    return query select false, v_used, 0;
    return;
  end if;

  update usage_counters
  set questions = questions + 1
  where user_id = p_user and day = v_day;

  select questions into v_used
  from usage_counters
  where user_id = p_user and day = v_day;

  return query select true, v_used, greatest(p_limit - v_used, 0);
end;
$$;

revoke all on function public.consume_question_quota(uuid, int) from public;
grant execute on function public.consume_question_quota(uuid, int) to authenticated, service_role;

-- Entitlements live in one place so plan names cannot drift between the
-- pricing page, the API and the database.
create or replace function public.sync_subscription(
  p_user uuid,
  p_customer text,
  p_subscription text,
  p_price text,
  p_plan text,
  p_status text,
  p_period_end timestamptz,
  p_cancel_at_period_end boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user is null then
    raise exception 'p_user required';
  end if;

  insert into subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
    plan, status, current_period_end, cancel_at_period_end, updated_at
  )
  values (
    p_user, p_customer, p_subscription, p_price,
    coalesce(nullif(p_plan, ''), 'free'), coalesce(nullif(p_status, ''), 'active'),
    p_period_end, coalesce(p_cancel_at_period_end, false), now()
  )
  on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id,
    plan = excluded.plan,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    updated_at = now();
end;
$$;

revoke all on function public.sync_subscription(uuid, text, text, text, text, text, timestamptz, boolean) from public;
grant execute on function public.sync_subscription(uuid, text, text, text, text, text, timestamptz, boolean) to service_role;