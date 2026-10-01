-- ============================================================
-- AI Personal Tutor — quota refund
--
-- consume_question_quota() reserves a slot before the paid AI call so two
-- concurrent requests can never both claim the last one. But if the provider
-- then fails (out of credits, timeout, moderation refusal), the learner was
-- never served and must not lose their allowance. This gives that slot back.
-- ============================================================

create or replace function public.release_question_quota(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int := 0;
begin
  if auth.uid() is not null and auth.uid() <> p_user then
    raise exception 'not allowed to meter this user';
  end if;

  update usage_counters
  set questions = greatest(questions - 1, 0)
  where user_id = p_user and day = current_date
  returning questions into v_used;

  return coalesce(v_used, 0);
end;
$$;

revoke all on function public.release_question_quota(uuid) from public;
grant execute on function public.release_question_quota(uuid) to authenticated, service_role;