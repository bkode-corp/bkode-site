-- Leads captured by the BKode site contact form.
-- Security model: the site's API route inserts with the publishable (anon) key.
-- anon may INSERT a fixed set of columns and nothing else: no SELECT, UPDATE or DELETE.
-- Reading and triaging leads happens in the Supabase dashboard (service role) only.

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 2 and 120),
  contact      text not null check (char_length(contact) between 5 and 160),
  segment      text not null check (segment in ('empresa', 'microempreendedor', 'profissional', 'estudante')),
  message      text not null check (char_length(message) between 10 and 2000),
  source_path  text check (source_path is null or char_length(source_path) <= 200),
  status       text not null default 'novo'
               check (status in ('novo', 'em_contato', 'proposta', 'fechado', 'descartado'))
);

comment on table public.leads is 'Contact form submissions from the BKode website.';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status) where status <> 'descartado';

alter table public.leads enable row level security;

-- Column-level grants: anon cannot set id, created_at or status.
revoke all on table public.leads from anon, authenticated;
grant insert (name, contact, segment, message, source_path) on table public.leads to anon;

drop policy if exists "Site form can insert leads" on public.leads;
create policy "Site form can insert leads"
  on public.leads
  for insert
  to anon
  with check (status = 'novo');
