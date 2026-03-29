-- Client Table Setup for Case Management
-- This sets up RLS policies for the existing client table

-- Enable RLS
alter table if exists public.client enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view clients in their organizations" on public.client;
drop policy if exists "Users can create clients in their organizations" on public.client;
drop policy if exists "Only admins can update clients" on public.client;
drop policy if exists "Only admins can delete clients" on public.client;

-- Client Policies

-- Users can view clients in their organizations
create policy "Users can view clients in their organizations"
  on public.client for select
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = client.c_organizationkey
      and uor_userkey = auth.uid()
    )
  );

-- Users with Staff role and above can create clients
create policy "Users can create clients in their organizations"
  on public.client for insert
  with check (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = client.c_organizationkey
      and uor_userkey = auth.uid()
      and uor_role in ('Admin', 'Staff')
    )
  );

-- Only Admins can update clients
create policy "Only admins can update clients"
  on public.client for update
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = client.c_organizationkey
      and uor_userkey = auth.uid()
      and uor_role = 'Admin'
    )
  );

-- Only Admins can delete clients
create policy "Only admins can delete clients"
  on public.client for delete
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = client.c_organizationkey
      and uor_userkey = auth.uid()
      and uor_role = 'Admin'
    )
  );

-- Grant permissions
grant select on public.client to authenticated;
grant insert on public.client to authenticated;
grant update on public.client to authenticated;
grant delete on public.client to authenticated;
