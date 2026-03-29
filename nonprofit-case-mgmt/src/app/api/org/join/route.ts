import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const { invite_code } = await request.json()

    if (!invite_code || invite_code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Find and validate invitation
    const { data: invitation, error: invError } = await supabase
      .from('org_invitations')
      .select('*')
      .eq('invite_code', invite_code.trim())
      .eq('is_active', true)
      .single()

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite code has expired' },
        { status: 400 }
      )
    }

    // Check if invitation has max uses and reached limit
    if (
      invitation.max_uses !== null &&
      invitation.times_used >= invitation.max_uses
    ) {
      return NextResponse.json(
        { error: 'Invite code has reached max uses' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const { data: existingRole } = await supabase
      .from('user_org_role')
      .select('*')
      .eq('uor_organizationkey', invitation.organization_id)
      .eq('uor_userkey', user.id)
      .single()

    if (existingRole) {
      return NextResponse.json(
        { error: 'You are already a member of this organization' },
        { status: 400 }
      )
    }

    // Add user to organization with staff role
    const { error: roleError } = await supabase
      .from('user_org_role')
      .insert([
        {
          uor_organizationkey: invitation.organization_id,
          uor_userkey: user.id,
          uor_role: 'Staff',
        },
      ])

    if (roleError) {
      console.error('Failed to add user to organization:', roleError)
      return NextResponse.json(
        { error: 'Failed to join organization' },
        { status: 400 }
      )
    }

    // Increment usage count and deactivate if max_uses reached
    const newTimesUsed = invitation.times_used + 1
    const shouldDeactivate = invitation.max_uses !== null && newTimesUsed >= invitation.max_uses

    const updateData: any = { times_used: newTimesUsed }
    if (shouldDeactivate) {
      updateData.is_active = false
    }

    const { error: updateError } = await supabase
      .from('org_invitations')
      .update(updateData)
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update invitation usage:', updateError)
    }

    // Get the organization details
    const { data: org } = await supabase
      .from('organization')
      .select('o_organizationkey, o_name, o_createdby')
      .eq('o_organizationkey', invitation.organization_id)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Joined organization successfully',
      organization: org,
    })
  } catch (error) {
    console.error('Join organization error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
