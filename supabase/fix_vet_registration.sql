-- ============================================================
-- Aggiorna il trigger di registrazione per creare anche il
-- profilo veterinario automaticamente quando role = 'vet'.
-- ============================================================
-- Incolla nel SQL Editor di Supabase e clicca "Run"
-- ============================================================

-- 1. Rimuovi il trigger e la funzione vecchia
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Ricrea la funzione con supporto per il profilo vet
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Crea il profilo base (per tutti gli utenti)
  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'owner'),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.email, '')
  );

  -- Se è un veterinario, crea anche la riga nella tabella vets
  if coalesce(new.raw_user_meta_data ->> 'role', 'owner') = 'vet' then
    insert into public.vets (user_id, name, status, types)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'display_name', 'Veterinario'),
      'verified',
      '["clinic"]'::jsonb
    );
  end if;

  return new;
end;
$$;

-- 3. Ricrea il trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 4. Permessi
grant usage on schema public to supabase_auth_admin;
grant insert on public.profiles to supabase_auth_admin;
grant insert on public.vets to supabase_auth_admin;

-- 5. Verifica
select tgname, tgenabled
from pg_trigger
where tgname = 'on_auth_user_created';
