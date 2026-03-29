import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    // Get user's organizations
    const { data: userOrgs, error } = await supabase
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

    if (error) {
      console.error('Failed to fetch organizations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 400 }
      )
    }

    // Format response
    const organizations = userOrgs?.map((item: any) => ({
      ...item.organization,
      user_role: item.uor_role,
    })) || []

    return NextResponse.json({
      success: true,
      organizations,
    })
  } catch (error) {
    console.error('List organizations error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
