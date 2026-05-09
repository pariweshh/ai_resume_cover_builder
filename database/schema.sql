-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Resumes table
create table if not exists public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  raw_data text,
  parsed_data jsonb,
  optimized_data jsonb,
  job_description text,
  jd_analysis jsonb,
  ats_score jsonb,
  cover_letter text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Resume versions for history
create table if not exists public.resume_versions (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid references public.resumes(id) on delete cascade not null,
  version_number integer not null,
  data jsonb not null,
  ats_score numeric,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resume_versions_resume_id on public.resume_versions(resume_id);

-- Row Level Security
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

create policy "Users can view own versions"
  on public.resume_versions for select
  using (
    resume_id in (
      select id from public.resumes where user_id = auth.uid()
    )
  );

create policy "Users can insert own versions"
  on public.resume_versions for insert
  with check (
    resume_id in (
      select id from public.resumes where user_id = auth.uid()
    )
  );

-- Auto-update timestamp function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger resumes_updated_at
  before update on public.resumes
  for each row execute function update_updated_at();

-- Auto-save version on resume update
create or replace function save_resume_version()
returns trigger as $$
declare
  next_version integer;
begin
  select coalesce(max(version_number), 0) + 1
  into next_version
  from public.resume_versions
  where resume_id = new.id;

  insert into public.resume_versions (resume_id, version_number, data, ats_score)
  values (
    new.id,
    next_version,
    coalesce(new.optimized_data, new.parsed_data),
    (new.ats_score->>'overall')::numeric
  );

  return new;
end;
$$ language plpgsql;

create trigger resume_version_trigger
  after update of optimized_data on public.resumes
  for each row
  when (old.optimized_data is distinct from new.optimized_data)
  execute function save_resume_version();
