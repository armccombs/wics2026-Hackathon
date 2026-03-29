drop policy if exists "read organization" on organization;
drop policy if exists "update organization" on organization;
drop policy if exists "delete organization" on organization;

alter table organization enable row level security;

-- anyone authenticated can read orgs (needed for org selection on login)
create policy "read organization" on organization for select
  using (auth.uid() is not null);

-- only Admin can update org details
create policy "update organization" on organization for update
  using (get_user_org_role(o_organizationkey) = 'Admin');

-- only Admin can delete org
create policy "delete organization" on organization for delete
  using (get_user_org_role(o_organizationkey) = 'Admin');