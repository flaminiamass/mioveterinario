-- Optional: owner favorite vets table.
-- App has localStorage fallback when this migration is not applied.

create table if not exists favorite_vets (
  owner_id uuid not null references profiles(id) on delete cascade,
  vet_id uuid not null references vets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, vet_id)
);

create index if not exists idx_favorite_vets_owner on favorite_vets(owner_id, created_at desc);
