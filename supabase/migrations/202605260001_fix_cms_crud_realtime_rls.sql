-- Production CMS CRUD + realtime repair.
-- This migration makes Supabase the single source of truth for storefront and admin data.

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

alter table if exists public.testimonials add column if not exists updated_at timestamptz not null default now();
alter table if exists public.banners add column if not exists updated_at timestamptz not null default now();
alter table if exists public.homepage_reels add column if not exists updated_at timestamptz not null default now();
alter table if exists public.coupons add column if not exists updated_at timestamptz not null default now();

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'products',
    'categories',
    'collections',
    'homepage_content',
    'featured_sections',
    'testimonials',
    'banners',
    'homepage_reels',
    'admin_users',
    'coupons'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = current_table
    ) then
      execute format('drop trigger if exists set_updated_at on public.%I', current_table);
      execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', current_table);
    end if;
  end loop;
end $$;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'products',
    'product_images',
    'product_faqs',
    'categories',
    'collections',
    'homepage_content',
    'featured_sections',
    'testimonials',
    'banners',
    'homepage_reels',
    'orders',
    'order_items',
    'admin_users',
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
    'products',
    'product_images',
    'product_faqs',
    'categories',
    'collections',
    'homepage_content',
    'featured_sections',
    'testimonials',
    'banners',
    'homepage_reels'
  ]
  loop
    execute format('drop policy if exists "Public can read %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated admins can manage %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated can insert %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated can update %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated can delete %1$s" on public.%1$I', current_table);

    execute format('create policy "Public can read %1$s" on public.%1$I for select to anon, authenticated using (true)', current_table);
    execute format('create policy "Authenticated can insert %1$s" on public.%1$I for insert to authenticated with check (true)', current_table);
    execute format('create policy "Authenticated can update %1$s" on public.%1$I for update to authenticated using (true) with check (true)', current_table);
    execute format('create policy "Authenticated can delete %1$s" on public.%1$I for delete to authenticated using (true)', current_table);
  end loop;
end $$;

drop policy if exists "Authenticated admins can read orders" on public.orders;
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Authenticated admins can update orders" on public.orders;
drop policy if exists "Authenticated can delete orders" on public.orders;
create policy "Authenticated admins can read orders" on public.orders for select to authenticated using (true);
create policy "Anyone can create orders" on public.orders for insert to anon, authenticated with check (true);
create policy "Authenticated admins can update orders" on public.orders for update to authenticated using (true) with check (true);
create policy "Authenticated can delete orders" on public.orders for delete to authenticated using (true);

drop policy if exists "Authenticated admins can read order items" on public.order_items;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Authenticated admins can update order items" on public.order_items;
drop policy if exists "Authenticated admins can delete order items" on public.order_items;
create policy "Authenticated admins can read order items" on public.order_items for select to authenticated using (true);
create policy "Anyone can create order items" on public.order_items for insert to anon, authenticated with check (true);
create policy "Authenticated admins can update order items" on public.order_items for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete order items" on public.order_items for delete to authenticated using (true);

drop policy if exists "Authenticated admins can read coupons" on public.coupons;
drop policy if exists "Authenticated admins can manage coupons" on public.coupons;
drop policy if exists "Authenticated can insert coupons" on public.coupons;
drop policy if exists "Authenticated can update coupons" on public.coupons;
drop policy if exists "Authenticated can delete coupons" on public.coupons;
create policy "Authenticated admins can read coupons" on public.coupons for select to authenticated using (true);
create policy "Authenticated can insert coupons" on public.coupons for insert to authenticated with check (true);
create policy "Authenticated can update coupons" on public.coupons for update to authenticated using (true) with check (true);
create policy "Authenticated can delete coupons" on public.coupons for delete to authenticated using (true);

drop policy if exists "Authenticated admins can read admin users" on public.admin_users;
drop policy if exists "Authenticated admins can manage admin users" on public.admin_users;
drop policy if exists "Authenticated can insert admin users" on public.admin_users;
drop policy if exists "Authenticated can update admin users" on public.admin_users;
drop policy if exists "Authenticated can delete admin users" on public.admin_users;
create policy "Authenticated admins can read admin users" on public.admin_users for select to authenticated using (true);
create policy "Authenticated can insert admin users" on public.admin_users for insert to authenticated with check (true);
create policy "Authenticated can update admin users" on public.admin_users for update to authenticated using (true) with check (true);
create policy "Authenticated can delete admin users" on public.admin_users for delete to authenticated using (true);

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

create policy "Public can read cms storage"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('products','banners','collections','categories','homepage','reels'));

create policy "Authenticated can insert cms storage"
on storage.objects for insert
to authenticated
with check (bucket_id in ('products','banners','collections','categories','homepage','reels'));

create policy "Authenticated can update cms storage"
on storage.objects for update
to authenticated
using (bucket_id in ('products','banners','collections','categories','homepage','reels'))
with check (bucket_id in ('products','banners','collections','categories','homepage','reels'));

create policy "Authenticated can delete cms storage"
on storage.objects for delete
to authenticated
using (bucket_id in ('products','banners','collections','categories','homepage','reels'));

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'products',
    'product_images',
    'product_faqs',
    'categories',
    'collections',
    'homepage_content',
    'featured_sections',
    'testimonials',
    'banners',
    'homepage_reels',
    'orders',
    'order_items',
    'admin_users',
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
