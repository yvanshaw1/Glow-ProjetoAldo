-- Login attempts without races between simultaneous requests (issue #23,
-- decision 0047). Rules of the lock: docs/acesso/dados.md (RS006).
-- The limit and the duration come from the server (src/server/auth/login-attempts.ts).


-- Reserves one login attempt for the e-mail before the password is checked.
-- Returns the seconds left in the lock, without counting the attempt, or null
-- when the password may be checked; the attempt that reaches the limit starts
-- the lock. The row lock makes simultaneous reservations wait for each other,
-- so the count never goes past the limit.
create function public.reserve_login_attempt(
  p_email text, p_max_attempts integer, p_lock_seconds integer
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_attempt public.login_attempts;
  v_count integer;
begin
  insert into public.login_attempts (email) values (p_email)
    on conflict (email) do nothing;

  select * into v_attempt from public.login_attempts
    where email = p_email
    for update;

  -- During the lock, attempts neither count nor extend it.
  if v_attempt.locked_until > now() then
    return ceil(extract(epoch from v_attempt.locked_until - now()))::integer;
  end if;

  -- Once a lock is over, the count starts again.
  v_count := case when v_attempt.locked_until is null
    then v_attempt.failed_count else 0 end + 1;

  update public.login_attempts
    set failed_count = v_count,
        locked_until = case when v_count >= p_max_attempts
          then now() + make_interval(secs => p_lock_seconds) end
    where email = p_email;

  return null;
end;
$$;

-- Gives back an attempt whose password was not checked, because Supabase Auth
-- did not answer. Since the count never goes past the limit, a lock in place
-- was started by this attempt and ends with it.
create function public.release_login_attempt(p_email text)
returns void
language sql
set search_path = ''
as $$
  update public.login_attempts
    set failed_count = greatest(failed_count - 1, 0), locked_until = null
    where email = p_email;
$$;


-- Only the backend calls them, with the service key (decision 0042). The
-- default privileges of the initial migration cover anon and authenticated,
-- not public, which every role belongs to.

revoke all on function public.reserve_login_attempt(text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.release_login_attempt(text)
  from public, anon, authenticated;

grant execute on function public.reserve_login_attempt(text, integer, integer)
  to service_role;
grant execute on function public.release_login_attempt(text) to service_role;
