create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  app_url text not null,
  icon_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;

drop policy if exists "Anyone can view active applications" on public.applications;
create policy "Anyone can view active applications"
  on public.applications for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can insert applications" on public.applications;
create policy "Admins can insert applications"
  on public.applications for insert
  with check (public.is_admin());

drop policy if exists "Admins can update applications" on public.applications;
create policy "Admins can update applications"
  on public.applications for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete applications" on public.applications;
create policy "Admins can delete applications"
  on public.applications for delete
  using (public.is_admin());

create index if not exists applications_display_order_idx
  on public.applications (display_order, created_at desc);

drop trigger if exists applications_set_updated_at on public.applications;
create or replace function public.set_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_applications_updated_at();
