-- شغّل الملف ده مرة واحدة بس في Supabase: SQL Editor > New query > Run
-- (ده لإدارة المواد من لوحة التحكم. ما تشغلش ملف supabase-setup.sql تاني)

create table if not exists public.courses (
  id text primary key,
  year int not null check (year between 1 and 4),
  term int not null check (term in (1, 2)),
  name text not null,
  icon text not null default '📘',
  a text not null default '#2f7bd9',
  b text not null default '#0b1727',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "courses read" on public.courses for select to anon, authenticated using (true);
create policy "courses write" on public.courses for all to authenticated using (true) with check (true);
