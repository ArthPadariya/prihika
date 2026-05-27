-- Complete Prihika live database recovery.
-- Idempotent: safe to run after partial/failed earlier migrations.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text unique,
  price numeric not null default 0,
  compare_price numeric,
  description text,
  category text,
  collection text,
  material text,
  stock integer not null default 0,
  featured boolean not null default false,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists title text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists price numeric not null default 0;
alter table public.products add column if not exists compare_price numeric;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists collection text;
alter table public.products add column if not exists material text;
alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists status text not null default 'draft';
alter table public.products add column if not exists created_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();

create unique index if not exists products_slug_key on public.products(slug);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images add column if not exists product_id uuid references public.products(id) on delete cascade;
alter table public.product_images add column if not exists image_url text;
alter table public.product_images add column if not exists alt_text text;
alter table public.product_images add column if not exists sort_order integer not null default 0;
alter table public.product_images add column if not exists created_at timestamptz not null default now();
create index if not exists product_images_product_id_idx on public.product_images(product_id);

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  question text,
  answer text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_faqs add column if not exists product_id uuid references public.products(id) on delete cascade;
alter table public.product_faqs add column if not exists question text;
alter table public.product_faqs add column if not exists answer text;
alter table public.product_faqs add column if not exists sort_order integer not null default 0;
alter table public.product_faqs add column if not exists created_at timestamptz not null default now();
create index if not exists product_faqs_product_id_idx on public.product_faqs(product_id);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  image text,
  description text,
  featured boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text unique,
  description text,
  cover_image text,
  featured boolean not null default true,
  seo_title text,
  seo_description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_content (
  id uuid primary key default gen_random_uuid(),
  hero_title text,
  hero_subtitle text,
  hero_image text,
  hero_badge text,
  hero_featured_note text,
  cta_primary text,
  cta_primary_link text,
  cta_secondary text,
  cta_secondary_link text,
  testimonial_text text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_hero (like public.homepage_content including defaults including constraints including indexes);

create table if not exists public.homepage_categories (like public.categories including defaults including constraints including indexes);
create table if not exists public.homepage_collections (like public.collections including defaults including constraints including indexes);

create table if not exists public.featured_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique,
  eyebrow text,
  title text,
  description text,
  product_ids uuid[] not null default '{}',
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_featured_products (like public.featured_sections including defaults including constraints including indexes);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text,
  city text,
  text text,
  rating integer not null default 5,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_testimonials (like public.testimonials including defaults including constraints including indexes);

create table if not exists public.homepage_promises (
  id uuid primary key default gen_random_uuid(),
  icon text,
  title text,
  description text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_section (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text,
  description text,
  placeholder text,
  button_label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique,
  eyebrow text,
  title text,
  description text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
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

create table if not exists public.homepage_banners (like public.banners including defaults including constraints including indexes);

create table if not exists public.homepage_reels (
  id uuid primary key default gen_random_uuid(),
  title text,
  video_url text,
  thumbnail_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_reels add column if not exists thumbnail_url text;
alter table public.homepage_reels add column if not exists updated_at timestamptz not null default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  total_amount numeric not null default 0,
  status text not null default 'Pending',
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists shipping_address jsonb;
alter table public.orders add column if not exists total_amount numeric not null default 0;
alter table public.orders add column if not exists status text not null default 'Pending';
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists created_at timestamptz not null default now();
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text,
  quantity integer not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  discount_type text not null default 'fixed',
  discount_value numeric not null default 0,
  minimum_order numeric not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique,
  setting_value jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text unique,
  name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists user_id uuid;
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists name text;
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users add column if not exists created_at timestamptz not null default now();
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();
create unique index if not exists admin_users_email_key on public.admin_users(lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'products','categories','collections','homepage_content','homepage_hero',
    'homepage_categories','homepage_collections','featured_sections',
    'homepage_featured_products','testimonials','homepage_testimonials',
    'homepage_promises','newsletter_section','homepage_sections','banners',
    'homepage_banners','homepage_reels','site_settings','admin_users'
  ]
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = current_table) then
      execute format('drop trigger if exists set_updated_at on public.%I', current_table);
      execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', current_table);
    end if;
  end loop;
end $$;

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

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

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

insert into public.admin_users (user_id, email, name, role)
select
  auth_user.id,
  lower(auth_user.email),
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'name', ''), nullif(auth_user.raw_user_meta_data ->> 'full_name', ''), split_part(auth_user.email, '@', 1)),
  'super_admin'
from auth.users auth_user
where auth_user.email is not null
  and not exists (select 1 from public.admin_users where role in ('super_admin', 'admin'))
on conflict do nothing;

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'admin_users','products','product_images','product_faqs','categories','collections',
    'homepage_content','homepage_hero','homepage_categories','homepage_collections',
    'featured_sections','homepage_featured_products','testimonials','homepage_testimonials',
    'homepage_promises','newsletter_section','homepage_sections','banners','homepage_banners',
    'homepage_reels','orders','order_items','coupons','site_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', current_table);
    execute format('alter table public.%I replica identity full', current_table);
  end loop;
end $$;

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'products','product_images','product_faqs','categories','collections',
    'homepage_content','homepage_hero','homepage_categories','homepage_collections',
    'featured_sections','homepage_featured_products','testimonials','homepage_testimonials',
    'homepage_promises','newsletter_section','homepage_sections','banners','homepage_banners',
    'homepage_reels','site_settings'
  ]
  loop
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
  end loop;
end $$;

drop policy if exists "Admins can read admin users" on public.admin_users;
drop policy if exists "Super admins can insert admin users" on public.admin_users;
drop policy if exists "Super admins can update admin users" on public.admin_users;
drop policy if exists "Super admins can delete admin users" on public.admin_users;

create policy "Admins can read admin users"
on public.admin_users for select to authenticated
using (lower(email) = public.current_auth_email() or public.is_cms_admin());

create policy "Super admins can insert admin users"
on public.admin_users for insert to authenticated
with check (public.is_super_admin());

create policy "Super admins can update admin users"
on public.admin_users for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "Super admins can delete admin users"
on public.admin_users for delete to authenticated
using (public.is_super_admin());

drop policy if exists "CMS admins can read orders" on public.orders;
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "CMS admins can update orders" on public.orders;
drop policy if exists "CMS admins can delete orders" on public.orders;

create policy "CMS admins can read orders" on public.orders for select to authenticated using (public.is_cms_admin());
create policy "Anyone can create orders" on public.orders for insert to anon, authenticated with check (true);
create policy "CMS admins can update orders" on public.orders for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete orders" on public.orders for delete to authenticated using (public.is_cms_admin());

drop policy if exists "CMS admins can read order items" on public.order_items;
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "CMS admins can update order items" on public.order_items;
drop policy if exists "CMS admins can delete order items" on public.order_items;

create policy "CMS admins can read order items" on public.order_items for select to authenticated using (public.is_cms_admin());
create policy "Anyone can create order items" on public.order_items for insert to anon, authenticated with check (true);
create policy "CMS admins can update order items" on public.order_items for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete order items" on public.order_items for delete to authenticated using (public.is_cms_admin());

drop policy if exists "CMS admins can read coupons" on public.coupons;
drop policy if exists "CMS admins can insert coupons" on public.coupons;
drop policy if exists "CMS admins can update coupons" on public.coupons;
drop policy if exists "CMS admins can delete coupons" on public.coupons;

create policy "CMS admins can read coupons" on public.coupons for select to authenticated using (public.is_cms_admin());
create policy "CMS admins can insert coupons" on public.coupons for insert to authenticated with check (public.is_cms_admin());
create policy "CMS admins can update coupons" on public.coupons for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete coupons" on public.coupons for delete to authenticated using (public.is_cms_admin());

insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('homepage', 'homepage', true),
  ('reels', 'reels', true),
  ('banners', 'banners', true),
  ('categories', 'categories', true),
  ('collections', 'collections', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read cms storage" on storage.objects;
drop policy if exists "Authenticated admins can manage cms storage" on storage.objects;
drop policy if exists "CMS admins can insert cms storage" on storage.objects;
drop policy if exists "CMS admins can update cms storage" on storage.objects;
drop policy if exists "CMS admins can delete cms storage" on storage.objects;

create policy "Public can read cms storage"
on storage.objects for select to anon, authenticated
using (bucket_id in ('products','homepage','reels','banners','categories','collections'));

create policy "CMS admins can insert cms storage"
on storage.objects for insert to authenticated
with check (bucket_id in ('products','homepage','reels','banners','categories','collections') and public.is_cms_admin());

create policy "CMS admins can update cms storage"
on storage.objects for update to authenticated
using (bucket_id in ('products','homepage','reels','banners','categories','collections') and public.is_cms_admin())
with check (bucket_id in ('products','homepage','reels','banners','categories','collections') and public.is_cms_admin());

create policy "CMS admins can delete cms storage"
on storage.objects for delete to authenticated
using (bucket_id in ('products','homepage','reels','banners','categories','collections') and public.is_cms_admin());

insert into public.products
  (id, title, slug, price, compare_price, description, category, collection, material, stock, featured, status)
values
  ('00000000-0000-4000-8000-000000000101', 'Celeste Solitaire Ring', 'celeste-solitaire-ring', 54000, 62000, 'A luminous solitaire ring designed for quiet proposals, milestones, and everyday ceremony.', 'Rings', 'Bridal Heirlooms', '18K Rose Gold', 8, true, 'active'),
  ('00000000-0000-4000-8000-000000000102', 'Noor Stack Ring', 'noor-stack-ring', 28500, null, 'A refined stack ring with a slim silhouette, made to layer beautifully with heirloom bands.', 'Rings', 'Everyday Icons', '18K Yellow Gold', 14, true, 'active'),
  ('00000000-0000-4000-8000-000000000103', 'Aara Diamond Pendant', 'aara-diamond-pendant', 36500, 42000, 'A soft diamond pendant that catches light without trying too hard, finished for daily wear.', 'Pendants', 'Everyday Icons', '18K Rose Gold', 11, true, 'active'),
  ('00000000-0000-4000-8000-000000000104', 'Mira Layered Necklace', 'mira-layered-necklace', 68500, null, 'A layered necklace with polished movement, made for silk sarees, linen shirts, and evenings out.', 'Necklaces', 'Statement Edit', '18K Yellow Gold', 6, true, 'active'),
  ('00000000-0000-4000-8000-000000000105', 'Ira Diamond Hoops', 'ira-diamond-hoops', 45500, null, 'Diamond hoops with a clean, luminous profile that moves easily from workday to wedding guest.', 'Earrings', 'Everyday Icons', '18K White Gold', 9, false, 'active'),
  ('00000000-0000-4000-8000-000000000106', 'Leela Tennis Bracelet', 'leela-tennis-bracelet', 72000, 78500, 'A graceful tennis bracelet with even-set stones and a secure clasp for celebrations and daily shine.', 'Bracelets', 'Statement Edit', '18K White Gold', 5, true, 'active'),
  ('00000000-0000-4000-8000-000000000107', 'Saanjh Gold Bangle', 'saanjh-gold-bangle', 58500, null, 'A sculpted gold bangle with a warm finish, built to feel substantial without losing softness.', 'Bangles', 'Statement Edit', '22K Gold', 7, false, 'active')
on conflict (slug) do update set
  title = excluded.title,
  price = excluded.price,
  compare_price = excluded.compare_price,
  description = excluded.description,
  category = excluded.category,
  collection = excluded.collection,
  material = excluded.material,
  stock = excluded.stock,
  featured = excluded.featured,
  status = excluded.status,
  updated_at = now();

insert into public.product_images (product_id, image_url, alt_text, sort_order)
select product_id, image_url, alt_text, sort_order
from (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, '/seed-assets/solitaire.jpg', 'Celeste Solitaire Ring', 0),
    ('00000000-0000-4000-8000-000000000101'::uuid, '/seed-assets/ring.jpg', 'Solitaire ring side profile', 1),
    ('00000000-0000-4000-8000-000000000102'::uuid, '/seed-assets/ring.jpg', 'Noor Stack Ring', 0),
    ('00000000-0000-4000-8000-000000000103'::uuid, '/seed-assets/pendant.jpg', 'Aara Diamond Pendant', 0),
    ('00000000-0000-4000-8000-000000000104'::uuid, '/seed-assets/necklace.jpg', 'Mira Layered Necklace', 0),
    ('00000000-0000-4000-8000-000000000105'::uuid, '/seed-assets/earrings.jpg', 'Ira Diamond Hoops', 0),
    ('00000000-0000-4000-8000-000000000106'::uuid, '/seed-assets/bracelet.jpg', 'Leela Tennis Bracelet', 0),
    ('00000000-0000-4000-8000-000000000107'::uuid, '/seed-assets/bangle.jpg', 'Saanjh Gold Bangle', 0)
) as seeded(product_id, image_url, alt_text, sort_order)
where not exists (
  select 1 from public.product_images image
  where image.product_id = seeded.product_id and image.image_url = seeded.image_url
);

insert into public.product_faqs (product_id, question, answer, sort_order)
select product_id, question, answer, sort_order
from (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Is this piece certified?', 'Yes. Every Prihika fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Can I request styling help before ordering?', 'Yes. The Prihika concierge can help with sizing, styling, gifting, and care guidance.', 1)
) as seeded(product_id, question, answer, sort_order)
where not exists (
  select 1 from public.product_faqs faq
  where faq.product_id = seeded.product_id and faq.question = seeded.question
);

insert into public.categories (id, name, slug, image, description, featured, display_order)
values
  ('00000000-0000-4000-8000-000000000201', 'Rings', 'rings', '/seed-assets/ring.jpg', 'Solitaire, stack, and occasion rings.', true, 0),
  ('00000000-0000-4000-8000-000000000202', 'Necklaces', 'necklaces', '/seed-assets/necklace.jpg', 'Layered chains and statement necklaces.', true, 1),
  ('00000000-0000-4000-8000-000000000203', 'Earrings', 'earrings', '/seed-assets/earrings.jpg', 'Hoops, studs, and polished everyday shine.', true, 2),
  ('00000000-0000-4000-8000-000000000204', 'Bracelets', 'bracelets', '/seed-assets/bracelet.jpg', 'Bracelets and bangles for modern heirlooms.', true, 3)
on conflict (slug) do update set name = excluded.name, image = excluded.image, description = excluded.description, featured = excluded.featured, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_categories select * from public.categories
on conflict (slug) do update set name = excluded.name, image = excluded.image, description = excluded.description, featured = excluded.featured, display_order = excluded.display_order, updated_at = now();

insert into public.collections (id, title, slug, description, cover_image, featured, seo_title, seo_description, display_order)
values
  ('00000000-0000-4000-8000-000000000301', 'Bridal Heirlooms', 'bridal-heirlooms', 'Ceremonial pieces for vows, family rituals, and the stories that stay.', '/seed-assets/collection-bridal.jpg', true, 'Bridal Heirlooms - Prihika', 'Wedding-ready fine jewellery by Prihika.', 0),
  ('00000000-0000-4000-8000-000000000302', 'Everyday Icons', 'everyday-icons', 'Quietly luxurious staples designed to become part of your daily rhythm.', '/seed-assets/collection-everyday.jpg', true, 'Everyday Icons - Prihika', 'Fine jewellery for everyday wear.', 1),
  ('00000000-0000-4000-8000-000000000303', 'Statement Edit', 'statement-edit', 'Bold silhouettes, soft finishes, and pieces that hold a room gracefully.', '/seed-assets/collection-statement.jpg', true, 'Statement Edit - Prihika', 'Statement jewellery with Prihika restraint.', 2)
on conflict (slug) do update set title = excluded.title, description = excluded.description, cover_image = excluded.cover_image, featured = excluded.featured, seo_title = excluded.seo_title, seo_description = excluded.seo_description, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_collections select * from public.collections
on conflict (slug) do update set title = excluded.title, description = excluded.description, cover_image = excluded.cover_image, featured = excluded.featured, seo_title = excluded.seo_title, seo_description = excluded.seo_description, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_content (id, hero_title, hero_subtitle, hero_image, hero_badge, hero_featured_note, cta_primary, cta_primary_link, cta_secondary, cta_secondary_link, testimonial_text, active)
values ('00000000-0000-4000-8000-000000000401', 'Luxury jewellery, made to be remembered.', 'Discover handcrafted rings, necklaces, earrings, bracelets, and bridal pieces designed with care, set in fine metals, and finished for a lifetime of meaning.', '/seed-assets/hero.jpg', 'New Season Heirlooms', 'Loved by modern brides, gift givers, and collectors of quiet luxury.', 'Shop Now', '/shop', 'View Collections', '/collections', 'The Prihika edit is curated for modern heirlooms and everyday ceremony.', true)
on conflict (id) do update set hero_title = excluded.hero_title, hero_subtitle = excluded.hero_subtitle, hero_image = excluded.hero_image, hero_badge = excluded.hero_badge, hero_featured_note = excluded.hero_featured_note, cta_primary = excluded.cta_primary, cta_primary_link = excluded.cta_primary_link, cta_secondary = excluded.cta_secondary, cta_secondary_link = excluded.cta_secondary_link, testimonial_text = excluded.testimonial_text, active = excluded.active, updated_at = now();

insert into public.homepage_hero select * from public.homepage_content
on conflict (id) do update set hero_title = excluded.hero_title, hero_subtitle = excluded.hero_subtitle, hero_image = excluded.hero_image, hero_badge = excluded.hero_badge, hero_featured_note = excluded.hero_featured_note, cta_primary = excluded.cta_primary, cta_primary_link = excluded.cta_primary_link, cta_secondary = excluded.cta_secondary, cta_secondary_link = excluded.cta_secondary_link, testimonial_text = excluded.testimonial_text, active = excluded.active, updated_at = now();

insert into public.featured_sections (id, section_key, eyebrow, title, description, product_ids, active, display_order)
values
  ('00000000-0000-4000-8000-000000000501', 'categories', 'Shop by Category', 'Fine jewellery for every ritual', 'Homepage category cards powered by CMS seed data.', '{}', true, 0),
  ('00000000-0000-4000-8000-000000000502', 'bestsellers', 'Bestsellers', 'Most loved this season', 'Featured products selected from the CMS.', array['00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000106']::uuid[], true, 1),
  ('00000000-0000-4000-8000-000000000503', 'collections', 'Collections', 'Stories in gold, diamonds, and light', 'Featured collection cards controlled by CMS.', '{}', true, 2),
  ('00000000-0000-4000-8000-000000000504', 'trending', 'Trending Now', 'Pieces with a quiet glow', 'Trending products selected from seeded CMS records.', array['00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000105','00000000-0000-4000-8000-000000000107','00000000-0000-4000-8000-000000000101']::uuid[], true, 3)
on conflict (section_key) do update set eyebrow = excluded.eyebrow, title = excluded.title, description = excluded.description, product_ids = excluded.product_ids, active = excluded.active, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_featured_products select * from public.featured_sections
on conflict (section_key) do update set eyebrow = excluded.eyebrow, title = excluded.title, description = excluded.description, product_ids = excluded.product_ids, active = excluded.active, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_sections (id, section_key, eyebrow, title, description, active, display_order)
select id, section_key, eyebrow, title, description, active, display_order from public.featured_sections
on conflict (section_key) do update set eyebrow = excluded.eyebrow, title = excluded.title, description = excluded.description, active = excluded.active, display_order = excluded.display_order, updated_at = now();

insert into public.testimonials (id, name, city, text, rating, active, display_order)
values
  ('00000000-0000-4000-8000-000000000601', 'Priya Mehra', 'Mumbai', 'The solitaire felt personal from the first fitting. It has that rare balance of polish and warmth.', 5, true, 0),
  ('00000000-0000-4000-8000-000000000602', 'Ananya Rao', 'Bengaluru', 'I bought the pendant as a gift and the packaging, finish, and concierge support were beautiful.', 5, true, 1),
  ('00000000-0000-4000-8000-000000000603', 'Nisha Kapoor', 'Delhi', 'The bracelet is delicate but not fragile. It catches light in the most graceful way.', 5, true, 2)
on conflict (id) do update set name = excluded.name, city = excluded.city, text = excluded.text, rating = excluded.rating, active = excluded.active, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_testimonials select * from public.testimonials
on conflict (id) do update set name = excluded.name, city = excluded.city, text = excluded.text, rating = excluded.rating, active = excluded.active, display_order = excluded.display_order, updated_at = now();

insert into public.homepage_promises (id, icon, title, description, active, display_order)
values
  ('00000000-0000-4000-8000-000000000901', 'Gem', 'Certified Quality', 'Every piece is BIS hallmarked and quality checked before dispatch.', true, 0),
  ('00000000-0000-4000-8000-000000000902', 'Truck', 'Free Shipping', 'Insured and tracked delivery across India, on us.', true, 1),
  ('00000000-0000-4000-8000-000000000903', 'Award', 'Lifetime Exchange', 'Update or exchange your jewellery, always.', true, 2),
  ('00000000-0000-4000-8000-000000000904', 'Headphones', 'Concierge Support', 'Talk to a stylist 7 days a week, on WhatsApp.', true, 3)
on conflict (id) do update set icon = excluded.icon, title = excluded.title, description = excluded.description, active = excluded.active, display_order = excluded.display_order, updated_at = now();

insert into public.newsletter_section (id, eyebrow, title, description, placeholder, button_label, active)
values ('00000000-0000-4000-8000-000000000905', 'Join the circle', 'First access. Quiet edits.', 'Be the first to see new drops, private previews, and stylist notes - once a fortnight, never more.', 'your@email.com', 'Subscribe', true)
on conflict (id) do update set eyebrow = excluded.eyebrow, title = excluded.title, description = excluded.description, placeholder = excluded.placeholder, button_label = excluded.button_label, active = excluded.active, updated_at = now();

insert into public.banners (title, desktop_image_url, mobile_image_url, link_url, active, sort_order)
select 'Bridal appointments', '/seed-assets/collection-statement.jpg', '/seed-assets/collection-bridal.jpg', '/collections', true, 0
where not exists (
  select 1 from public.banners banner where banner.title = 'Bridal appointments'
);

insert into public.homepage_banners (title, desktop_image_url, mobile_image_url, link_url, active, sort_order)
select 'Bridal appointments', '/seed-assets/collection-statement.jpg', '/seed-assets/collection-bridal.jpg', '/collections', true, 0
where not exists (
  select 1 from public.homepage_banners banner where banner.title = 'Bridal appointments'
);

insert into public.homepage_reels (title, video_url, thumbnail_url, active, sort_order)
select title, video_url, thumbnail_url, active, sort_order
from (
  values
    ('Solitaire glow', '/seed-assets/solitaire.jpg', '/seed-assets/solitaire.jpg', true, 0),
    ('Layered gold', '/seed-assets/necklace.jpg', '/seed-assets/necklace.jpg', true, 1),
    ('Diamond hoops', '/seed-assets/earrings.jpg', '/seed-assets/earrings.jpg', true, 2),
    ('Bracelet detail', '/seed-assets/bracelet.jpg', '/seed-assets/bracelet.jpg', true, 3)
) as seeded(title, video_url, thumbnail_url, active, sort_order)
where not exists (
  select 1 from public.homepage_reels reel where reel.title = seeded.title
);

insert into public.site_settings (id, setting_key, setting_value, active)
values ('00000000-0000-4000-8000-000000000906', 'homepage', '{"source":"supabase","seeded":true}'::jsonb, true)
on conflict (setting_key) do update set setting_value = excluded.setting_value, active = excluded.active, updated_at = now();

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'admin_users','products','product_images','product_faqs','categories','collections',
    'homepage_content','homepage_hero','homepage_categories','homepage_collections',
    'featured_sections','homepage_featured_products','testimonials','homepage_testimonials',
    'homepage_promises','newsletter_section','homepage_sections','banners','homepage_banners',
    'homepage_reels','orders','order_items','coupons','site_settings'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = current_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', current_table);
    end if;
  end loop;
exception
  when duplicate_object then null;
end $$;
