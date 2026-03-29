import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ org_id: string; user_id: string }> }
) {
  try {
    const supabase = await createClient()
    const { org_id, user_id } = await params

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { role } = await request.json()

    if (!role || !['Admin', 'Staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be Admin or Staff' },
        { status: 400 }
      )
    }

    // Check if requester is admin of this organization
    const { data: adminCheck, error: checkError } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', org_id)
      .eq('uor_userkey', user.id)
      .single()

    if (checkError || !adminCheck || adminCheck.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to update member roles' },
        { status: 403 }
      )
    }

    // Prevent removing the last admin
    if (role === 'Staff') {
      const { data: adminCount } = await supabase
        .from('user_org_role')
        .select('uor_userkey', { count: 'exact' })
        .eq('uor_organizationkey', org_id)
        .eq('uor_role', 'Admin')
        .eq('uor_userkey', user_id)

      if (adminCount && adminCount.length > 0) {
        const { data: otherAdmins, error: countError } = await supabase
          .from('user_org_role')
          .select('uor_userkey', { count: 'exact' })
          .eq('uor_organizationkey', org_id)
          .eq('uor_role', 'Admin')
          .neq('uor_userkey', user_id)

        const otherAdminCount = countError ? 0 : (otherAdmins?.length || 0)

        if (otherAdminCount === 0) {
          return NextResponse.json(
            { error: 'Cannot demote the last admin of the organization' },
            { status: 400 }
          )
        }
      }
    }

    // Update the role
    const { data: updated, error } = await supabase
      .from('user_org_role')
      .update({ uor_role: role })
      .eq('uor_organizationkey', org_id)
      .eq('uor_userkey', user_id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update member role:', error)
      return NextResponse.json(
        { error: 'Failed to update member role' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Member role updated successfully',
      member: updated,
    })
  } catch (error) {
    console.error('Update member role error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
