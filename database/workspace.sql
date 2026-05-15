-- ============================================================
-- Workspace Persistence Schema
-- Run after monetization.sql in Supabase SQL Editor
-- ============================================================

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  state jsonb not null default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_workspaces_user on public.workspaces(user_id);

alter table public.workspaces enable row level security;

create policy "workspaces_select_own"
  on public.workspaces for select using (auth.uid() = user_id);
create policy "workspaces_insert_own"
  on public.workspaces for insert with check (auth.uid() = user_id);
create policy "workspaces_update_own"
  on public.workspaces for update using (auth.uid() = user_id);
create policy "workspaces_delete_own"
  on public.workspaces for delete using (auth.uid() = user_id);

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();
