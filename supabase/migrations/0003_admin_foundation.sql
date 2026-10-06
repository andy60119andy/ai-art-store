create policy orders_staff_select on public.orders
for select using (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','production'))
);

create policy order_items_staff_select on public.order_items
for select using (
  exists(select 1 from public.orders o join public.profiles p on p.id=auth.uid()
    where o.id=order_id and p.role in ('admin','production'))
);

create policy payments_staff_select on public.payments
for select using (
  exists(select 1 from public.orders o join public.profiles p on p.id=auth.uid()
    where o.id=order_id and p.role in ('admin','production'))
);

create policy shipments_staff_select on public.shipments
for select using (
  exists(select 1 from public.orders o join public.profiles p on p.id=auth.uid()
    where o.id=order_id and p.role in ('admin','production'))
);

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare v_order public.orders%rowtype;
begin
  if not exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','production')) then
    raise exception 'FORBIDDEN';
  end if;

  update public.orders
    set status=p_status, updated_at=now()
    where id=p_order_id
    returning * into v_order;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  return v_order;
end;
$$;

revoke all on function public.admin_update_order_status(uuid,public.order_status) from public;
grant execute on function public.admin_update_order_status(uuid,public.order_status) to authenticated;
