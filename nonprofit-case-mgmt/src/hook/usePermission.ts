import { useOrgRole } from '@/src/contexts/OrgRoleContext'
import { hasPermission, isAdmin, type RolePermission } from '@/lib/roles'

export function usePermission(permission: keyof RolePermission) {
  const { role } = useOrgRole()
  return hasPermission(role, permission)
}

export function useIsAdmin() {
  const { role } = useOrgRole()
  return isAdmin(role)
}