-- ============================================================
-- MioVeterinario — Tabella VET_DIRECTORY (schede importate)
-- ============================================================
-- Come usarlo:
-- 1. Vai su Supabase Dashboard → SQL Editor
-- 2. Clicca "New query"
-- 3. Incolla TUTTO questo file
-- 4. Clicca "Run"
-- ============================================================
-- Schede di strutture veterinarie importate da fonti pubbliche
-- (Anagrafe Strutture Veterinarie / FNOVI, file POI TomTom).
-- NON sono profili attivi: niente account, niente prenotazioni.
-- Una scheda diventa visibile ai proprietari solo quando un
-- operatore la pubblica (is_published = true), e resta comunque
-- "non gestita" finché il titolare non la rivendica.
-- Scrive solo il service_role (importer locale): nessuna policy
-- di insert/update/delete per anon/authenticated.
-- ============================================================

create table if not exists vet_directory (
  id                    text primary key,              -- "dir_" + hash stabile generato dalla pipeline
  entity_type           text not null default 'clinic'
                        check (entity_type in ('clinic', 'vet')),
  name                  text not null,
  clinic_name           text default '',
  vet_name              text default '',
  address               text default '',
  city                  text default '',
  province              text default '',               -- sigla, es. "RM"
  phone                 text default '',
  website               text default '',
  lat                   double precision,              -- null se non geolocalizzato
  lng                   double precision,
  services              jsonb not null default '[]',
  species               jsonb not null default '[]',
  specialties           jsonb not null default '[]',
  source_type           text not null default 'anagrafe_strutture_poi',
  source_url            text default '',
  source_collected_at   timestamptz,
  last_verified_at      timestamptz,
  profile_status        text not null default 'needs_review'
                        check (profile_status in ('needs_review', 'reviewed', 'rejected')),
  verification_status   text not null default 'not_verified'
                        check (verification_status in ('not_verified', 'contacted', 'verified')),
  online_booking_status text not null default 'disabled'
                        check (online_booking_status in ('disabled', 'enabled')),
  is_published          boolean not null default false,
  marketing_consent     boolean not null default false,
  outreach_status       text not null default 'not_contacted'
                        check (outreach_status in ('not_contacted', 'contacted', 'responded', 'onboarded', 'opted_out')),
  internal_notes        text default '',
  raw_label             text default '',               -- label OV2 originale, per audit
  claimed_vet_id        uuid references vets(id) on delete set null,  -- futuro claim flow
  claimed_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_vet_directory_published
  on vet_directory(is_published) where is_published = true;
create index if not exists idx_vet_directory_city
  on vet_directory(city);
-- Indice per le query "vicino a me" (bounding box su lat/lng), solo schede pubblicate
create index if not exists idx_vet_directory_latlng
  on vet_directory(lat, lng) where is_published = true;
create index if not exists idx_vet_directory_claimed
  on vet_directory(claimed_vet_id) where claimed_vet_id is not null;

-- Riusa la funzione update_updated_at() già creata da schema.sql
drop trigger if exists trg_vet_directory_updated on vet_directory;
create trigger trg_vet_directory_updated before update on vet_directory
  for each row execute function update_updated_at();

alter table vet_directory enable row level security;

-- Lettura pubblica SOLO delle schede pubblicate (anon + authenticated)
drop policy if exists "read published directory listings" on vet_directory;
create policy "read published directory listings" on vet_directory
  for select using (is_published = true);

-- Nessuna policy insert/update/delete: scrive solo il service_role (bypassa RLS)
