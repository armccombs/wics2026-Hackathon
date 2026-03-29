import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('pf_id', user.id)
      .single()

    // Get user's organizations with roles
    const { data: orgs } = await supabase
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

    const organizations = orgs?.map((item: any) => ({
      ...item.organization,
      user_role: item.uor_role,
    })) || []

    return NextResponse.json({
      success: true,
      user: profile,
      organizations,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

