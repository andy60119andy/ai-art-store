create or replace function public.update_production_status(p_production_file_id uuid,p_status public.production_status)
returns public.production_files language plpgsql security definer set search_path=public as $$
declare v public.production_files; v_user uuid; v_order uuid; begin
 if not public.is_staff() then raise exception 'forbidden'; end if;
 update public.production_files set production_status=p_status where id=p_production_file_id returning * into v;
 if v.id is null then raise exception 'production file not found'; end if;
 select o.user_id,o.id into v_user,v_order from public.order_items oi join public.orders o on o.id=oi.order_id where oi.id=v.order_item_id;
 update public.orders set status=case when p_status='completed' then 'processing'::public.order_status when p_status in ('ready','printing','framing','packed') then 'in_production'::public.order_status else status end where id=v_order;
 perform public.create_order_notification(v_user,'production'::public.notification_type,'作品製作進度更新','您的作品目前進度：'||p_status::text,v_order);
 return v; end $$;
create or replace function public.update_shipment(p_shipment_id uuid,p_carrier text,p_tracking_number text,p_status public.shipment_status)
returns public.shipments language plpgsql security definer set search_path=public as $$
declare v public.shipments; v_user uuid; begin
 if not public.is_staff() then raise exception 'forbidden'; end if;
 update public.shipments set carrier=nullif(trim(p_carrier),''),tracking_number=nullif(trim(p_tracking_number),''),status=p_status,shipped_at=case when p_status in ('shipped','in_transit','delivered') then coalesce(shipped_at,now()) else shipped_at end,delivered_at=case when p_status='delivered' then coalesce(delivered_at,now()) else delivered_at end where id=p_shipment_id returning * into v;
 if v.id is null then raise exception 'shipment not found'; end if;
 select user_id into v_user from public.orders where id=v.order_id;
 update public.orders set status=case when p_status='delivered' then 'completed'::public.order_status when p_status in ('shipped','in_transit') then 'shipped'::public.order_status else status end where id=v.order_id;
 perform public.create_order_notification(v_user,'shipment'::public.notification_type,'物流進度更新','物流狀態：'||p_status::text||case when v.tracking_number is not null then '，追蹤單號：'||v.tracking_number else '' end,v.order_id);
 return v; end $$;
