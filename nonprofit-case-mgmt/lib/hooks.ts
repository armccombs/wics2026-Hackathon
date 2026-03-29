'use client'

import { useAuth } from '@/src/contexts/auth'
import { hasPermission, isAdmin } from '@/lib/roles'
import type { RolePermission } from '@/lib/roles'

// Legacy hooks - organization-based roles are now fetched from user_org_role table
// These functions are no longer used with the multi-tenant system
/*
export const usePermission = (permission: keyof RolePermission) => {
  const { profile } = useAuth()
  return hasPermission(profile?.role, permission)
}

export const useIsAdmin = () => {
  const { profile } = useAuth()
  return isAdmin(profile?.role)
}
*/
