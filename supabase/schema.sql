-- =====================================================================
-- Shema za obrasce (Supabase, besplatni tier).
-- Pokretanje: Supabase Dashboard -> SQL Editor -> zalijepi i pokreni.
--
-- Sigurnosni model:
--   * posjetitelji (uloga anon) smiju SAMO dodati prijavu i učitati sken,
--     ne mogu čitati, mijenjati ni brisati tuđe prijave;
--   * djelatnici (prijavljeni korisnici, uloga authenticated) čitaju i mijenjaju status.
--   Korisnike za tajništvo dodajte ručno: Authentication -> Users -> Add user,
--   a javnu registraciju isključite (Authentication -> Providers -> Email -> "Allow new users to sign up" = off).
-- =====================================================================

create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  type            text not null check (type in ('izostanak', 'ispis', 'kontakt')),
  child_name      text check (char_length(child_name) <= 120),
  parent_name     text not null check (char_length(parent_name) between 2 and 120),
  parent_contact  text not null check (char_length(parent_contact) <= 200),
  date            date,
  details         jsonb not null default '{}'::jsonb check (pg_column_size(details) < 8000),
  attachment_path text,
  status          text not null default 'nova' check (status in ('nova', 'u_obradi', 'rijeseno'))
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_type_idx on public.submissions (type);

alter table public.submissions enable row level security;

drop policy if exists "anon_insert" on public.submissions;
create policy "anon_insert" on public.submissions
  for insert to anon, authenticated
  with check (status = 'nova' and attachment_path is null);

drop policy if exists "staff_select" on public.submissions;
create policy "staff_select" on public.submissions
  for select to authenticated using (true);

drop policy if exists "staff_update" on public.submissions;
create policy "staff_update" on public.submissions
  for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- Storage: privatni bucket za potpisane skenove zahtjeva za ispis
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('skenovi', 'skenovi', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "anon_upload_scan" on storage.objects;
create policy "anon_upload_scan" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'skenovi');

drop policy if exists "staff_read_scan" on storage.objects;
create policy "staff_read_scan" on storage.objects
  for select to authenticated
  using (bucket_id = 'skenovi');

-- ---------------------------------------------------------------------
-- E-mail obavijest: Database Webhook
-- Dashboard -> Database -> Webhooks -> Create:
--   tablica public.submissions, događaj INSERT,
--   tip "Supabase Edge Functions" -> notify-submission
-- Funkcija: supabase/functions/notify-submission/index.ts
-- ---------------------------------------------------------------------
