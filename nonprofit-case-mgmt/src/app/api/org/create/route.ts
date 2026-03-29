import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organization')
      .insert([
        {
          o_name: name.trim(),
          o_createdby: user.id,
        },
      ])
      .select('o_organizationkey, o_name, o_createdby')
      .single()

    if (orgError) {
      console.error('Organization creation error:', {
        message: orgError.message,
        code: orgError.code,
        details: orgError.details,
      })
      return NextResponse.json(
        {
          error: 'Failed to create organization',
          details: orgError.message,
        },
        { status: 400 }
      )
    }

    if (!org || !org.o_organizationkey) {
      return NextResponse.json(
        { error: 'Organization was created but no ID returned' },
        { status: 400 }
      )
    }

    // Create admin role for the creator
    const { error: roleError } = await supabase
      .from('user_org_role')
      .insert([
        {
          uor_organizationkey: org.o_organizationkey,
          uor_userkey: user.id,
          uor_role: 'Admin',
        },
      ])

    if (roleError) {
      console.error('Role creation error:', {
        message: roleError.message,
        code: roleError.code,
        details: roleError.details,
      })
      // Delete the organization since role creation failed
      await supabase
        .from('organization')
        .delete()
        .eq('o_organizationkey', org.o_organizationkey)
      
      // Provide specific guidance based on the error type
      let errorMsg = roleError.message
      if (roleError.message?.includes('enum')) {
        errorMsg = 'The user_role enum type is not properly defined in the database.'
      }
      
      return NextResponse.json(
        {
          error: 'Failed to set admin role',
          details: errorMsg,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      organization: org,
    })
  } catch (error) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
