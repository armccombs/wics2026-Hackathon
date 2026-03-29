import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { hasPermission, type UserRole, type RolePermission } from './roles'

export async function getUserRoleForOrg(orgId: string): Promise<UserRole | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_org_role')
    .select('uor_role')               // ← was 'role'
    .eq('uor_userkey', user.id)       // ← was 'user_id'
    .eq('uor_organizationkey', orgId) // ← was 'organization_id'
    .single()

  return (data?.uor_role as UserRole) ?? null
}

export async function requirePermission(orgId: string, permission: keyof RolePermission) {
  const role = await getUserRoleForOrg(orgId)
  if (!hasPermission(role, permission)) {
    throw new Error('Forbidden')
  }
  return role
}

