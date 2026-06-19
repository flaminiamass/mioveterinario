-- Optional: chat messages table for MioVeterinario.
-- App has localStorage fallback when this migration is not applied.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  owner_id uuid references profiles(id) on delete cascade,
  vet_id uuid references vets(id) on delete cascade,
  appt_id uuid references appointments(id) on delete set null,
  sender_role text not null check (sender_role in ('owner', 'vet')),
  sender_name text default '',
  text text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_thread on messages(thread_id, created_at);
create index if not exists idx_messages_owner on messages(owner_id, created_at desc);
create index if not exists idx_messages_vet on messages(vet_id, created_at desc);
