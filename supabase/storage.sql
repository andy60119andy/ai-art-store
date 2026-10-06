-- Run once in Supabase SQL Editor.
insert into storage.buckets (id, name, public)
values ('artwork-uploads', 'artwork-uploads', false)
on conflict (id) do update set public = false;

create policy "users can upload own artwork"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'artwork-uploads'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users can read own artwork"
on storage.objects for select to authenticated
using (
  bucket_id = 'artwork-uploads'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users can delete own artwork"
on storage.objects for delete to authenticated
using (
  bucket_id = 'artwork-uploads'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);