-- Apply after existing migrations. Explicit merchant pricing and shipping setup required.
alter table public.orders add column if not exists checkout_request_id uuid;
alter table public.orders add column if not exists payment_mode text;
create unique index if not exists orders_checkout_request on public.orders(user_id,checkout_request_id);
create table if not exists public.checkout_settings (
 id boolean primary key default true check(id), shipping_fee_twd integer not null check(shipping_fee_twd>=0), enabled boolean not null default false
);
alter table public.checkout_settings enable row level security;
create policy checkout_settings_read on public.checkout_settings for select to authenticated using(true);
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
  if p_mode='production' then insert into public.shipments(order_id) values(v.id) on conflict(order_id) do nothing; end if;
 end if;
end; $$;
revoke all on function public.confirm_ecpay_payment(text,text,integer,boolean,text) from public,authenticated,anon;
grant execute on function public.confirm_ecpay_payment(text,text,integer,boolean,text) to service_role;
