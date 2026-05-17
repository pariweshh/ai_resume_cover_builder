-- 1. Create the profiles table with all columns the app expects
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text default '',
    subscription_tier text default 'free',
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status text default 'active',
    generations_used_this_month integer default 0,
    generation_reset_date date default (current_date + interval '1 month')::date,
    created_at timestamptz default now(),
    day3_email_sent boolean default false,
    day7_email_sent boolean default false
);

-- 2. Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', '')
    );
    return new;
end;
$$;

-- 3. Fire the trigger on every new auth signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- 5. Users can only read their own profile
create policy "Users can read own profile"
    on profiles for select
    using (auth.uid() = id);

-- 6. Users can update their own profile
create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- 7. Service role can do everything (for cron/email endpoints)
create policy "Service role full access"
    on profiles for all
    using (true)
    with check (true);
