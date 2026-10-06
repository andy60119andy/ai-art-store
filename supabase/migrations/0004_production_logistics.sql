create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','production'))
$$;

create policy production_files_staff_select on public.production_files for select using (public.is_staff());
create policy shipments_staff_select on public.shipments for select using (public.is_staff());

create or replace function public.update_production_status(
  p_production_file_id uuid,
  p_status public.production_status
)
returns public.production_files
language plpgsql security definer set search_path = public as $$
declare v_row public.production_files;
begin
  if not public.is_staff() then raise exception 'forbidden'; end if;
  update public.production_files
  set production_status = p_status
  where id = p_production_file_id
  returning * into v_row;
  if v_row.id is null then raise exception 'production file not found'; end if;
  update public.orders o
  set status = case
    when p_status = 'completed' then 'processing'::public.order_status
    when p_status in ('printing','framing','packed','ready') then 'in_production'::public.order_status
    else o.status end
  where o.id = (select oi.order_id from public.order_items oi where oi.id = v_row.order_item_id);
  return v_row;
end $$;

grant execute on function public.update_production_status(uuid,public.production_status) to authenticated;
revoke execute on function public.update_production_status(uuid,public.production_status) from public;

create or replace function public.update_shipment(
  p_shipment_id uuid,
  p_carrier text,
  p_tracking_number text,
  p_status public.shipment_status
)
returns public.shipments
language plpgsql security definer set search_path = public as $$
declare v_row public.shipments;
begin
  if not public.is_staff() then raise exception 'forbidden'; end if;
  update public.shipments
  set carrier = nullif(trim(p_carrier), ''),
      tracking_number = nullif(trim(p_tracking_number), ''),
      status = p_status,
      shipped_at = case when p_status in ('shipped','in_transit','delivered') then coalesce(shipped_at, now()) else shipped_at end,
      delivered_at = case when p_status = 'delivered' then coalesce(delivered_at, now()) else delivered_at end
  where id = p_shipment_id
  returning * into v_row;
  if v_row.id is null then raise exception 'shipment not found'; end if;
  update public.orders
  set status = case when p_status = 'delivered' then 'completed'::public.order_status
                   when p_status in ('shipped','in_transit') then 'shipped'::public.order_status
                   else status end
  where id = v_row.order_id;
  return v_row;
end $$;

grant execute on function public.update_shipment(uuid,text,text,public.shipment_status) to authenticated;
revoke execute on function public.update_shipment(uuid,text,text,public.shipment_status) from public;
