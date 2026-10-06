create type public.notification_type as enum ('order','payment','production','shipment','system');
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null, title text not null, body text not null, order_id uuid references public.orders(id) on delete set null,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications(user_id,created_at desc);
alter table public.notifications enable row level security;
create policy notifications_owner_select on public.notifications for select using(user_id=auth.uid());
create policy notifications_owner_update on public.notifications for update using(user_id=auth.uid()) with check(user_id=auth.uid());
create or replace function public.create_order_notification(p_user_id uuid,p_type public.notification_type,p_title text,p_body text,p_order_id uuid default null)
returns public.notifications language plpgsql security definer set search_path=public as $$
declare v public.notifications; begin insert into public.notifications(user_id,type,title,body,order_id) values(p_user_id,p_type,p_title,p_body,p_order_id) returning * into v; return v; end $$;
grant execute on function public.create_order_notification(uuid,public.notification_type,text,text,uuid) to authenticated;
revoke execute on function public.create_order_notification(uuid,public.notification_type,text,text,uuid) from public;
