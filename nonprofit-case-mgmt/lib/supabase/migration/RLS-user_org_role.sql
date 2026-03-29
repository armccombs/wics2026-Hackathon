drop policy if exists "read own roles" on user_org_role;
drop policy if exists "manage roles" on user_org_role;

alter table user_org_role enable row level security;

-- users can only read their own role assignments
create policy "read own roles" on user_org_role for select
  using (uor_userkey = auth.uid());

-- only Admin can insert/update/delete role assignments
create policy "manage roles" on user_org_role for insert
  with check (get_user_org_role(uor_organizationkey) = 'Admin');

create policy "manage roles update" on user_org_role for update
  using (get_user_org_role(uor_organizationkey) = 'Admin');

create policy "manage roles delete" on user_org_role for delete
  using (get_user_org_role(uor_organizationkey) = 'Admin');