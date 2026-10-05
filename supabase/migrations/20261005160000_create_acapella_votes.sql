create table if not exists public.acapella_votes (
  id uuid primary key default gen_random_uuid(),
  acapella_id uuid not null references public.acapellas(id) on delete cascade,
  choice text not null,
  suggestion text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists acapella_votes_acapella_id_idx on public.acapella_votes(acapella_id);

alter table public.acapella_votes enable row level security;

drop policy if exists "Anyone can read acapella votes" on public.acapella_votes;
create policy "Anyone can read acapella votes"
on public.acapella_votes for select
using (true);

drop policy if exists "Anyone can submit acapella votes" on public.acapella_votes;
create policy "Anyone can submit acapella votes"
on public.acapella_votes for insert
with check (true);