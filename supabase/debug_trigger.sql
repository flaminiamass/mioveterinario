-- ============================================================
-- DEBUG: Trova il problema con il trigger di registrazione
-- ============================================================
-- Incolla nel SQL Editor e clicca "Run".
-- Poi mandami lo screenshot del risultato!
-- ============================================================

-- 1. Controlla che la tabella profiles abbia la struttura giusta
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- 2. Controlla se ci sono utenti "orfani" in auth.users (registrazioni fallite)
select id, email, created_at, raw_user_meta_data
from auth.users
order by created_at desc
limit 10;

-- 3. Controlla che il trigger esista e sia collegato giusto
select tgname, tgrelid::regclass, proname
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
where tgrelid = 'auth.users'::regclass;

-- 4. Controlla il codice della funzione trigger
select prosrc
from pg_proc
where proname = 'handle_new_user';

-- 5. Prova a simulare manualmente cosa fa il trigger
-- (inserisce un profilo finto per verificare che la tabella funzioni)
do $$
declare
  test_id uuid := gen_random_uuid();
begin
  -- Simula l'insert che fa il trigger
  insert into profiles (id, role, display_name, email)
  values (test_id, 'owner', 'Test Manuale', 'test@test.it');

  -- Se arriviamo qui, la tabella funziona
  raise notice 'INSERT OK con id: %', test_id;

  -- Pulizia: rimuovi la riga di test
  delete from profiles where id = test_id;
  raise notice 'Pulizia OK';
exception
  when others then
    raise notice 'ERRORE: % - %', sqlerrm, sqlstate;
end;
$$;
