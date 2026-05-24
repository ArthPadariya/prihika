create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null default 0,
  minimum_order numeric not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "Authenticated admins can read coupons"
on public.coupons
for select
to authenticated
using (true);

create policy "Authenticated admins can manage coupons"
on public.coupons
for all
to authenticated
using (true)
with check (true);

alter publication supabase_realtime add table public.coupons;
