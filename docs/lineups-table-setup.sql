-- Recreate the `lineups` table with owner_id and RLS baked in from the start.
-- Run as a single script in the Supabase SQL Editor.
-- Safe to re-run after an accidental table deletion — creates table, enables
-- RLS, and adds policies in one transaction so there's no unprotected window.

create table lineups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team text not null check (team in ('NSW','QLD')),
  name text not null,
  slots jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lineups enable row level security;

create policy "users read their own lineups"
  on lineups for select
  to authenticated
  using (owner_id = auth.uid());

create policy "users insert their own lineups"
  on lineups for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "users update their own lineups"
  on lineups for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "users delete their own lineups"
  on lineups for delete
  to authenticated
  using (owner_id = auth.uid());
