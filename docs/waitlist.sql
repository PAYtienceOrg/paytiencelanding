-- Run once in the Supabase SQL editor before setting the server environment.
begin;

create table public.waitlist_entries (
  email text primary key check (email = lower(btrim(email)) and length(email) <= 254),
  referral_code text not null unique check (referral_code ~ '^[a-z0-9]{8}$'),
  position integer not null check (position >= 1),
  constraint waitlist_entries_position_key unique (position) deferrable initially deferred
);

alter table public.waitlist_entries enable row level security;
revoke all on public.waitlist_entries from public, anon, authenticated;
grant select, insert, update on public.waitlist_entries to service_role;

create function public.join_waitlist(p_email text, p_referral_code text, p_ref text default null)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_entry public.waitlist_entries%rowtype;
  v_total integer;
  v_inviter integer;
  v_target integer;
begin
  -- Serialize signup and ranking changes across all application instances.
  lock table public.waitlist_entries in share row exclusive mode;
  select count(*) into v_total from public.waitlist_entries;
  select * into v_entry from public.waitlist_entries where email = p_email;
  if found then
    return jsonb_build_object(
      'created', false, 'position', v_entry.position,
      'referralCode', v_entry.referral_code, 'total', v_total
    );
  end if;

  -- Look up the inviter before insertion to exclude self-referrals.
  select position into v_inviter from public.waitlist_entries where referral_code = p_ref;
  insert into public.waitlist_entries (email, referral_code, position)
    values (p_email, p_referral_code, v_total + 1);

  if v_inviter > 1 then
    v_target := greatest(1, v_inviter - 5);
    update public.waitlist_entries set position = position + 1
      where position >= v_target and position < v_inviter;
    update public.waitlist_entries set position = v_target where referral_code = p_ref;
  end if;

  return jsonb_build_object(
    'created', true, 'position', v_total + 1,
    'referralCode', p_referral_code, 'total', v_total + 1
  );
end;
$$;

revoke all on function public.join_waitlist(text, text, text) from public, anon, authenticated;
grant execute on function public.join_waitlist(text, text, text) to service_role;
notify pgrst, 'reload schema';

commit;
