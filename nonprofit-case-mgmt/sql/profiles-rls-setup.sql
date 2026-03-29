-- Profile RLS Policies Setup
-- This script adds Row Level Security policies to the profiles table

-- Enable RLS on profiles table (if not already enabled)
alter table public.profiles enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Policy: Users can insert their own profile (for signup)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = pf_id);

-- Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = pf_id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = pf_id)
  with check (auth.uid() = pf_id);

-- Grant permissions to authenticated users
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update on public.profiles to authenticated;
