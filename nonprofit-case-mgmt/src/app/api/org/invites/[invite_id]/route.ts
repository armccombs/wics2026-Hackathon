import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invite_id: string }> }
) {
  try {
    const supabase = await createClient()
    const { invite_id } = await params

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

    // Get the invitation to check ownership
    const { data: invitation, error: fetchError } = await supabase
      .from('org_invitations')
      .select('*')
      .eq('id', invite_id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if user is admin of this organization
    const { data: adminCheck, error: checkError } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', invitation.organization_id)
      .eq('uor_userkey', user.id)
      .single()

    if (checkError || !adminCheck || adminCheck.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this invitation' },
        { status: 403 }
      )
    }

    // Deactivate the invitation (soft delete)
    const { error: updateError } = await supabase
      .from('org_invitations')
      .update({ is_active: false })
      .eq('id', invite_id)

    if (updateError) {
      console.error('Failed to delete invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation deactivated successfully',
    })
  } catch (error) {
    console.error('Delete invitation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
