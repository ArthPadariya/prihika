-- Homepage CMS tables requested by the PriHiKa architecture.
-- These tables keep the existing premium storefront visible while making each section editable.

create extension if not exists pgcrypto;

create table if not exists public.homepage_hero (
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

create table if not exists public.homepage_categories (
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

create table if not exists public.homepage_collections (
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

create table if not exists public.homepage_featured_products (
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

create table if not exists public.homepage_testimonials (
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

create table if not exists public.homepage_promises (
  id uuid primary key default gen_random_uuid(),
  icon text,
  title text not null,
  description text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_section (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  description text,
  placeholder text,
  button_label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'homepage_hero',
    'homepage_categories',
    'homepage_collections',
    'homepage_featured_products',
    'homepage_testimonials',
    'homepage_promises',
    'newsletter_section',
    'site_settings'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', current_table);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', current_table);
    execute format('alter table public.%I enable row level security', current_table);
    execute format('alter table public.%I replica identity full', current_table);

    execute format('drop policy if exists "Public can read %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated can insert %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated can update %1$s" on public.%1$I', current_table);
    execute format('drop policy if exists "Authenticated can delete %1$s" on public.%1$I', current_table);
    execute format('create policy "Public can read %1$s" on public.%1$I for select to anon, authenticated using (true)', current_table);
    execute format('create policy "Authenticated can insert %1$s" on public.%1$I for insert to authenticated with check (true)', current_table);
    execute format('create policy "Authenticated can update %1$s" on public.%1$I for update to authenticated using (true) with check (true)', current_table);
    execute format('create policy "Authenticated can delete %1$s" on public.%1$I for delete to authenticated using (true)', current_table);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

insert into public.homepage_hero
  (id, hero_title, hero_subtitle, hero_image, hero_badge, hero_featured_note, cta_primary, cta_primary_link, cta_secondary, cta_secondary_link, testimonial_text, active)
values
  ('00000000-0000-4000-8000-000000000401', 'Luxury jewellery, made to be remembered.', 'Discover handcrafted rings, necklaces, earrings, bracelets, and bridal pieces designed with care, set in fine metals, and finished for a lifetime of meaning.', '/seed-assets/hero.jpg', 'New Season Heirlooms', 'Loved by modern brides, gift givers, and collectors of quiet luxury.', 'Shop Now', '/shop', 'View Collections', '/collections', 'The PriHiKa edit is curated for modern heirlooms and everyday ceremony.', true)
on conflict (id) do update set
  hero_title = excluded.hero_title,
  hero_subtitle = excluded.hero_subtitle,
  hero_image = excluded.hero_image,
  hero_badge = excluded.hero_badge,
  hero_featured_note = excluded.hero_featured_note,
  cta_primary = excluded.cta_primary,
  cta_primary_link = excluded.cta_primary_link,
  cta_secondary = excluded.cta_secondary,
  cta_secondary_link = excluded.cta_secondary_link,
  testimonial_text = excluded.testimonial_text,
  active = excluded.active,
  updated_at = now();

insert into public.homepage_categories
  (id, name, slug, image, description, featured, display_order)
values
  ('00000000-0000-4000-8000-000000000201', 'Rings', 'rings', '/seed-assets/ring.jpg', 'Solitaire, stack, and occasion rings.', true, 0),
  ('00000000-0000-4000-8000-000000000202', 'Necklaces', 'necklaces', '/seed-assets/necklace.jpg', 'Layered chains and statement necklaces.', true, 1),
  ('00000000-0000-4000-8000-000000000203', 'Earrings', 'earrings', '/seed-assets/earrings.jpg', 'Hoops, studs, and polished everyday shine.', true, 2),
  ('00000000-0000-4000-8000-000000000204', 'Bracelets', 'bracelets', '/seed-assets/bracelet.jpg', 'Bracelets and bangles for modern heirlooms.', true, 3)
on conflict (slug) do update set
  name = excluded.name,
  image = excluded.image,
  description = excluded.description,
  featured = excluded.featured,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.homepage_collections
  (id, title, slug, description, cover_image, featured, seo_title, seo_description, display_order)
values
  ('00000000-0000-4000-8000-000000000301', 'Bridal Heirlooms', 'bridal-heirlooms', 'Ceremonial pieces for vows, family rituals, and the stories that stay.', '/seed-assets/collection-bridal.jpg', true, 'Bridal Heirlooms - PriHiKa', 'Wedding-ready fine jewellery by PriHiKa.', 0),
  ('00000000-0000-4000-8000-000000000302', 'Everyday Icons', 'everyday-icons', 'Quietly luxurious staples designed to become part of your daily rhythm.', '/seed-assets/collection-everyday.jpg', true, 'Everyday Icons - PriHiKa', 'Fine jewellery for everyday wear.', 1),
  ('00000000-0000-4000-8000-000000000303', 'Statement Edit', 'statement-edit', 'Bold silhouettes, soft finishes, and pieces that hold a room gracefully.', '/seed-assets/collection-statement.jpg', true, 'Statement Edit - PriHiKa', 'Statement jewellery with PriHiKa restraint.', 2)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  cover_image = excluded.cover_image,
  featured = excluded.featured,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.homepage_featured_products
  (id, section_key, eyebrow, title, description, product_ids, active, display_order)
values
  ('00000000-0000-4000-8000-000000000501', 'categories', 'Shop by Category', 'Fine jewellery for every ritual', 'Homepage category cards powered by CMS seed data.', '{}', true, 0),
  ('00000000-0000-4000-8000-000000000502', 'bestsellers', 'Bestsellers', 'Most loved this season', 'Featured products selected from the CMS.', array['00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000106']::uuid[], true, 1),
  ('00000000-0000-4000-8000-000000000503', 'collections', 'Collections', 'Stories in gold, diamonds, and light', 'Featured collection cards controlled by CMS.', '{}', true, 2),
  ('00000000-0000-4000-8000-000000000504', 'trending', 'Trending Now', 'Pieces with a quiet glow', 'Trending products selected from seeded CMS records.', array['00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000105','00000000-0000-4000-8000-000000000107','00000000-0000-4000-8000-000000000101']::uuid[], true, 3),
  ('00000000-0000-4000-8000-000000000505', 'testimonials', 'Kind Words', 'Jewellery that becomes part of the moment', 'Homepage testimonial heading.', '{}', true, 4),
  ('00000000-0000-4000-8000-000000000506', 'instagram', 'On Instagram', 'Seen in soft light', 'Instagram-style product grid heading.', '{}', true, 5)
on conflict (section_key) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  description = excluded.description,
  product_ids = excluded.product_ids,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.homepage_promises
  (id, icon, title, description, active, display_order)
values
  ('00000000-0000-4000-8000-000000000901', 'Gem', 'Certified Quality', 'Every piece is BIS hallmarked and IGI/SGL certified.', true, 0),
  ('00000000-0000-4000-8000-000000000902', 'Truck', 'Free Shipping', 'Insured and tracked delivery across India, on us.', true, 1),
  ('00000000-0000-4000-8000-000000000903', 'Award', 'Lifetime Exchange', 'Update or exchange your jewellery, always.', true, 2),
  ('00000000-0000-4000-8000-000000000904', 'Headphones', 'Concierge Support', 'Talk to a stylist 7 days a week, on WhatsApp.', true, 3)
on conflict (id) do update set
  icon = excluded.icon,
  title = excluded.title,
  description = excluded.description,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.homepage_testimonials
  (id, name, city, text, rating, active, display_order)
values
  ('00000000-0000-4000-8000-000000000601', 'Priya Mehra', 'Mumbai', 'The solitaire felt personal from the first fitting. It has that rare balance of polish and warmth.', 5, true, 0),
  ('00000000-0000-4000-8000-000000000602', 'Ananya Rao', 'Bengaluru', 'I bought the pendant as a gift and the packaging, finish, and concierge support were beautiful.', 5, true, 1),
  ('00000000-0000-4000-8000-000000000603', 'Nisha Kapoor', 'Delhi', 'The bracelet is delicate but not fragile. It catches light in the most graceful way.', 5, true, 2)
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  text = excluded.text,
  rating = excluded.rating,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.newsletter_section
  (id, eyebrow, title, description, placeholder, button_label, active)
values
  ('00000000-0000-4000-8000-000000000905', 'Join the circle', 'First access. Quiet edits.', 'Be the first to see new drops, private previews, and stylist notes - once a fortnight, never more.', 'your@email.com', 'Subscribe', true)
on conflict (id) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  description = excluded.description,
  placeholder = excluded.placeholder,
  button_label = excluded.button_label,
  active = excluded.active,
  updated_at = now();

insert into public.site_settings (id, setting_key, setting_value, active)
values
  ('00000000-0000-4000-8000-000000000906', 'homepage', '{"source":"supabase","seeded":true}'::jsonb, true)
on conflict (setting_key) do update set
  setting_value = excluded.setting_value,
  active = excluded.active,
  updated_at = now();

do $$
declare
  current_table text;
begin
  foreach current_table in array array[
    'homepage_hero',
    'homepage_categories',
    'homepage_collections',
    'homepage_featured_products',
    'homepage_testimonials',
    'homepage_promises',
    'newsletter_section',
    'site_settings'
  ]
  loop
    if not exists (
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
