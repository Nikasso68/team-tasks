-- ============================================================
-- Schéma "Team Tasks" — à coller dans Supabase > SQL Editor
-- ============================================================

-- Extension pour générer des UUID
create extension if not exists "pgcrypto";

-- Table des profils (un par utilisateur inscrit)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- Table des dossiers (équivalent "pages/espaces" Notion)
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#2383e2',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Table des tâches
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  assignee_id uuid references public.profiles(id),
  due_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Mise à jour automatique de updated_at sur les tâches
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Sécurité (RLS) : toute personne connectée de l'équipe
-- peut lire/écrire — c'est un outil interne, pas public.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.tasks enable row level security;

create policy "profiles visibles par les connectés"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles modifiables par soi-même"
  on public.profiles for update
  using (auth.uid() = id);

create policy "dossiers visibles par les connectés"
  on public.folders for select
  using (auth.role() = 'authenticated');

create policy "dossiers créables par les connectés"
  on public.folders for insert
  with check (auth.role() = 'authenticated');

create policy "dossiers modifiables par les connectés"
  on public.folders for update
  using (auth.role() = 'authenticated');

create policy "dossiers supprimables par les connectés"
  on public.folders for delete
  using (auth.role() = 'authenticated');

create policy "tâches visibles par les connectés"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "tâches créables par les connectés"
  on public.tasks for insert
  with check (auth.role() = 'authenticated');

create policy "tâches modifiables par les connectés"
  on public.tasks for update
  using (auth.role() = 'authenticated');

create policy "tâches supprimables par les connectés"
  on public.tasks for delete
  using (auth.role() = 'authenticated');
