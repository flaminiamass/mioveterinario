-- Campi aggiuntivi per ricerca avanzata e profilo vet arricchito
-- zone: quartiere/zona (es. "Trastevere") — filtro città/zona per mercato italiano
-- languages: lingue parlate (utile in città con proprietari internazionali)
-- cancellation_hours: ore prima per cancellazione gratuita (sostituisce il placeholder [TODO])

ALTER TABLE vets ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE vets ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '["Italiano"]';
ALTER TABLE vets ADD COLUMN IF NOT EXISTS cancellation_hours INTEGER DEFAULT 24;
