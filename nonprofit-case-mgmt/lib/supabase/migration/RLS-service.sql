drop policy if exists "read service" on service;
drop policy if exists "create service" on service;
drop policy if exists "update service" on service;
drop policy if exists "delete service" on service;

alter table service enable row level security;

create policy "read service" on service for select
  using (get_user_org_role(s_organizationkey) in ('Admin', 'Staff'));

create policy "create service" on service for insert
  with check (get_user_org_role(s_organizationkey) in ('Admin', 'Staff'));

create policy "update service" on service for update
  using (get_user_org_role(s_organizationkey) = 'Admin');

create policy "delete service" on service for delete
  using (get_user_org_role(s_organizationkey) = 'Admin');