-- Apply in a test project before enabling the new server APIs.
-- Never delete existing duplicate results automatically.
do $$ begin
  if exists (select 1 from public.artwork_versions where generation_job_id is not null group by generation_job_id having count(*) > 1) then
    raise exception 'Resolve duplicate generation results before applying 0011';
  end if;
end $$;
alter table public.uploads add column if not exists verified_at timestamptz;
alter table public.uploads add column if not exists sha256 text;
alter table public.generation_jobs add column if not exists idempotency_key uuid;
alter table public.generation_jobs add column if not exists request_hash text;
alter table public.generation_jobs add column if not exists lease_token uuid;
alter table public.generation_jobs add column if not exists lease_expires_at timestamptz;
alter table public.generation_jobs add column if not exists result_version_id uuid references public.artwork_versions(id) on delete set null;
create unique index if not exists generation_idempotency_idx on public.generation_jobs(user_id,idempotency_key) where idempotency_key is not null;
create unique index if not exists generation_result_idx on public.artwork_versions(generation_job_id) where generation_job_id is not null;
-- Clients can read their jobs, but cannot forge successful results or change roles.
revoke insert, update, delete on public.generation_jobs from authenticated, anon;
revoke insert, update, delete on public.uploads from authenticated, anon;
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

create or replace function public.enqueue_generation(p_user_id uuid,p_upload_id uuid,p_style_key text,p_prompt text,p_key uuid,p_hash text)
returns public.generation_jobs language plpgsql security definer set search_path=public as $$
declare v_job public.generation_jobs%rowtype;
begin
  -- Serialize per user: idempotency and per-day quota are checked together.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  select * into v_job from public.generation_jobs where user_id=p_user_id and idempotency_key=p_key;
  if found then
    if v_job.request_hash is distinct from p_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return v_job;
  end if;
  if not exists(select 1 from public.uploads where id=p_upload_id and user_id=p_user_id and verified_at is not null) then raise exception 'UPLOAD_NOT_VERIFIED'; end if;
  if (select count(*) from public.generation_jobs where user_id=p_user_id and created_at >= date_trunc('day',now() at time zone 'Asia/Taipei') at time zone 'Asia/Taipei') >= 10 then raise exception 'GENERATION_QUOTA_EXCEEDED'; end if;
  if (select count(*) from public.generation_jobs where user_id=p_user_id and status in ('queued','processing') and created_at>now()-interval '10 minutes') >= 2 then raise exception 'GENERATION_CONCURRENCY_LIMIT'; end if;
  insert into public.generation_jobs(user_id,upload_id,style_key,prompt,idempotency_key,request_hash)
  values(p_user_id,p_upload_id,p_style_key,p_prompt,p_key,p_hash) returning * into v_job;
  return v_job;
end $$;

create or replace function public.claim_generation(p_job_id uuid,p_user_id uuid,p_token uuid)
returns setof public.generation_jobs language sql security definer set search_path=public as $$
  update public.generation_jobs set status='processing',started_at=now(),error_message=null,lease_token=p_token,lease_expires_at=now()+interval '5 minutes'
  where id=p_job_id and user_id=p_user_id and status='queued' returning *;
$$;

create or replace function public.finish_generation(p_job_id uuid,p_user_id uuid,p_token uuid,p_path text,p_width integer,p_height integer,p_provider_id text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_job public.generation_jobs%rowtype; v_art uuid; v_version uuid;
begin
  select * into v_job from public.generation_jobs where id=p_job_id and user_id=p_user_id for update;
  if not found then raise exception 'GENERATION_NOT_FOUND'; end if;
  if v_job.status='succeeded' then select artwork_id into v_art from public.artwork_versions where id=v_job.result_version_id; return v_art; end if;
  if v_job.status<>'processing' or v_job.lease_token is distinct from p_token then raise exception 'GENERATION_CLAIM_LOST'; end if;
  if p_path not like p_user_id::text||'/generations/'||p_job_id::text||'/%' or p_width<=0 or p_height<=0 then raise exception 'INVALID_GENERATION_RESULT'; end if;
  insert into public.artworks(user_id,title,status) values(p_user_id,'AI Generated Artwork','ready') returning id into v_art;
  insert into public.artwork_versions(artwork_id,generation_job_id,storage_path,width_px,height_px,version_no) values(v_art,p_job_id,p_path,p_width,p_height,1) returning id into v_version;
  update public.generation_jobs set status='succeeded',completed_at=now(),provider_job_id=p_provider_id,result_version_id=v_version,lease_expires_at=null where id=p_job_id;
  return v_art;
end $$;
revoke all on function public.enqueue_generation(uuid,uuid,text,text,uuid,text) from public,anon,authenticated;
revoke all on function public.claim_generation(uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.finish_generation(uuid,uuid,uuid,text,integer,integer,text) from public,anon,authenticated;
grant execute on function public.enqueue_generation(uuid,uuid,text,text,uuid,text) to service_role;
grant execute on function public.claim_generation(uuid,uuid,uuid) to service_role;
grant execute on function public.finish_generation(uuid,uuid,uuid,text,integer,integer,text) to service_role;

create table if not exists public.support_requests (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),name text not null,email text not null,topic text not null,order_reference text,message text not null check(length(message)<=5000),created_at timestamptz not null default now()
);
alter table public.support_requests enable row level security;
create policy support_owner_read on public.support_requests for select to authenticated using(user_id=auth.uid());
create policy support_admin_read on public.support_requests for select to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
revoke insert,update,delete on public.support_requests from authenticated,anon;
