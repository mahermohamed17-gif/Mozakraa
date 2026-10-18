-- شغّل الملف ده مرة واحدة بس في Supabase: SQL Editor > New query > Run
-- (ده لعدّاد الزوار في لوحة التحكم)

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  device text,
  created_at timestamptz not null default now()
);

alter table public.visits enable row level security;

-- أي زائر يسجّل زيارته، لكن الأدمن بس يقرا الأرقام
create policy "visits insert" on public.visits for insert to anon, authenticated with check (true);
create policy "visits read" on public.visits for select to authenticated using (true);
