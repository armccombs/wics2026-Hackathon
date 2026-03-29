'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseServerClient  } from '@/lib/supabase/server'
import { type UserRole } from '@/lib/roles'

interface OrgRoleContextValue {
  orgId: string | null
  role: UserRole | null
  loading: boolean
  switchOrg: (orgId: string) => void
}

const OrgRoleContext = createContext<OrgRoleContextValue>({
  orgId: null, role: null, loading: true, switchOrg: () => {}
})

export function OrgRoleProvider({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient ()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = async (oid: string) => {
    setLoading(true)
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('user_org_role')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', oid)
      .single()

    setRole((data?.role as UserRole) ?? null)
    setLoading(false)
  }

  const switchOrg = (oid: string) => {
    setOrgId(oid)
    fetchRole(oid)
  }

  return (
    <OrgRoleContext.Provider value={{ orgId, role, loading, switchOrg }}>
      {children}
    </OrgRoleContext.Provider>
  )
}

export const useOrgRole = () => useContext(OrgRoleContext)