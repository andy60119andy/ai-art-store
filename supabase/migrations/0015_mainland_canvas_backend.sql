alter table public.cart_items add column if not exists print_orientation text not null default 'portrait' check(print_orientation in ('portrait','landscape'));
alter table public.order_items add column if not exists print_orientation text not null default 'portrait' check(print_orientation in ('portrait','landscape'));
alter table public.order_items add column if not exists artwork_version_id uuid references public.artwork_versions(id);
alter table public.products add column if not exists material text not null default 'legacy';
alter table public.products add column if not exists price_confirmed boolean not null default false;
insert into public.products(name,slug,description,base_price_twd,material,price_confirmed,active)
values('油畫布／帆布裸框','canvas-bare','油畫布／帆布輸出，無外框，台灣本島宅配。',0,'canvas',false,true)
on conflict(slug) do nothing;
insert into public.product_sizes(product_id,name,width_mm,height_mm,price_delta_twd,active)
select p.id,s.name,s.w,s.h,0,true from public.products p cross join (values('小尺寸',203,254),('中尺寸',406,508),('大尺寸',610,762)) s(name,w,h)
where p.slug='canvas-bare' and not exists(select 1 from public.product_sizes z where z.product_id=p.id and z.width_mm=s.w and z.height_mm=s.h);
create or replace function public.is_mainland_address(a jsonb) returns boolean language sql immutable as $$
 select replace(coalesce(a->>'city',''),'台','臺')=any(array['臺北市','新北市','桃園市','臺中市','臺南市','高雄市','基隆市','新竹市','嘉義市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣','臺東縣'])
 and btrim(coalesce(a->>'district',''))<>all(array['綠島鄉','蘭嶼鄉','琉球鄉','旗津區'])
 and length(btrim(coalesce(a->>'district','')))>0
 and length(btrim(coalesce(a->>'recipient_name','')))>=2
 and length(btrim(coalesce(a->>'address_line','')))>=3
 and coalesce(a->>'phone','')~'^09[0-9]{8}$'
 and coalesce(a->>'postal_code','')~'^\d{3}(\d{2,3})?$'
 and left(a->>'postal_code',3)<>all(array['290','817','819','929','951','952','805','209','210','211','212'])
 and coalesce(a->>'postal_code','')!~'^8[89]';
$$;
create or replace function public.check_mainland_order() returns trigger language plpgsql as $$
begin if not public.is_mainland_address(new.shipping_address) then raise exception 'MAINLAND_DELIVERY_ONLY'; end if; return new; end; $$;
create trigger mainland_order_guard before insert or update of shipping_address on public.orders for each row execute function public.check_mainland_order();
create or replace function public.check_canvas_cart() returns trigger language plpgsql security definer set search_path=public as $$
declare p public.products; s public.product_sizes; owner_id uuid; begin
 select * into p from public.products where id=new.product_id;
 select * into s from public.product_sizes where id=new.size_id;
 select user_id into owner_id from public.carts where id=new.cart_id;
 if p.id is null or p.material<>'canvas' or not p.price_confirmed or not p.active or s.id is null or not s.active or s.product_id<>p.id or new.frame_id is not null or new.paper_id is not null or new.custom_width_mm is not null or new.custom_height_mm is not null then raise exception 'INVALID_CANVAS_ITEM'; end if;
 if not ((s.width_mm,s.height_mm) in ((203,254),(406,508),(610,762),(254,203),(508,406),(762,610))) then raise exception 'INVALID_CANVAS_SIZE'; end if;
 if not exists(select 1 from public.artworks a where a.id=new.artwork_id and a.user_id=owner_id and a.status='ready') then raise exception 'INVALID_ARTWORK'; end if;
 if new.quantity<1 or new.quantity>99 or p.base_price_twd+s.price_delta_twd<=0 then raise exception 'INVALID_PRICE_OR_QUANTITY'; end if;
 new.unit_price_twd:=p.base_price_twd+s.price_delta_twd; return new;
end; $$;
create trigger canvas_cart_guard before insert or update on public.cart_items for each row execute function public.check_canvas_cart();
create policy canvas_admin_products_update on public.products for update to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='admin')) with check(exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
create policy canvas_admin_sizes_update on public.product_sizes for update to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='admin')) with check(exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
create policy checkout_admin_write on public.checkout_settings for all to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='admin')) with check(exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
-- Validate again at order-item insertion, including older carts and direct RPC calls.
create or replace function public.check_canvas_order_item() returns trigger language plpgsql security definer set search_path=public as $$
declare p public.products; s public.product_sizes; owner_id uuid; begin
 select * into p from public.products where id=new.product_id;
 select * into s from public.product_sizes where id=new.size_id;
 select user_id into owner_id from public.orders where id=new.order_id;
 if p.id is null or p.material<>'canvas' or not p.price_confirmed or not p.active or s.id is null or not s.active or s.product_id<>p.id or new.frame_id is not null or new.paper_id is not null or new.custom_width_mm is not null or new.custom_height_mm is not null then raise exception 'INVALID_CANVAS_ITEM'; end if;
 if not ((s.width_mm,s.height_mm) in ((203,254),(406,508),(610,762),(254,203),(508,406),(762,610))) then raise exception 'INVALID_CANVAS_SIZE'; end if;
 if not exists(select 1 from public.artworks a where a.id=new.artwork_id and a.user_id=owner_id and a.status='ready') then raise exception 'INVALID_ARTWORK'; end if;
 select id into new.artwork_version_id from public.artwork_versions where artwork_id=new.artwork_id order by version_no desc limit 1;
 if new.artwork_version_id is null then raise exception 'ARTWORK_VERSION_REQUIRED'; end if;
 if new.quantity<1 or new.quantity>99 or new.unit_price_twd<>p.base_price_twd+s.price_delta_twd or new.unit_price_twd<=0 then raise exception 'INVALID_PRICE_OR_QUANTITY'; end if;
 return new;
end; $$;
create trigger canvas_order_item_guard before insert on public.order_items for each row execute function public.check_canvas_order_item();

-- Keep checkout retries tied to the original address.
create or replace function public.checkout_canvas_order(p_request_id uuid,p_shipping_address jsonb,p_mode text)
returns table(order_id uuid,order_number text,total_twd integer)
language plpgsql security definer set search_path=public as $$
declare v public.orders; r record; fee integer; begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
 if p_mode is null or p_mode not in ('test','production') then raise exception 'INVALID_MODE'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into v from public.orders where user_id=auth.uid() and checkout_request_id=p_request_id;
 if found then
  if v.shipping_address is distinct from p_shipping_address then raise exception 'CHECKOUT_REQUEST_CONFLICT'; end if;
  if v.status<>'pending_payment' or v.payment_mode<>p_mode then raise exception 'ORDER_ALREADY_PROCESSED'; end if;
  return query select v.id,v.order_number,v.total_twd; return;
 end if;
 select shipping_fee_twd into fee from public.checkout_settings where id=true and enabled=true;
 if fee is null then raise exception 'SHIPPING_NOT_CONFIGURED'; end if;
 -- Existing framed/paper/custom-size carts cannot silently become canvas orders.
 if exists(select 1 from public.cart_items ci join public.carts c on ci.cart_id=c.id where c.user_id=auth.uid() and (ci.frame_id is not null or ci.paper_id is not null or ci.custom_width_mm is not null)) then raise exception 'LEGACY_CART_REQUIRES_REVIEW'; end if;
 select * into r from public.create_order_from_cart(auth.uid(),p_shipping_address);
 update public.orders set payment_mode=p_mode,checkout_request_id=p_request_id,shipping_fee_twd=fee,total_twd=subtotal_twd+fee where id=r.order_id returning * into v;
 if v.total_twd<=0 then raise exception 'INVALID_TOTAL'; end if;
 insert into public.payments(order_id,provider,amount_twd) values(v.id,'ecpay',v.total_twd);
 return query select v.id,v.order_number,v.total_twd;
end; $$;
revoke all on function public.checkout_canvas_order(uuid,jsonb,text) from public;
grant execute on function public.checkout_canvas_order(uuid,jsonb,text) to authenticated;

-- Preserve selected canvas orientation in the order snapshot.
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
  if not exists(select 1 from public.cart_items where cart_id=v_cart_id) then raise exception 'CART_EMPTY'; end if;

  for v_item in select * from public.cart_items where cart_id=v_cart_id order by created_at for update loop
    select * into v_product from public.products where id=v_item.product_id and active=true;
    if not found then raise exception 'CATALOG_CHANGED'; end if;

    if v_item.size_id is not null then
      select * into v_size from public.product_sizes where id=v_item.size_id and product_id=v_product.id and active=true;
      if not found then raise exception 'INVALID_SIZE'; end if;
      v_unit := v_product.base_price_twd + v_size.price_delta_twd;
    else
      if v_item.custom_width_mm is null or v_item.custom_height_mm is null then raise exception 'INVALID_CUSTOM_SIZE'; end if;
      v_unit := public.custom_size_price_twd(v_product.base_price_twd,v_item.custom_width_mm,v_item.custom_height_mm,0,0);
    end if;

    if v_item.frame_id is not null then
      select * into v_frame from public.frames where id=v_item.frame_id and active=true;
      if not found then raise exception 'CATALOG_CHANGED'; end if;
      v_unit := v_unit + v_frame.price_delta_twd;
    end if;
    if v_item.paper_id is not null then
      select * into v_paper from public.papers where id=v_item.paper_id and active=true;
      if not found then raise exception 'CATALOG_CHANGED'; end if;
      v_unit := v_unit + v_paper.price_delta_twd;
    end if;
    v_subtotal := v_subtotal + v_unit * v_item.quantity;
  end loop;

  v_order_number := 'AA' || upper(substr(encode(gen_random_bytes(7),'hex'),1,12));
  insert into public.orders(user_id,order_number,status,shipping_address,subtotal_twd,shipping_fee_twd,discount_twd,total_twd)
  values(p_user_id,v_order_number,'pending_payment',p_shipping_address,v_subtotal,0,0,v_subtotal)
  returning id into v_order_id;

  for v_item in select * from public.cart_items where cart_id=v_cart_id order by created_at loop
    select * into v_product from public.products where id=v_item.product_id;
    if v_item.size_id is not null then
      select * into v_size from public.product_sizes where id=v_item.size_id;
      v_unit := v_product.base_price_twd + v_size.price_delta_twd;
    else
      v_unit := public.custom_size_price_twd(v_product.base_price_twd,v_item.custom_width_mm,v_item.custom_height_mm,0,0);
    end if;
    if v_item.frame_id is not null then select * into v_frame from public.frames where id=v_item.frame_id; v_unit := v_unit + v_frame.price_delta_twd; end if;
    if v_item.paper_id is not null then select * into v_paper from public.papers where id=v_item.paper_id; v_unit := v_unit + v_paper.price_delta_twd; end if;

    insert into public.order_items(order_id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,unit_price_twd,custom_width_mm,custom_height_mm,print_orientation)
    values(v_order_id,v_item.product_id,v_item.artwork_id,v_item.size_id,v_item.frame_id,v_item.paper_id,v_item.quantity,v_unit,v_item.custom_width_mm,v_item.custom_height_mm,v_item.print_orientation);
  end loop;

  delete from public.cart_items where cart_id=v_cart_id;
  return query select v_order_id,v_order_number,v_subtotal;
end;
$$;

revoke all on function public.create_order_from_cart(uuid,jsonb) from public;
grant execute on function public.create_order_from_cart(uuid,jsonb) to authenticated;
-- Paid production orders enter canvas printing with the exact selected version.
create or replace function public.confirm_ecpay_payment(p_order_number text,p_trade_no text,p_amount integer,p_success boolean,p_mode text)
returns void language plpgsql security definer set search_path=public as $$
declare v public.orders; pay public.payments; begin
 select * into v from public.orders where order_number=p_order_number for update;
 if not found or v.total_twd<>p_amount or v.payment_mode<>p_mode then raise exception 'INVALID_PAYMENT_AMOUNT'; end if;
 select * into pay from public.payments where order_id=v.id and provider='ecpay' for update;
 if not found or pay.amount_twd<>p_amount then raise exception 'PAYMENT_NOT_FOUND'; end if;
 if pay.status='paid' then
  if pay.provider_payment_id<>p_trade_no then raise exception 'TRADE_MISMATCH'; end if;
  return;
 end if;
 if v.status<>'pending_payment' then raise exception 'INVALID_ORDER_STATE'; end if;
 update public.payments set provider_payment_id=p_trade_no,status=case when p_success then 'paid'::public.payment_status else 'failed'::public.payment_status end where id=pay.id;
 if p_success then
  update public.orders set status='paid',payment_mode=p_mode where id=v.id;
  -- Test payments never enter real dispatch.
  if p_mode='production' then
   insert into public.shipments(order_id) values(v.id) on conflict(order_id) do nothing;
   insert into public.production_files(order_item_id,storage_path)
   select i.id,av.storage_path from public.order_items i join public.artwork_versions av on av.id=i.artwork_version_id where i.order_id=v.id
   on conflict(order_item_id) do nothing;
  end if;
 end if;
end; $$;
revoke all on function public.confirm_ecpay_payment(text,text,integer,boolean,text) from public,authenticated,anon;
grant execute on function public.confirm_ecpay_payment(text,text,integer,boolean,text) to service_role;
