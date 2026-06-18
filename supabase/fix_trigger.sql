-- ============================================================
-- FIX: Ricrea il trigger per la creazione automatica del profilo
-- ============================================================
-- Incolla questo nel SQL Editor di Supabase e clicca "Run"
-- ============================================================

-- 1. Ricrea la funzione che si attiva quando un utente si registra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'owner'),
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Rimuovi il trigger se esiste già (per evitare duplicati)
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Ricrea il trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4. Ricrea anche il trigger per updated_at sulla tabella profiles
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function update_updated_at();

-- 5. Verifica: questa query deve restituire una riga
select tgname, tgrelid::regclass
from pg_trigger
where tgname = 'on_auth_user_created';
