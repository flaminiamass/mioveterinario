-- Aggiunge la colonna per il motivo di cancellazione da parte del proprietario
-- Eseguire su Supabase SQL Editor PRIMA di usare la nuova funzionalità

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS owner_cancel_reason text;
