drop policy if exists "read clients" on clients;
drop policy if exists "create clients" on clients;
drop policy if exists "update clients" on clients;
drop policy if exists "delete clients" on clients;

alter table clients enable row level security;

create policy "read clients" on clients for select
  using (get_user_org_role(c_organizationkey) in ('Admin', 'Staff'));

create policy "create clients" on clients for insert
  with check (get_user_org_role(c_organizationkey) in ('Admin', 'Staff'));

create policy "update clients" on clients for update
  using (get_user_org_role(c_organizationkey) = 'Admin');

create policy "delete clients" on clients for delete
  using (get_user_org_role(c_organizationkey) = 'Admin');