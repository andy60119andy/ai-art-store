create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  order_id uuid references public.orders(id) on delete set null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,event_id)
);

create index if not exists payment_events_order_idx on public.payment_events(order_id);

create unique index if not exists payments_provider_payment_uidx
  on public.payments(provider,provider_payment_id)
  where provider_payment_id is not null;

alter table public.payment_events enable row level security;

create policy payment_events_admin_select on public.payment_events
for select using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','production')));

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

  if not exists(select 1 from public.cart_items where cart_id=v_cart_id) then
    raise exception 'CART_EMPTY';
  end if;

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

    v_unit := v_product.base_price_twd
      + coalesce(v_size.price_delta_twd,0)
      + coalesce(v_frame.price_delta_twd,0)
      + coalesce(v_paper.price_delta_twd,0);
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
    v_unit := v_product.base_price_twd + coalesce(v_size.price_delta_twd,0) + coalesce(v_frame.price_delta_twd,0) + coalesce(v_paper.price_delta_twd,0);
    insert into public.order_items(order_id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,unit_price_twd)
    values(v_order_id,v_item.product_id,v_item.artwork_id,v_item.size_id,v_item.frame_id,v_item.paper_id,v_item.quantity,v_unit);
  end loop;

  delete from public.cart_items where cart_id=v_cart_id;
  return query select v_order_id,v_order_number,v_subtotal;
end;
$$;

revoke all on function public.create_order_from_cart(uuid,jsonb) from public;
grant execute on function public.create_order_from_cart(uuid,jsonb) to authenticated;
