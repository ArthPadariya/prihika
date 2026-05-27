-- Admin authentication + RLS repair.
-- Fixes permission denied errors on admin_users and gives authenticated admins full CMS CRUD.

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  eyebrow text,
  title text not null,
  description text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  desktop_image_url text,
  mobile_image_url text,
  link_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.homepage_sections, public.homepage_banners to anon;
grant select, insert, update, delete on public.homepage_sections, public.homepage_banners to authenticated;

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

alter table public.admin_users add column if not exists user_id uuid;
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists name text;
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();
create unique index if not exists admin_users_email_key on public.admin_users(email);

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select au.role
  from public.admin_users au
  where lower(au.email) = public.current_auth_email()
  limit 1;
$$;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role(), '') in ('super_admin', 'admin');
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role(), '') = 'super_admin';
$$;

revoke all on function public.current_auth_email() from public;
revoke all on function public.current_admin_role() from public;
revoke all on function public.is_cms_admin() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.current_auth_email() to anon, authenticated;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.is_cms_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'homepage_sections',
    'homepage_banners',
    'admin_users',
    'products',
    'product_images',
    'product_faqs',
    'categories',
    'collections',
    'homepage_content',
    'homepage_sections',
    'homepage_hero',
    'homepage_categories',
    'homepage_collections',
    'homepage_featured_products',
    'homepage_promises',
    'homepage_reels',
    'homepage_banners',
    'banners',
    'homepage_testimonials',
    'testimonials',
    'newsletter_section',
    'site_settings',
    'featured_sections',
    'orders',
    'order_items',
    'coupons'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = current_table
    ) then
      execute format('alter table public.%I enable row level security', current_table);
      execute format('alter table public.%I replica identity full', current_table);
    end if;
  end loop;
end $$;

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'homepage_sections',
    'homepage_banners',
    'products',
    'product_images',
    'product_faqs',
    'categories',
    'collections',
    'homepage_content',
    'homepage_sections',
    'homepage_hero',
    'homepage_categories',
    'homepage_collections',
    'homepage_featured_products',
    'homepage_promises',
    'homepage_reels',
    'homepage_banners',
    'banners',
    'homepage_testimonials',
    'testimonials',
    'newsletter_section',
    'site_settings',
    'featured_sections'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = current_table
    ) then
      execute format('drop policy if exists "Public can read %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "Authenticated admins can manage %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "Authenticated can insert %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "Authenticated can update %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "Authenticated can delete %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "CMS admins can insert %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "CMS admins can update %1$s" on public.%1$I', current_table);
      execute format('drop policy if exists "CMS admins can delete %1$s" on public.%1$I', current_table);

      execute format('create policy "Public can read %1$s" on public.%1$I for select to anon, authenticated using (true)', current_table);
      execute format('create policy "CMS admins can insert %1$s" on public.%1$I for insert to authenticated with check (public.is_cms_admin())', current_table);
      execute format('create policy "CMS admins can update %1$s" on public.%1$I for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin())', current_table);
      execute format('create policy "CMS admins can delete %1$s" on public.%1$I for delete to authenticated using (public.is_cms_admin())', current_table);
    end if;
  end loop;
end $$;

drop policy if exists "Authenticated admins can read admin users" on public.admin_users;
drop policy if exists "Authenticated admins can manage admin users" on public.admin_users;
drop policy if exists "Authenticated can insert admin users" on public.admin_users;
drop policy if exists "Authenticated can update admin users" on public.admin_users;
drop policy if exists "Authenticated can delete admin users" on public.admin_users;
drop policy if exists "Admins can read admin users" on public.admin_users;
drop policy if exists "Super admins can insert admin users" on public.admin_users;
drop policy if exists "Super admins can update admin users" on public.admin_users;
drop policy if exists "Super admins can delete admin users" on public.admin_users;

create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (
  lower(email) = public.current_auth_email()
  or public.is_cms_admin()
);

create policy "Super admins can insert admin users"
on public.admin_users
for insert
to authenticated
with check (public.is_super_admin());

create policy "Super admins can update admin users"
on public.admin_users
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "Super admins can delete admin users"
on public.admin_users
for delete
to authenticated
using (public.is_super_admin());

insert into public.admin_users (user_id, email, name, role)
select
  auth_user.id,
  lower(auth_user.email),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    split_part(auth_user.email, '@', 1)
  ),
  'super_admin'
from auth.users auth_user
where auth_user.email is not null
  and not exists (
    select 1
    from public.admin_users existing_admin
    where existing_admin.role in ('super_admin', 'admin')
  )
on conflict (email) do update
set
  user_id = coalesce(public.admin_users.user_id, excluded.user_id),
  name = coalesce(public.admin_users.name, excluded.name),
  role = case
    when public.admin_users.role in ('super_admin', 'admin') then public.admin_users.role
    else excluded.role
  end,
  updated_at = now();

drop policy if exists "Authenticated admins can read orders" on public.orders;
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Authenticated admins can update orders" on public.orders;
drop policy if exists "Authenticated can delete orders" on public.orders;
drop policy if exists "CMS admins can read orders" on public.orders;
drop policy if exists "CMS admins can update orders" on public.orders;
drop policy if exists "CMS admins can delete orders" on public.orders;

create policy "CMS admins can read orders"
on public.orders for select
to authenticated
using (public.is_cms_admin());

create policy "Anyone can create orders"
on public.orders for insert
to anon, authenticated
with check (true);

create policy "CMS admins can update orders"
on public.orders for update
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can delete orders"
on public.orders for delete
to authenticated
using (public.is_cms_admin());

drop policy if exists "Authenticated admins can read order items" on public.order_items;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Authenticated admins can update order items" on public.order_items;
drop policy if exists "Authenticated admins can delete order items" on public.order_items;
drop policy if exists "CMS admins can read order items" on public.order_items;
drop policy if exists "CMS admins can update order items" on public.order_items;
drop policy if exists "CMS admins can delete order items" on public.order_items;

create policy "CMS admins can read order items"
on public.order_items for select
to authenticated
using (public.is_cms_admin());

create policy "Anyone can create order items"
on public.order_items for insert
to anon, authenticated
with check (true);

create policy "CMS admins can update order items"
on public.order_items for update
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can delete order items"
on public.order_items for delete
to authenticated
using (public.is_cms_admin());

drop policy if exists "Authenticated admins can read coupons" on public.coupons;
drop policy if exists "Authenticated admins can manage coupons" on public.coupons;
drop policy if exists "Authenticated can insert coupons" on public.coupons;
drop policy if exists "Authenticated can update coupons" on public.coupons;
drop policy if exists "Authenticated can delete coupons" on public.coupons;
drop policy if exists "CMS admins can read coupons" on public.coupons;
drop policy if exists "CMS admins can insert coupons" on public.coupons;
drop policy if exists "CMS admins can update coupons" on public.coupons;
drop policy if exists "CMS admins can delete coupons" on public.coupons;

create policy "CMS admins can read coupons"
on public.coupons for select
to authenticated
using (public.is_cms_admin());

create policy "CMS admins can insert coupons"
on public.coupons for insert
to authenticated
with check (public.is_cms_admin());

create policy "CMS admins can update coupons"
on public.coupons for update
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

create policy "CMS admins can delete coupons"
on public.coupons for delete
to authenticated
using (public.is_cms_admin());

insert into public.homepage_sections
  (id, section_key, eyebrow, title, description, active, display_order)
values
  ('00000000-0000-4000-8000-000000000501', 'categories', 'Shop by Category', 'Fine jewellery for every ritual', 'Homepage category cards powered by CMS seed data.', true, 0),
  ('00000000-0000-4000-8000-000000000502', 'bestsellers', 'Bestsellers', 'Most loved this season', 'Featured products selected from the CMS.', true, 1),
  ('00000000-0000-4000-8000-000000000503', 'collections', 'Collections', 'Stories in gold, diamonds, and light', 'Featured collection cards controlled by CMS.', true, 2),
  ('00000000-0000-4000-8000-000000000504', 'trending', 'Trending Now', 'Pieces with a quiet glow', 'Trending products selected from seeded CMS records.', true, 3),
  ('00000000-0000-4000-8000-000000000505', 'testimonials', 'Kind Words', 'Jewellery that becomes part of the moment', 'Homepage testimonial heading.', true, 4),
  ('00000000-0000-4000-8000-000000000506', 'instagram', 'On Instagram', 'Seen in soft light', 'Instagram-style product grid heading.', true, 5)
on conflict (section_key) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  description = excluded.description,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.homepage_banners
  (id, title, desktop_image_url, mobile_image_url, link_url, active, sort_order)
values
  ('00000000-0000-4000-8000-000000000701', 'Bridal appointments', '/seed-assets/collection-statement.jpg', '/seed-assets/collection-bridal.jpg', '/collections', true, 0)
on conflict (id) do update set
  title = excluded.title,
  desktop_image_url = excluded.desktop_image_url,
  mobile_image_url = excluded.mobile_image_url,
  link_url = excluded.link_url,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('banners', 'banners', true),
  ('collections', 'collections', true),
  ('categories', 'categories', true),
  ('homepage', 'homepage', true),
  ('reels', 'reels', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read cms storage" on storage.objects;
drop policy if exists "Authenticated admins can manage cms storage" on storage.objects;
drop policy if exists "Authenticated can insert cms storage" on storage.objects;
drop policy if exists "Authenticated can update cms storage" on storage.objects;
drop policy if exists "Authenticated can delete cms storage" on storage.objects;
drop policy if exists "CMS admins can insert cms storage" on storage.objects;
drop policy if exists "CMS admins can update cms storage" on storage.objects;
drop policy if exists "CMS admins can delete cms storage" on storage.objects;

create policy "Public can read cms storage"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('products','banners','collections','categories','homepage','reels'));

create policy "CMS admins can insert cms storage"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('products','banners','collections','categories','homepage','reels')
  and public.is_cms_admin()
);

create policy "CMS admins can update cms storage"
on storage.objects for update
to authenticated
using (
  bucket_id in ('products','banners','collections','categories','homepage','reels')
  and public.is_cms_admin()
)
with check (
  bucket_id in ('products','banners','collections','categories','homepage','reels')
  and public.is_cms_admin()
);

create policy "CMS admins can delete cms storage"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('products','banners','collections','categories','homepage','reels')
  and public.is_cms_admin()
);

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'homepage_sections',
    'homepage_banners',
    'admin_users',
    'products',
    'product_images',
    'product_faqs',
    'categories',
    'collections',
    'homepage_content',
    'homepage_sections',
    'homepage_hero',
    'homepage_categories',
    'homepage_collections',
    'homepage_featured_products',
    'homepage_promises',
    'homepage_reels',
    'homepage_banners',
    'banners',
    'homepage_testimonials',
    'testimonials',
    'newsletter_section',
    'site_settings',
    'featured_sections',
    'orders',
    'order_items',
    'coupons'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = current_table
    ) and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = current_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', current_table);
    end if;
  end loop;
end $$;
