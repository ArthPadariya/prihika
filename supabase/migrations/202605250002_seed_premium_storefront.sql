-- Premium storefront seed data. This keeps the existing PriHiKa storefront populated
-- while making the same content editable from the admin CMS.

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
alter table public.products add column if not exists updated_at timestamptz not null default now();

alter table public.product_images add column if not exists product_id uuid references public.products(id) on delete cascade;
alter table public.product_images add column if not exists image_url text;
alter table public.product_images add column if not exists alt_text text;
alter table public.product_images add column if not exists sort_order integer not null default 0;

alter table public.product_faqs add column if not exists product_id uuid references public.products(id) on delete cascade;
alter table public.product_faqs add column if not exists question text;
alter table public.product_faqs add column if not exists answer text;
alter table public.product_faqs add column if not exists sort_order integer not null default 0;

alter table public.homepage_reels add column if not exists thumbnail_url text;

create unique index if not exists products_slug_key on public.products(slug);
create unique index if not exists categories_slug_key on public.categories(slug);
create unique index if not exists collections_slug_key on public.collections(slug);
create unique index if not exists featured_sections_section_key_key on public.featured_sections(section_key);

alter table public.categories add column if not exists image text;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists featured boolean not null default true;
alter table public.categories add column if not exists display_order integer not null default 0;
alter table public.categories add column if not exists updated_at timestamptz not null default now();

alter table public.collections add column if not exists description text;
alter table public.collections add column if not exists cover_image text;
alter table public.collections add column if not exists featured boolean not null default true;
alter table public.collections add column if not exists seo_title text;
alter table public.collections add column if not exists seo_description text;
alter table public.collections add column if not exists display_order integer not null default 0;
alter table public.collections add column if not exists updated_at timestamptz not null default now();

alter table public.homepage_content add column if not exists hero_subtitle text;
alter table public.homepage_content add column if not exists hero_image text;
alter table public.homepage_content add column if not exists hero_badge text;
alter table public.homepage_content add column if not exists hero_featured_note text;
alter table public.homepage_content add column if not exists cta_primary text;
alter table public.homepage_content add column if not exists cta_primary_link text;
alter table public.homepage_content add column if not exists cta_secondary text;
alter table public.homepage_content add column if not exists cta_secondary_link text;
alter table public.homepage_content add column if not exists testimonial_text text;
alter table public.homepage_content add column if not exists active boolean not null default true;
alter table public.homepage_content add column if not exists updated_at timestamptz not null default now();

alter table public.featured_sections add column if not exists eyebrow text;
alter table public.featured_sections add column if not exists description text;
alter table public.featured_sections add column if not exists product_ids uuid[] not null default '{}';
alter table public.featured_sections add column if not exists active boolean not null default true;
alter table public.featured_sections add column if not exists display_order integer not null default 0;
alter table public.featured_sections add column if not exists updated_at timestamptz not null default now();

alter table public.testimonials add column if not exists city text;
alter table public.testimonials add column if not exists rating integer not null default 5;
alter table public.testimonials add column if not exists active boolean not null default true;
alter table public.testimonials add column if not exists display_order integer not null default 0;
alter table public.testimonials add column if not exists updated_at timestamptz not null default now();

alter table public.banners add column if not exists title text;
alter table public.banners add column if not exists desktop_image_url text;
alter table public.banners add column if not exists mobile_image_url text;
alter table public.banners add column if not exists link_url text;
alter table public.banners add column if not exists active boolean not null default true;
alter table public.banners add column if not exists sort_order integer not null default 0;
alter table public.banners add column if not exists updated_at timestamptz not null default now();

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

insert into public.product_images
  (product_id, image_url, alt_text, sort_order)
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
  select 1 from public.product_images existing
  where existing.product_id = seeded.product_id and existing.image_url = seeded.image_url
);

insert into public.product_faqs
  (product_id, question, answer, sort_order)
select product_id, question, answer, sort_order
from (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1),
    ('00000000-0000-4000-8000-000000000104'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000104'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1),
    ('00000000-0000-4000-8000-000000000105'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000105'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1),
    ('00000000-0000-4000-8000-000000000106'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000106'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1),
    ('00000000-0000-4000-8000-000000000107'::uuid, 'Is this piece certified?', 'Yes. Every PriHiKa fine jewellery piece is BIS hallmarked and quality checked before dispatch.', 0),
    ('00000000-0000-4000-8000-000000000107'::uuid, 'Can I request styling help before ordering?', 'Yes. The PriHiKa concierge can help with sizing, styling, gifting, and care guidance.', 1)
) as seeded(product_id, question, answer, sort_order)
where not exists (
  select 1 from public.product_faqs existing
  where existing.product_id = seeded.product_id and existing.question = seeded.question
);

insert into public.categories
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

insert into public.collections
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

insert into public.homepage_content
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

insert into public.featured_sections
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

insert into public.testimonials
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

insert into public.banners
  (title, desktop_image_url, mobile_image_url, link_url, active, sort_order)
select title, desktop_image_url, mobile_image_url, link_url, active, sort_order
from (
  values
    ('Bridal appointments', '/seed-assets/collection-statement.jpg', '/seed-assets/collection-bridal.jpg', '/collections', true, 0)
) as seeded(title, desktop_image_url, mobile_image_url, link_url, active, sort_order)
where not exists (
  select 1 from public.banners existing
  where existing.title = seeded.title
);

insert into public.homepage_reels
  (title, video_url, thumbnail_url, active, sort_order)
select title, video_url, thumbnail_url, active, sort_order
from (
  values
    ('Solitaire glow', '/seed-assets/solitaire.jpg', '/seed-assets/solitaire.jpg', true, 0),
    ('Layered gold', '/seed-assets/necklace.jpg', '/seed-assets/necklace.jpg', true, 1),
    ('Diamond hoops', '/seed-assets/earrings.jpg', '/seed-assets/earrings.jpg', true, 2),
    ('Bracelet detail', '/seed-assets/bracelet.jpg', '/seed-assets/bracelet.jpg', true, 3)
) as seeded(title, video_url, thumbnail_url, active, sort_order)
where not exists (
  select 1 from public.homepage_reels existing
  where existing.title = seeded.title
);
