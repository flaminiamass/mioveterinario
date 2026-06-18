-- ============================================================
-- Aggiunge la colonna avatar alla tabella profiles
-- ============================================================
-- Incolla nel SQL Editor di Supabase e clicca "Run"
-- ============================================================

-- Aggiunge avatar (emoji) ai profili proprietario
alter table public.profiles
  add column if not exists avatar text default '';
