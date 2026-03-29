import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org_id: string }> }
) {
  try {
    const supabase = await createClient()
    const { org_id } = await params

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

    // Check if user is admin of this organization
    const { data: adminCheck, error: checkError } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', org_id)
      .eq('uor_userkey', user.id)
      .single()

    if (checkError || !adminCheck || adminCheck.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to view invitations' },
        { status: 403 }
      )
    }

    // Get all invitations for this organization
    const { data: invitations, error } = await supabase
      .from('org_invitations')
      .select('*')
      .eq('organization_id', org_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      invitations: invitations || [],
    })
  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
