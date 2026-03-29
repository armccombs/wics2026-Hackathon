-- Auth Setup SQL for Nonprofit Case Management Platform
-- This script creates the necessary tables and policies for authentication and RBAC

-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(email)
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create policies
-- Users can view their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Enable realtime subscriptions (optional)
alter publication supabase_realtime add table public.user_profiles;

-- Grant permissions
grant select on public.user_profiles to authenticated;
grant update on public.user_profiles to authenticated;
