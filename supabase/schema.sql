-- ============================================================
-- MioVeterinario — Schema Database Completo
-- ============================================================
-- Come usarlo:
-- 1. Vai su Supabase Dashboard → SQL Editor
-- 2. Clicca "New query"
-- 3. Incolla TUTTO questo file
-- 4. Clicca "Run"
-- 5. Controlla che non ci siano errori in basso
-- ============================================================


-- Abilita generazione UUID
create extension if not exists "uuid-ossp";


-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES (estende gli utenti di Supabase Auth)
-- ──────────────────────────────────────────────────────────────
-- Ogni utente registrato ha una riga qui.
-- Il campo "role" decide se vede l'app da proprietario o da veterinario.
-- ──────────────────────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('owner', 'vet')),
  display_name  text not null default '',
  full_name     text not null default '',
  phone         text default '',
  email         text default '',
  cf            text default '',        -- codice fiscale
  address       text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────
-- 2. SERVICE_CATALOG (catalogo globale servizi — sola lettura)
-- ──────────────────────────────────────────────────────────────
-- I 27 servizi veterinari standard. I veterinari NON modificano
-- questa tabella: personalizzano i prezzi nella tabella vet_services.
-- ──────────────────────────────────────────────────────────────
create table service_catalog (
  id          text primary key,            -- "sv1", "sv2" ecc. (stessi ID del codice)
  category    text not null,
  name        text not null,
  description text default '',
  price       numeric(10,2) not null,      -- prezzo suggerito
  duration    integer not null,            -- durata in minuti
  emoji       text default '',
  sort_order  integer default 0
);


-- ──────────────────────────────────────────────────────────────
-- 3. VETS (profili professionali dei veterinari)
-- ──────────────────────────────────────────────────────────────
-- Collegato al profilo utente tramite user_id.
-- Contiene tutti i dati specifici del veterinario.
-- ──────────────────────────────────────────────────────────────
create table vets (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null unique references profiles(id) on delete cascade,
  status        text not null default 'pending'
                check (status in ('pending', 'verified', 'suspended')),
  name          text not null,
  clinic        text default '',
  city          text default '',
  address       text default '',
  spec          jsonb not null default '[]',          -- ["Medicina generale", "Dermatologia"]
  animals       jsonb not null default '[]',          -- ["Cane", "Gatto"]
  bio           text default '',
  fee_clinic    numeric(10,2),                        -- tariffa visita in clinica
  fee_home      numeric(10,2),                        -- tariffa visita a domicilio
  fee_video     numeric(10,2),                        -- tariffa video consulto
  rating        numeric(3,2) default 0,
  review_count  integer default 0,
  avatar        text default '',                      -- emoji avatar
  types         jsonb not null default '[]',          -- ["clinic", "home", "video"]
  work_days     jsonb not null default '[1,2,3,4,5]', -- 0=Dom, 1=Lun...6=Sab
  piva          text default '',                      -- Partita IVA
  cf            text default '',                      -- Codice Fiscale
  albo          text default '',                      -- N° Albo Veterinari
  regime        text default 'ordinario'
                check (regime in ('ordinario', 'forfettario')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────────
-- 4. VET_SERVICES (servizi attivati per ogni veterinario)
-- ──────────────────────────────────────────────────────────────
-- Ogni riga = "questo veterinario offre questo servizio".
-- Se catalog_id è valorizzato → servizio dal catalogo (con prezzo custom opzionale).
-- Se catalog_id è null → servizio personalizzato creato dal vet.
-- ──────────────────────────────────────────────────────────────
create table vet_services (
  id              uuid primary key default uuid_generate_v4(),
  vet_id          uuid not null references vets(id) on delete cascade,
  catalog_id      text references service_catalog(id) on delete set null,
  custom_name     text,              -- solo per servizi personalizzati
  custom_price    numeric(10,2),     -- null = usa prezzo catalogo
  custom_duration integer,           -- solo per servizi personalizzati
  custom_category text,              -- solo per servizi personalizzati
  custom_emoji    text,              -- solo per servizi personalizzati
  custom_desc     text,              -- solo per servizi personalizzati
  created_at      timestamptz not null default now(),

  -- Un vet può aggiungere ogni servizio del catalogo una sola volta
  unique(vet_id, catalog_id)
);

create index idx_vet_services_vet_id on vet_services(vet_id);


-- ──────────────────────────────────────────────────────────────
-- 5. PETS (animali domestici)
-- ──────────────────────────────────────────────────────────────
-- Collegato al proprietario tramite owner_id.
-- ──────────────────────────────────────────────────────────────
create table pets (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  name        text not null,
  species     text not null default 'Cane',
  breed       text default '',
  dob         date,                        -- data di nascita
  weight      numeric(6,2),                -- peso in kg
  chip        text default '',             -- microchip
  sex         text default '' check (sex in ('', 'M', 'F')),
  photo       text default '',             -- emoji
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_pets_owner on pets(owner_id);


-- ──────────────────────────────────────────────────────────────
-- 6. APPOINTMENTS (appuntamenti)
-- ──────────────────────────────────────────────────────────────
create table appointments (
  id              uuid primary key default uuid_generate_v4(),
  pet_id          uuid not null references pets(id) on delete cascade,
  vet_id          uuid not null references vets(id) on delete cascade,
  owner_id        uuid not null references profiles(id) on delete cascade,
  date            date not null,
  time            text not null,             -- formato "10:00"
  type            text not null default 'clinic'
                  check (type in ('clinic', 'home', 'video')),
  service_id      text references service_catalog(id) on delete set null,
  vet_service_id  uuid references vet_services(id) on delete set null,
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  owner_notes     text default '',
  vet_notes       text default '',
  reject_reason   text default '',
  proposal        jsonb,                     -- {from, date, time, message} o null
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_appts_vet on appointments(vet_id);
create index idx_appts_owner on appointments(owner_id);
create index idx_appts_pet on appointments(pet_id);
create index idx_appts_date on appointments(date);


-- ──────────────────────────────────────────────────────────────
-- 7. REFERTI (referti clinici)
-- ──────────────────────────────────────────────────────────────
create table referti (
  id          uuid primary key default uuid_generate_v4(),
  appt_id     uuid not null references appointments(id) on delete cascade,
  pet_id      uuid not null references pets(id) on delete cascade,
  vet_id      uuid not null references vets(id) on delete cascade,
  date        date not null default current_date,
  title       text not null,
  diagnosis   text not null,
  treatments  text default '',
  drugs       text default '',
  advice      text default '',
  next_visit  text default '',             -- nel codice si chiama "next"
  created_at  timestamptz not null default now()
);

create index idx_referti_pet on referti(pet_id);
create index idx_referti_vet on referti(vet_id);
create index idx_referti_appt on referti(appt_id);


-- ──────────────────────────────────────────────────────────────
-- 8. INVOICES (fatture)
-- ──────────────────────────────────────────────────────────────
-- Il campo "items" è JSONB perché è un blocco unico [{desc, qty, price}]
-- che viene sempre caricato e salvato intero.
-- ──────────────────────────────────────────────────────────────
create table invoices (
  id            uuid primary key default uuid_generate_v4(),
  appt_id       uuid references appointments(id) on delete set null,
  vet_id        uuid not null references vets(id) on delete cascade,
  client_id     uuid references profiles(id) on delete set null,
  date          date not null default current_date,
  number        text not null,               -- formato "1/2026"
  payment       text default 'POS',
  items         jsonb not null default '[]', -- [{desc, qty, price}]
  enpav         numeric(10,2) default 0,
  iva           numeric(10,2) default 0,
  bollo         numeric(10,2) default 0,
  total         numeric(10,2) not null default 0,
  status        text not null default 'unpaid'
                check (status in ('unpaid', 'paid')),
  dest_name     text default '',             -- snapshot dati destinatario
  dest_cf       text default '',
  dest_address  text default '',
  dest_email    text default '',
  dest_phone    text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_invoices_vet on invoices(vet_id);
create index idx_invoices_client on invoices(client_id);


-- ──────────────────────────────────────────────────────────────
-- 9. REVIEWS (recensioni)
-- ──────────────────────────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  vet_id      uuid not null references vets(id) on delete cascade,
  appt_id     uuid references appointments(id) on delete set null,
  author_id   uuid not null references profiles(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text not null default '',
  reply       text,                          -- risposta del vet (null = non ancora risposto)
  date        date not null default current_date,
  author_name text default '',               -- nome visualizzato (denormalizzato)
  created_at  timestamptz not null default now()
);

create index idx_reviews_vet on reviews(vet_id);


-- ──────────────────────────────────────────────────────────────
-- 10. VACCINES (vaccini)
-- ──────────────────────────────────────────────────────────────
create table vaccines (
  id          uuid primary key default uuid_generate_v4(),
  pet_id      uuid not null references pets(id) on delete cascade,
  name        text not null,
  date        date not null,
  due         date,                          -- null = nessun richiamo
  vet_name    text default '',               -- nome vet (testo, non FK)
  created_at  timestamptz not null default now()
);

create index idx_vaccines_pet on vaccines(pet_id);


-- ══════════════════════════════════════════════════════════════
-- TRIGGER: aggiorna automaticamente "updated_at"
-- ══════════════════════════════════════════════════════════════

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function update_updated_at();
create trigger trg_vets_updated before update on vets
  for each row execute function update_updated_at();
create trigger trg_pets_updated before update on pets
  for each row execute function update_updated_at();
create trigger trg_appts_updated before update on appointments
  for each row execute function update_updated_at();
create trigger trg_invoices_updated before update on invoices
  for each row execute function update_updated_at();


-- ══════════════════════════════════════════════════════════════
-- TRIGGER: crea profilo automaticamente alla registrazione
-- ══════════════════════════════════════════════════════════════
-- Quando un utente si registra, il suo ruolo e nome vengono
-- salvati nei "metadati" della registrazione. Questo trigger
-- crea automaticamente la riga nella tabella profiles.
-- ══════════════════════════════════════════════════════════════

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ══════════════════════════════════════════════════════════════
-- SEED: Catalogo servizi veterinari (27 servizi)
-- ══════════════════════════════════════════════════════════════
-- Questi sono i servizi standard. I veterinari li personalizzano
-- nella tabella vet_services (dove possono cambiare prezzo o
-- aggiungere servizi personalizzati).
-- ══════════════════════════════════════════════════════════════

insert into service_catalog (id, category, name, description, price, duration, emoji, sort_order) values
  ('sv1',  'Visite',      'Visita generale',                      'Controllo salute completo con auscultazione e palpazione',                    50,  30, '🩺',  1),
  ('sv2',  'Visite',      'Prima visita cucciolo/gattino',         'Primo controllo, consigli su alimentazione e vaccinazioni',                   50,  30, '🐣',  2),
  ('sv3',  'Visite',      'Visita dermatologica',                  'Esame cute, pelo, prurito, allergie e dermatiti',                             65,  40, '🔬',  3),
  ('sv4',  'Visite',      'Visita oculistica',                     'Controllo occhi, pressione intraoculare, fondo oculare',                     90,  45, '👁️', 4),
  ('sv5',  'Visite',      'Visita ortopedica',                     'Valutazione articolazioni, zoppia, displasia',                               65,  40, '🦴',  5),
  ('sv6',  'Visite',      'Visita a domicilio',                    'Il veterinario viene a casa tua',                                            80,  45, '🏠',  6),
  ('sv7',  'Visite',      'Video consulto',                        'Consulenza online per dubbi e controlli rapidi',                             35,  20, '📹',  7),
  ('sv8',  'Visite',      'Visita d''urgenza',                     'Per situazioni urgenti che richiedono attenzione immediata',                  85,  30, '🚨',  8),
  ('sv9',  'Vaccini',     'Vaccino polivalente cane',              'Protezione da cimurro, parvovirosi, epatite, leptospirosi',                  55,  20, '💉',  9),
  ('sv10', 'Vaccini',     'Vaccino trivalente gatto',              'Protezione da panleucopenia, calicivirus, herpesvirus',                      60,  20, '💉', 10),
  ('sv11', 'Vaccini',     'Vaccino antirabbica',                   'Obbligatorio per viaggi all''estero e passaporto europeo',                   65,  20, '💉', 11),
  ('sv12', 'Vaccini',     'Vaccino coniglio Mixo-RHD',             'Protezione da mixomatosi e malattia emorragica',                             85,  20, '💉', 12),
  ('sv13', 'Analisi',     'Analisi sangue (emocromo + biochimico)','Esame completo del sangue con profilo biochimico',                          110,  20, '🩸', 13),
  ('sv14', 'Analisi',     'Test leishmania',                       'Screening anticorpi per leishmaniosi canina',                                50,  15, '🧪', 14),
  ('sv15', 'Analisi',     'Test FIV/FeLV',                         'Test immunodeficienza felina e leucemia felina',                             50,  15, '🧪', 15),
  ('sv16', 'Analisi',     'Esame urine',                           'Analisi chimico-fisica e sedimento urinario',                               35,  15, '🧫', 16),
  ('sv17', 'Analisi',     'Esame filaria',                         'Test antigene per filariosi cardiopolmonare',                                35,  15, '🧪', 17),
  ('sv18', 'Analisi',     'Check-up completo',                     'Visita + analisi sangue + urine per un quadro completo',                   110,  30, '📋', 18),
  ('sv19', 'Diagnostica', 'Radiografia',                           'Immagine radiografica di torace, addome o arti',                             55,  20, '📷', 19),
  ('sv20', 'Diagnostica', 'Ecografia addominale',                  'Visualizzazione organi addominali con ultrasuoni',                           85,  30, '📡', 20),
  ('sv21', 'Diagnostica', 'Ecocardiografia',                       'Ecografia del cuore per valutare funzionalità cardiaca',                   130,  40, '❤️', 21),
  ('sv22', 'Chirurgia',   'Sterilizzazione gatta',                 'Ovariectomia o ovarioisterectomia in anestesia generale',                   180,  60, '🏥', 22),
  ('sv23', 'Chirurgia',   'Castrazione gatto',                     'Orchiectomia in anestesia generale',                                       135,  45, '🏥', 23),
  ('sv24', 'Chirurgia',   'Ablazione tartaro',                     'Pulizia dentale professionale con ultrasuoni in sedazione',                 200,  60, '🦷', 24),
  ('sv25', 'Altro',       'Inserimento microchip',                 'Impianto microchip identificativo e registrazione anagrafe',                 40,  15, '📟', 25),
  ('sv26', 'Altro',       'Certificato sanitario',                 'Certificato di buona salute per viaggi o adozione',                          30,  15, '📋', 26),
  ('sv27', 'Altro',       'Passaporto europeo',                    'Documenti per viaggiare con l''animale nell''UE',                            50,  20, '🛂', 27);


-- ══════════════════════════════════════════════════════════════
-- FINE SCHEMA
-- ══════════════════════════════════════════════════════════════
-- Se sei arrivata fin qui senza errori, il database è pronto! 🎉
-- Vai su Table Editor per vedere le 10 tabelle create.
-- La tabella service_catalog dovrebbe avere 27 righe.
-- ══════════════════════════════════════════════════════════════
