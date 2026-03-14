create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_memberships
  where user_id = auth.uid()
  order by is_primary desc, created_at asc
  limit 1;
$$;
