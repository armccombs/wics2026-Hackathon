'use client'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useOrgRole } from '@/src/contexts/OrgRoleContext'

interface Org {
  o_organizationkey: string
  o_name: string
}

export function OrgSwitcher() {
  const { orgId, switchOrg } = useOrgRole()
  const [orgs, setOrgs] = useState<Org[]>([])

  useEffect(() => {
    async function fetchOrgs() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_org_role')
        .select('uor_organizationkey, organization(o_organizationkey, o_name)')
        .eq('uor_userkey', user.id)

      if (data) {
        const mapped = data.map((r: any) => r.organization)
        setOrgs(mapped)
        if (mapped.length > 0 && !orgId) {
          switchOrg(mapped[0].o_organizationkey) // auto-select first org
        }
      }
    }
    fetchOrgs()
  }, [])

  if (orgs.length <= 1) return null // no switcher needed if only one org

  return (
    <select
      value={orgId ?? ''}
      onChange={(e) => switchOrg(e.target.value)}
    >
      {orgs.map(org => (
        <option key={org.o_organizationkey} value={org.o_organizationkey}>
          {org.o_name}
        </option>
      ))}
    </select>
  )
}