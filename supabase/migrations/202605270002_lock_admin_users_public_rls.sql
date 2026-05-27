-- Keep admin identity checks usable after login, but never expose admin_users to anon clients.

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    nullif((current_setting('request.jwt.claims', true)::jsonb ->> 'email'), '')
  );
$$;

create or replace function public.is_admin_request()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin
    where lower(admin.email) = lower(public.current_auth_email())
      and admin.role in ('admin', 'super_admin')
  );
$$;

alter table public.admin_users enable row level security;
alter table public.admin_users replica identity full;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_users'
  loop
    execute format('drop policy if exists %I on public.admin_users', policy_name);
  end loop;
end $$;

create policy "Authenticated admins can read admin_users"
on public.admin_users
for select
to authenticated
using (public.is_admin_request());

create policy "Authenticated admins can insert admin_users"
on public.admin_users
for insert
to authenticated
with check (public.is_admin_request());

create policy "Authenticated admins can update admin_users"
on public.admin_users
for update
to authenticated
using (public.is_admin_request())
with check (public.is_admin_request());

create policy "Authenticated admins can delete admin_users"
on public.admin_users
for delete
to authenticated
using (public.is_admin_request());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'admin_users'
  ) then
    alter publication supabase_realtime add table public.admin_users;
  end if;
end $$;
