create extension if not exists pgcrypto;

create type public.app_role as enum ('customer','admin','production');
create type public.generation_status as enum ('queued','processing','succeeded','failed');
create type public.artwork_status as enum ('draft','ready','archived');
create type public.order_status as enum ('pending_payment','paid','processing','in_production','shipped','completed','cancelled','refunded');
create type public.payment_status as enum ('pending','paid','failed','refunded');
create type public.production_status as enum ('pending','ready','printing','framing','packed','completed');
create type public.shipment_status as enum ('pending','shipped','in_transit','delivered','exception');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  base_price_twd integer not null check (base_price_twd >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  width_mm integer not null check (width_mm > 0),
  height_mm integer not null check (height_mm > 0),
  price_delta_twd integer not null default 0,
  active boolean not null default true,
  unique(product_id,name)
);

create table public.frames (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  material text,
  color text,
  price_delta_twd integer not null default 0,
  active boolean not null default true
);

create table public.papers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_delta_twd integer not null default 0,
  active boolean not null default true
);

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  width_px integer,
  height_px integer,
  created_at timestamptz not null default now()
);

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_id uuid references public.uploads(id) on delete set null,
  style_key text not null,
  prompt text,
  status public.generation_status not null default 'queued',
  error_message text,
  provider_job_id text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  status public.artwork_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artwork_versions (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  generation_job_id uuid references public.generation_jobs(id) on delete set null,
  storage_path text not null,
  width_px integer,
  height_px integer,
  version_no integer not null,
  created_at timestamptz not null default now(),
  unique(artwork_id,version_no)
);

create table public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  postal_code text,
  city text not null,
  district text,
  address_line text not null,
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  artwork_id uuid references public.artworks(id) on delete set null,
  size_id uuid references public.product_sizes(id),
  frame_id uuid references public.frames(id),
  paper_id uuid references public.papers(id),
  quantity integer not null default 1 check (quantity > 0),
  unit_price_twd integer not null check (unit_price_twd >= 0),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  order_number text not null unique,
  status public.order_status not null default 'pending_payment',
  shipping_address jsonb not null,
  subtotal_twd integer not null check (subtotal_twd >= 0),
  shipping_fee_twd integer not null default 0 check (shipping_fee_twd >= 0),
  discount_twd integer not null default 0 check (discount_twd >= 0),
  total_twd integer not null check (total_twd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  artwork_id uuid references public.artworks(id) on delete set null,
  size_id uuid references public.product_sizes(id),
  frame_id uuid references public.frames(id),
  paper_id uuid references public.papers(id),
  quantity integer not null check (quantity > 0),
  unit_price_twd integer not null check (unit_price_twd >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  amount_twd integer not null check (amount_twd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  carrier text,
  tracking_number text,
  status public.shipment_status not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.production_files (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  storage_path text not null,
  production_status public.production_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index uploads_user_idx on public.uploads(user_id);
create index generation_jobs_user_status_idx on public.generation_jobs(user_id,status);
create index artworks_user_idx on public.artworks(user_id);
create index orders_user_created_idx on public.orders(user_id,created_at desc);
create index order_items_order_idx on public.order_items(order_id);
create index payments_order_idx on public.payments(order_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger artworks_updated_at before update on public.artworks for each row execute function public.set_updated_at();
create trigger carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger shipments_updated_at before update on public.shipments for each row execute function public.set_updated_at();
create trigger production_files_updated_at before update on public.production_files for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id) values (new.id) on conflict (id) do nothing;
  insert into public.carts(user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.frames enable row level security;
alter table public.papers enable row level security;
alter table public.uploads enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.artworks enable row level security;
alter table public.artwork_versions enable row level security;
alter table public.shipping_addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.production_files enable row level security;

create policy profiles_owner_select on public.profiles for select using (id = auth.uid());
create policy profiles_owner_update on public.profiles for update using (id = auth.uid());

create policy catalog_categories_read on public.product_categories for select using (active = true);
create policy catalog_products_read on public.products for select using (active = true);
create policy catalog_sizes_read on public.product_sizes for select using (active = true);
create policy catalog_frames_read on public.frames for select using (active = true);
create policy catalog_papers_read on public.papers for select using (active = true);

create policy uploads_owner_all on public.uploads for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy generation_owner_all on public.generation_jobs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy artworks_owner_all on public.artworks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy artwork_versions_owner_select on public.artwork_versions for select using (exists(select 1 from public.artworks a where a.id=artwork_id and a.user_id=auth.uid()));
create policy addresses_owner_all on public.shipping_addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy carts_owner_all on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_owner_all on public.cart_items for all using (exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy orders_owner_select on public.orders for select using (user_id = auth.uid());
create policy order_items_owner_select on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy payments_owner_select on public.payments for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy shipments_owner_select on public.shipments for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy production_files_owner_select on public.production_files for select using (exists(select 1 from public.order_items oi join public.orders o on o.id=oi.order_id where oi.id=order_item_id and o.user_id=auth.uid()));
