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

    // Check if user is member of this organization
    const { data: memberCheck } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', org_id)
      .eq('uor_userkey', user.id)
      .single()

    if (!memberCheck) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      )
    }

    // Get all members of the organization
    const { data: members, error } = await supabase
      .from('user_org_role')
      .select(`
        *,
        user_profiles (
          email,
          created_at
        )
      `)
      .eq('uor_organizationkey', org_id)

    if (error) {
      console.error('Failed to fetch members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organization members' },
        { status: 400 }
      )
    }

    // Format response
    const formattedMembers = members?.map((item: any) => ({
      uor_userkey: item.uor_userkey,
      email: item.user_profiles?.email,
      uor_role: item.uor_role,
      user_created_at: item.user_profiles?.created_at,
    })) || []

    return NextResponse.json({
      success: true,
      members: formattedMembers,
    })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
