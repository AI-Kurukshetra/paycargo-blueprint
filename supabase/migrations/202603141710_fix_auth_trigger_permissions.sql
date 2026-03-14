begin;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

alter function public.create_profile_for_new_user() owner to postgres;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.create_profile_for_new_user() to supabase_auth_admin;

revoke execute on function public.create_profile_for_new_user() from public;
revoke execute on function public.create_profile_for_new_user() from anon;
revoke execute on function public.create_profile_for_new_user() from authenticated;

commit;
