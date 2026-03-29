import { requirePermission } from '@/lib/rbac-server'
import { redirect } from 'next/navigation'

export default async function SettingsPage({ searchParams }: { searchParams: { orgId: string } }) {
  try {
    await requirePermission(searchParams.orgId, 'manage_organization')
  } catch {
    redirect('/dashboard') // redirect Staff away from admin pages
  }

  return <div>Settings page — Admin only</div>
}
