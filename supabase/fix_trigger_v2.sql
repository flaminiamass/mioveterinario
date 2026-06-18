-- ============================================================
-- FIX V2: Risolve il problema del trigger di registrazione
-- ============================================================
-- Il problema: profiles.id ha un vincolo FK verso auth.users(id).
-- Il trigger AFTER INSERT dovrebbe funzionare, ma potrebbe
-- esserci un problema di permessi o di struttura.
--
-- Soluzione: ricreiamo tutto da zero con i permessi corretti.
-- Incolla nel SQL Editor e clicca "Run"
-- ============================================================

-- 1. Prima, elimina eventuali utenti orfani dalle registrazioni fallite
-- (la registrazione crea l'utente in auth.users ma il trigger fallisce)
delete from auth.users where id not in (select id from profiles);

-- 2. Rimuovi il trigger vecchio
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Rimuovi la funzione vecchia
drop function if exists handle_new_user();

-- 4. Ricrea la funzione con permessi completi
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'owner'),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

-- 5. Ricrea il trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 6. Assicuriamoci che la funzione abbia i permessi giusti
grant usage on schema public to supabase_auth_admin;
grant insert on public.profiles to supabase_auth_admin;

-- 7. Verifica: mostra il trigger creato
select tgname, tgrelid::regclass, tgenabled
from pg_trigger
where tgname = 'on_auth_user_created';
