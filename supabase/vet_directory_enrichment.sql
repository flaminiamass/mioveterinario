-- ============================================================
-- MioVeterinario — Estensione RETROCOMPATIBILE di VET_DIRECTORY
-- Campi di arricchimento prodotti dalla ricerca incrociata (CSV enriched)
-- ============================================================
-- Come usarlo:
-- 1. Supabase Dashboard → SQL Editor → New query
-- 2. Incolla TUTTO questo file (dopo aver già eseguito vet_directory.sql)
-- 3. Run
-- ============================================================
-- È idempotente: usa ADD COLUMN IF NOT EXISTS e ricrea i CHECK.
-- Non tocca i dati esistenti né i componenti che leggono il vecchio formato.
-- ============================================================

-- ── Nuove colonne di arricchimento (fonte: CSV enriched) ──
alter table vet_directory add column if not exists official_website_found     boolean default false;
alter table vet_directory add column if not exists website_status             text default 'not_checked';
alter table vet_directory add column if not exists fnovi_registry_source      text default '';
alter table vet_directory add column if not exists albo_match_status          text default 'not_checked';
alter table vet_directory add column if not exists google_place_id            text default '';
alter table vet_directory add column if not exists google_business_status     text default 'not_checked';
alter table vet_directory add column if not exists external_reputation_signal text default 'not_checked';
alter table vet_directory add column if not exists activity_status            text default 'uncertain';
alter table vet_directory add column if not exists activity_confidence        integer;
alter table vet_directory add column if not exists source_urls                jsonb not null default '[]';
alter table vet_directory add column if not exists evidence_notes             text default '';
alter table vet_directory add column if not exists recommended_profile_status text default 'needs_review';
alter table vet_directory add column if not exists needs_manual_review        boolean not null default false;
-- Claim del titolare: array di richieste (id utente, timestamp, stato) — futuro claim flow.
alter table vet_directory add column if not exists claim_requests             jsonb not null default '[]';

-- ── Espansione dei CHECK per accogliere i nuovi stati ──
-- profile_status: aggiunge published_unclaimed, hidden, claim_requested, claimed, active, verified.
alter table vet_directory drop constraint if exists vet_directory_profile_status_check;
alter table vet_directory add constraint vet_directory_profile_status_check
  check (profile_status in (
    'needs_review', 'reviewed', 'rejected',
    'published_unclaimed', 'hidden',
    'claim_requested', 'claimed', 'active', 'verified'
  ));

-- verification_status: aggiunge pending.
alter table vet_directory drop constraint if exists vet_directory_verification_status_check;
alter table vet_directory add constraint vet_directory_verification_status_check
  check (verification_status in ('not_verified', 'pending', 'contacted', 'verified'));

-- online_booking_status: invariato (disabled/enabled) — ricreato per sicurezza.
alter table vet_directory drop constraint if exists vet_directory_online_booking_status_check;
alter table vet_directory add constraint vet_directory_online_booking_status_check
  check (online_booking_status in ('disabled', 'enabled'));

-- ── Indici utili al backoffice/sync ──
create index if not exists idx_vet_directory_activity
  on vet_directory(activity_status);
create index if not exists idx_vet_directory_needs_review
  on vet_directory(needs_manual_review) where needs_manual_review = true;

-- ── Nota sulla lettura pubblica ──
-- La policy "read published directory listings" (is_published = true) resta valida:
-- le schede hidden/needs_review/closed hanno is_published = false e non sono leggibili
-- da anon/authenticated. Il client applica comunque un ulteriore filtro difensivo
-- su activity_status (likely_closed/closed/removed) e profile_status = 'hidden'.
