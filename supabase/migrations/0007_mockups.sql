create table public.frame_templates (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null unique references public.frames(id) on delete cascade,
  border_px integer not null default 48 check (border_px >= 0),
  mat_px integer not null default 28 check (mat_px >= 0),
  shadow_px integer not null default 28 check (shadow_px >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.mockups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  size_id uuid not null references public.product_sizes(id),
  frame_id uuid not null references public.frames(id),
  paper_id uuid not null references public.papers(id),
  storage_path text not null,
  width_px integer not null,
  height_px integer not null,
  created_at timestamptz not null default now()
);

create index mockups_user_created_idx on public.mockups(user_id,created_at desc);

alter table public.frame_templates enable row level security;
alter table public.mockups enable row level security;

create policy frame_templates_read on public.frame_templates
for select using (active = true);

create policy mockups_owner_select on public.mockups
for select using (user_id = auth.uid());

create policy mockups_owner_insert on public.mockups
for insert with check (user_id = auth.uid());

insert into public.frame_templates(frame_id,border_px,mat_px,shadow_px)
select id, case when color='黑' then 48 else 52 end, 28, 30
from public.frames
where active=true
on conflict(frame_id) do nothing;
