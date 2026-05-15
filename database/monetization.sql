-- ============================================================
-- ResumeForge Monetization Schema
-- Run in Supabase SQL Editor after the base schema
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text default '',
  subscription_tier text default 'free'
    check (subscription_tier in ('free', 'pro', 'career')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text default 'inactive'
    check (subscription_status in ('inactive', 'active', 'cancelled', 'past_due')),
  current_period_end timestamptz,
  generations_used_this_month int default 0,
  generation_reset_date timestamptz default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_profiles_stripe_customer
  on public.profiles(stripe_customer_id);
create index if not exists idx_profiles_stripe_subscription
  on public.profiles(stripe_subscription_id);

-- ── Generation history ──────────────────────────────────────────
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_title text,
  company text,
  ats_score int,
  trust_score int,
  created_at timestamptz default now() not null
);

create index if not exists idx_generations_user
  on public.generations(user_id, created_at desc);

-- ── Row-level security ──────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "generations_select_own"
  on public.generations for select using (auth.uid() = user_id);
create policy "generations_insert_own"
  on public.generations for insert with check (auth.uid() = user_id);

-- ── Auto-create profile on auth signup ──────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Monthly usage reset ────────────────────────────────────────
create or replace function public.reset_monthly_generations()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    generations_used_this_month = 0,
    generation_reset_date = date_trunc('month', now()) + interval '1 month'
  where generation_reset_date <= now();
end;
$$;

-- ── Updated-at trigger ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Grant service role access for webhooks ──────────────────────
-- (Supabase service role bypasses RLS by default, no grant needed)
