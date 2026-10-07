-- TASK-017: preserve the exact framed mockup and custom dimensions through checkout.
alter table public.cart_items add column if not exists mockup_id uuid references public.mockups(id) on delete set null;
alter table public.order_items add column if not exists mockup_id uuid references public.mockups(id) on delete set null;
alter table public.production_files add column if not exists mockup_id uuid references public.mockups(id) on delete set null;
alter table public.cart_items add column if not exists custom_width_mm integer;
alter table public.cart_items add column if not exists custom_height_mm integer;
alter table public.order_items add column if not exists custom_width_mm integer;
alter table public.order_items add column if not exists custom_height_mm integer;

alter table public.mockups alter column size_id drop not null;
alter table public.mockups add column if not exists custom_width_mm integer;
alter table public.mockups add column if not exists custom_height_mm integer;

create index if not exists cart_items_mockup_id_idx on public.cart_items(mockup_id);
create index if not exists order_items_mockup_id_idx on public.order_items(mockup_id);
create index if not exists production_files_mockup_id_idx on public.production_files(mockup_id);
create index if not exists cart_items_custom_dimensions_idx on public.cart_items(custom_width_mm, custom_height_mm);
create index if not exists order_items_custom_dimensions_idx on public.order_items(custom_width_mm, custom_height_mm);
create unique index if not exists production_files_order_item_unique_idx on public.production_files(order_item_id);

create policy mockups_staff_select on public.mockups
for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','production'))
);

create or replace function public.create_order_from_cart(
  p_user_id uuid,
  p_shipping_address jsonb
)
returns table(order_id uuid, order_number text, total_twd integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id uuid;
  v_item record;
  v_product public.products%rowtype;
  v_size public.product_sizes%rowtype;
  v_frame public.frames%rowtype;
  v_paper public.papers%rowtype;
  v_unit integer;
  v_subtotal integer := 0;
  v_order_id uuid;
  v_order_number text;
  v_width integer;
  v_height integer;
begin
  if p_user_id is null or p_user_id <> auth.uid() then raise exception 'UNAUTHORIZED'; end if;
  if coalesce(p_shipping_address->>'recipient_name','') = ''
     or coalesce(p_shipping_address->>'phone','') = ''
     or coalesce(p_shipping_address->>'city','') = ''
     or coalesce(p_shipping_address->>'address_line','') = '' then
    raise exception 'INVALID_SHIPPING_ADDRESS';
  end if;

  select id into v_cart_id from public.carts where user_id=p_user_id for update;
  if v_cart_id is null then raise exception 'CART_NOT_FOUND'; end if;
  if not exists(select 1 from public.cart_items where cart_id=v_cart_id) then raise exception 'CART_EMPTY'; end if;

  for v_item in select * from public.cart_items where cart_id=v_cart_id order by created_at for update loop
    select * into v_product from public.products where id=v_item.product_id and active=true;
    if not found then raise exception 'CATALOG_CHANGED'; end if;

    if v_item.size_id is not null then
      select * into v_size from public.product_sizes where id=v_item.size_id and product_id=v_product.id and active=true;
      if not found then raise exception 'INVALID_SIZE'; end if;
    else
      v_size := null;
    end if;

    if v_item.frame_id is not null then
      select * into v_frame from public.frames where id=v_item.frame_id and active=true;
      if not found then raise exception 'CATALOG_CHANGED'; end if;
    else
      v_frame := null;
    end if;

    if v_item.paper_id is not null then
      select * into v_paper from public.papers where id=v_item.paper_id and active=true;
      if not found then raise exception 'CATALOG_CHANGED'; end if;
    else
      v_paper := null;
    end if;

    v_width := v_item.custom_width_mm;
    v_height := v_item.custom_height_mm;
    if (v_width is null) <> (v_height is null) then raise exception 'INVALID_CUSTOM_SIZE'; end if;

    if v_width is not null then
      if v_width < 100 or v_width > 3000 or v_height < 100 or v_height > 6000 then raise exception 'INVALID_CUSTOM_SIZE'; end if;
      v_unit := v_product.base_price_twd
        + ceil((v_width::numeric * v_height::numeric) / 1000000 * 2200)
        + coalesce(v_frame.price_delta_twd,0)
        + coalesce(v_paper.price_delta_twd,0);
    else
      if v_size is null then raise exception 'INVALID_SIZE'; end if;
      v_unit := v_product.base_price_twd
        + v_size.price_delta_twd
        + coalesce(v_frame.price_delta_twd,0)
        + coalesce(v_paper.price_delta_twd,0);
    end if;
    v_subtotal := v_subtotal + v_unit * v_item.quantity;
  end loop;

  v_order_number := 'AA' || upper(substr(encode(gen_random_bytes(7),'hex'),1,12));
  insert into public.orders(
    user_id,order_number,status,shipping_address,subtotal_twd,shipping_fee_twd,discount_twd,total_twd
  ) values (
    p_user_id,v_order_number,'pending_payment',p_shipping_address,v_subtotal,0,0,v_subtotal
  ) returning id into v_order_id;

  for v_item in select * from public.cart_items where cart_id=v_cart_id order by created_at loop
    select * into v_product from public.products where id=v_item.product_id;
    if v_item.size_id is not null then select * into v_size from public.product_sizes where id=v_item.size_id; else v_size := null; end if;
    if v_item.frame_id is not null then select * into v_frame from public.frames where id=v_item.frame_id; else v_frame := null; end if;
    if v_item.paper_id is not null then select * into v_paper from public.papers where id=v_item.paper_id; else v_paper := null; end if;

    if v_item.custom_width_mm is not null then
      v_unit := v_product.base_price_twd
        + ceil((v_item.custom_width_mm::numeric * v_item.custom_height_mm::numeric) / 1000000 * 2200)
        + coalesce(v_frame.price_delta_twd,0)
        + coalesce(v_paper.price_delta_twd,0);
    else
      v_unit := v_product.base_price_twd
        + coalesce(v_size.price_delta_twd,0)
        + coalesce(v_frame.price_delta_twd,0)
        + coalesce(v_paper.price_delta_twd,0);
    end if;

    insert into public.order_items(
      order_id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,unit_price_twd,mockup_id,custom_width_mm,custom_height_mm
    ) values(
      v_order_id,v_item.product_id,v_item.artwork_id,v_item.size_id,v_item.frame_id,v_item.paper_id,v_item.quantity,v_unit,
      v_item.mockup_id,v_item.custom_width_mm,v_item.custom_height_mm
    );
  end loop;

  delete from public.cart_items where cart_id=v_cart_id;
  return query select v_order_id,v_order_number,v_subtotal;
end;
$$;

revoke all on function public.create_order_from_cart(uuid,jsonb) from public;
grant execute on function public.create_order_from_cart(uuid,jsonb) to authenticated;
