create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
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

alter table public.products add column if not exists collection text;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image text,
  description text,
  featured boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
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
  hero_title text not null,
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

create table if not exists public.featured_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  eyebrow text,
  title text not null,
  description text,
  product_ids uuid[] not null default '{}',
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  text text not null,
  rating integer not null default 5,
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
  created_at timestamptz not null default now()
);

create table if not exists public.homepage_reels (
  id uuid primary key default gen_random_uuid(),
  title text,
  video_url text not null,
  thumbnail_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

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

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text,
  quantity integer not null default 1,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null unique,
  name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  foreach current_table in array array['products','categories','collections','homepage_content','featured_sections','admin_users']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', current_table);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', current_table);
  end loop;
end $$;

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_faqs enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.homepage_content enable row level security;
alter table public.featured_sections enable row level security;
alter table public.testimonials enable row level security;
alter table public.banners enable row level security;
alter table public.homepage_reels enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

do $$
declare
  current_table text;
begin
  foreach current_table in array array['products','product_images','product_faqs','categories','collections','homepage_content','featured_sections','testimonials','banners','homepage_reels']
  loop
    execute format('drop policy if exists "Public can read %1$s" on public.%1$I', current_table);
    execute format('create policy "Public can read %1$s" on public.%1$I for select to anon, authenticated using (true)', current_table);
    execute format('drop policy if exists "Authenticated admins can manage %1$s" on public.%1$I', current_table);
    execute format('create policy "Authenticated admins can manage %1$s" on public.%1$I for all to authenticated using (true) with check (true)', current_table);
  end loop;
end $$;

drop policy if exists "Authenticated admins can read orders" on public.orders;
create policy "Authenticated admins can read orders" on public.orders for select to authenticated using (true);
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "Authenticated admins can update orders" on public.orders;
create policy "Authenticated admins can update orders" on public.orders for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated admins can read order items" on public.order_items;
create policy "Authenticated admins can read order items" on public.order_items for select to authenticated using (true);
drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items" on public.order_items for insert to anon, authenticated with check (true);

drop policy if exists "Authenticated admins can read admin users" on public.admin_users;
create policy "Authenticated admins can read admin users" on public.admin_users for select to authenticated using (true);
drop policy if exists "Authenticated admins can manage admin users" on public.admin_users;
create policy "Authenticated admins can manage admin users" on public.admin_users for all to authenticated using (true) with check (true);

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
create policy "Public can read cms storage"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('products','banners','collections','categories','homepage','reels'));

drop policy if exists "Authenticated admins can manage cms storage" on storage.objects;
create policy "Authenticated admins can manage cms storage"
on storage.objects for all
to authenticated
using (bucket_id in ('products','banners','collections','categories','homepage','reels'))
with check (bucket_id in ('products','banners','collections','categories','homepage','reels'));

do $$
declare
  current_table text;
begin
  foreach current_table in array array['products','product_images','product_faqs','categories','collections','homepage_content','featured_sections','testimonials','banners','homepage_reels','orders','order_items','admin_users','coupons']
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = current_table) and
       not exists (
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
