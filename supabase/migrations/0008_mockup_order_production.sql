-- TASK-017: preserve the exact framed mockup selected for cart/order/production.
alter table public.cart_items add column if not exists mockup_id uuid references public.mockups(id) on delete set null;
alter table public.order_items add column if not exists mockup_id uuid references public.mockups(id) on delete set null;
alter table public.production_files add column if not exists mockup_id uuid references public.mockups(id) on delete set null;

create index if not exists cart_items_mockup_id_idx on public.cart_items(mockup_id);
create index if not exists order_items_mockup_id_idx on public.order_items(mockup_id);
create index if not exists production_files_mockup_id_idx on public.production_files(mockup_id);

create policy mockups_staff_select on public.mockups
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','production'))
);