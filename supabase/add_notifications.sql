-- Tabella notifiche in-app
-- Eseguire su Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,            -- appt_cancelled, appt_confirmed, appt_proposal, appt_completed
  title text NOT NULL,
  message text DEFAULT '',
  data jsonb DEFAULT '{}',       -- dati aggiuntivi (apptId, petName, vetName, date, time...)
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indice per caricare velocemente le notifiche di un utente
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
