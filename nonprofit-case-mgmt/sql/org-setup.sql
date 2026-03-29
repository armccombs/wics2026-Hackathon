-- Multi-Tenant Organization Setup
-- This script creates tables and policies for organization management

-- Ensure user_role enum type exists (will be ignored if already exists)
-- Note: If this fails because the type already exists, you can safely ignore
do $$ begin
  create type public.user_role as enum ('Admin', 'Staff');
exception
  when duplicate_object then null;
end $$;

-- Note: organization table structure is predefined with columns:
-- o_organizationkey (uuid) - primary key
-- o_name (text) - organization name
-- o_createdby (uuid) - creator user id
-- No need to create the organization table as it already exists

-- Note: user_org_role table structure is predefined with columns:
-- uor_userkey (uuid) - user id
-- uor_organizationkey (uuid) - organization id
-- uor_role (user_role) - enum of 'Admin' or 'Staff'
-- No need to create the user_org_role table as it already exists

-- Note: org_invitations table already exists with columns:
-- id, organization_id, invite_code, created_by, created_at, expires_at, 
-- max_uses, times_used, is_active
-- No need to create the org_invitations table as it already exists

-- Enable RLS on all organization tables
alter table public.organization enable row level security;
alter table public.user_org_role enable row level security;
alter table public.org_invitations enable row level security;

-- Organization Policies

-- Users can view organizations they belong to
create policy "Users can view their organizations"
  on public.organization for select
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = organization.o_organizationkey
      and uor_userkey = auth.uid()
    )
  );
 
-- Users can create organizations
create policy "Users can create organizations"
  on public.organization for insert
  with check (auth.uid() = o_createdby);

-- Organization admins can update their organization
create policy "Org admins can update organization"
  on public.organization for update
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = organization.o_organizationkey
      and uor_userkey = auth.uid()
      and uor_role = 'Admin'
    )
  );

-- User Org Roles Policies

-- Users can view role assignments in their organizations
create policy "Users can view roles in their orgs"
  on public.user_org_role for select
  using (
    exists (
      select 1 from public.user_org_role uor2
      where uor2.uor_organizationkey = user_org_role.uor_organizationkey
      and uor2.uor_userkey = auth.uid()
    )
  );

-- Organization admins can manage roles
create policy "Org admins can manage roles"
  on public.user_org_role for all
  using (
    exists (
      select 1 from public.user_org_role uor2
      where uor2.uor_organizationkey = user_org_role.uor_organizationkey
      and uor2.uor_userkey = auth.uid()
      and uor2.uor_role = 'Admin'
    )
  );

-- Invitation Policies

-- Users can view invitations for their organizations
create policy "Users can view invitations in their orgs"
  on public.org_invitations for select
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = org_invitations.organization_id
      and uor_userkey = auth.uid()
    )
  );

-- Only org admins can create invitations
create policy "Org admins can create invitations"
  on public.org_invitations for insert
  with check (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = org_invitations.organization_id
      and uor_userkey = auth.uid()
      and uor_role = 'Admin'
    ) and
    auth.uid() = created_by
  );

-- Only org admins can update invitations
create policy "Org admins can update invitations"
  on public.org_invitations for update
  using (
    exists (
      select 1 from public.user_org_role
      where uor_organizationkey = org_invitations.organization_id
      and uor_userkey = auth.uid()
      and uor_role = 'Admin'
    )
  );

-- Grant permissions
grant select, insert, update, delete on public.organization to authenticated;
grant select, insert, update, delete on public.user_org_role to authenticated;
grant select, insert, update, delete on public.org_invitations to authenticated;

-- Enable realtime subscriptions (optional)
alter publication supabase_realtime add table public.organization;
alter publication supabase_realtime add table public.user_org_role;
alter publication supabase_realtime add table public.org_invitations;
