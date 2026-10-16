-- شغّل الملف ده مرة واحدة في Supabase: SQL Editor > New query > Run

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  kind text not null check (kind in ('section','lecture')),
  number int not null check (number > 0),
  title text not null default '',
  html_path text,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, kind, number)
);

alter table public.items enable row level security;

-- الكل يقرا
create policy "items read" on public.items for select to anon, authenticated using (true);
-- الأدمن (المسجّل دخول) بس يكتب
create policy "items write" on public.items for all to authenticated using (true) with check (true);

-- مخزن الملفات
insert into storage.buckets (id, name, public) values ('files', 'files', true) on conflict (id) do nothing;

create policy "files read"   on storage.objects for select to anon, authenticated using (bucket_id = 'files');
create policy "files insert" on storage.objects for insert to authenticated with check (bucket_id = 'files');
create policy "files update" on storage.objects for update to authenticated using (bucket_id = 'files');
create policy "files delete" on storage.objects for delete to authenticated using (bucket_id = 'files');
