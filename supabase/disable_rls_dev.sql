-- ============================================================
-- MioVeterinario — Disabilita RLS per sviluppo
-- ============================================================
-- La Row Level Security verrà riattivata nella Fase 5 con
-- le regole giuste. Per ora la disabilitiamo per non bloccare
-- letture e scritture durante lo sviluppo.
--
-- Incolla questo nel SQL Editor di Supabase e clicca "Run"
-- ============================================================

alter table profiles        disable row level security;
alter table vets            disable row level security;
alter table vet_services    disable row level security;
alter table service_catalog disable row level security;
alter table pets            disable row level security;
alter table appointments    disable row level security;
alter table referti         disable row level security;
alter table invoices        disable row level security;
alter table reviews         disable row level security;
alter table vaccines        disable row level security;

-- Verifica: questa query deve restituire tutte le tabelle con rls_enabled = false
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
