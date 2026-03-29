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

    const { organization_id, max_uses, days_until_expiry } = await request.json()

    if (!organization_id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Check if user is admin of this organization
    const { data: adminCheck, error: checkError } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', organization_id)
      .eq('uor_userkey', user.id)
      .single()

    if (checkError || !adminCheck || adminCheck.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to create invitations' },
        { status: 403 }
      )
    }

    // Generate unique invite code
    const invite_code = crypto.randomBytes(8).toString('hex').toUpperCase()

    // Calculate expiry date
    const expires_at = new Date()
    expires_at.setDate(
      expires_at.getDate() + (days_until_expiry || 30)
    )

    // Create invitation
    const { data: invitation, error: invError } = await supabase
      .from('org_invitations')
      .insert([
        {
          organization_id,
          invite_code,
          created_by: user.id,
          expires_at: expires_at.toISOString(),
          max_uses: max_uses || null,
        },
      ])
      .select()
      .single()

    if (invError) {
      console.error('Failed to create invitation:', invError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      invitation,
    })
  } catch (error) {
    console.error('Create invitation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
