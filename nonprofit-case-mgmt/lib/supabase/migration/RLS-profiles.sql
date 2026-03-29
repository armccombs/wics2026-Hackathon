drop policy if exists "read own profile" on profiles;
drop policy if exists "update own profile" on profiles;

alter table profiles enable row level security;

-- users can only read and update their own profile
create policy "read own profile" on profiles for select
  using (pf_id = auth.uid());

create policy "update own profile" on profiles for update
  using (pf_id = auth.uid());