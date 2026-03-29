import { createClient } from '@/lib/supabase/server'
import { UserProfile, UserOrgRole } from '@/lib/roles'
import { redirect } from 'next/navigation'

export const getSession = async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('pf_id', user.id)
    .single()

  if (error || !profile) return null

  return profile as UserProfile
}

export const getUserOrganizations = async (): Promise<Array<any> | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: orgs, error } = await supabase
    .from('user_org_role')
    .select(`
      uor_role,
      uor_organizationkey,
      organization (
        o_organizationkey,
        o_name,
        o_createdby
      )
    `)
    .eq('uor_userkey', user.id)

  if (error) return null

  return orgs?.map((item: any) => ({
    ...item.organization,
    user_role: item.uor_role,
  })) || []
}

export const getUserRoleInOrg = async (
  organizationId: string
): Promise<UserOrgRole | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: role, error } = await supabase
    .from('user_org_role')
    .select('*')
    .eq('uor_organizationkey', organizationId)
    .eq('uor_userkey', user.id)
    .single()

  if (error || !role) return null

  return {
    id: organizationId,
    organization_id: role.uor_organizationkey,
    user_id: role.uor_userkey,
    role: role.uor_role,
    created_at: role.created_at,
    updated_at: role.updated_at,
  } as UserOrgRole
}

export const requireAuth = async (): Promise<UserProfile> => {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export const requireOrgMembership = async (
  organizationId: string
): Promise<UserOrgRole> => {
  await requireAuth()
  const role = await getUserRoleInOrg(organizationId)
  if (!role) {
    redirect('/org')
  }
  return role
}

export const requireOrgAdmin = async (
  organizationId: string
): Promise<UserOrgRole> => {
  const role = await requireOrgMembership(organizationId)
  if (role.role !== 'Admin') {
    redirect('/org')
  }
  return role
}
