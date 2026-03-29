import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the client and verify user has access
    const { data: client, error } = await supabase
      .from('client')
      .select('*')
      .eq('c_clientkey', id)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Verify user belongs to this organization
    const { data: userOrg } = await supabase
      .from('user_org_role')
      .select('uor_organizationkey')
      .eq('uor_organizationkey', client.c_organizationkey)
      .eq('uor_userkey', user.id)
      .single()

    if (!userOrg) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      client: {
        id: client.c_clientkey,
        name: client.c_fullname,
        fullName: client.c_fullname,
        dob: client.c_DOB || '',
        email: client.c_email || '',
        phone: client.c_phone || '',
        language: client.c_language || '',
        householdSize: client.c_householdsize,
        gender: client.c_gender || '',
      },
    })
  } catch (error) {
    console.error('Get client error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      dob,
      email,
      phone,
      language,
      householdSize,
      gender,
    } = body

    // Fetch current client
    const { data: currentClient } = await supabase
      .from('client')
      .select('c_organizationkey')
      .eq('c_clientkey', id)
      .single()

    if (!currentClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Verify user has admin permission in this organization
    const { data: userOrg } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', currentClient.c_organizationkey)
      .eq('uor_userkey', user.id)
      .single()

    if (!userOrg || userOrg.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to update clients' },
        { status: 403 }
      )
    }

    // Update the client
    const { data: updatedClient, error } = await supabase
      .from('client')
      .update({
        c_fullname: fullName || undefined,
        c_DOB: dob !== undefined ? dob : undefined,
        c_email: email !== undefined ? email : undefined,
        c_phone: phone !== undefined ? phone : undefined,
        c_language: language !== undefined ? language : undefined,
        c_householdsize: householdSize !== undefined ? householdSize : undefined,
        c_gender: gender !== undefined ? gender : undefined,
      })
      .eq('c_clientkey', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update client:', error)
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client: {
        id: updatedClient.c_clientkey,
        name: updatedClient.c_fullname,
        fullName: updatedClient.c_fullname,
        dob: updatedClient.c_DOB || '',
        email: updatedClient.c_email || '',
        phone: updatedClient.c_phone || '',
        language: updatedClient.c_language || '',
        householdSize: updatedClient.c_householdsize,
        gender: updatedClient.c_gender || '',
      },
    })
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch current client
    const { data: currentClient } = await supabase
      .from('client')
      .select('c_organizationkey')
      .eq('c_clientkey', id)
      .single()

    if (!currentClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Verify user has admin permission in this organization
    const { data: userOrg } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', currentClient.c_organizationkey)
      .eq('uor_userkey', user.id)
      .single()

    if (!userOrg || userOrg.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete clients' },
        { status: 403 }
      )
    }

    // Delete the client
    const { error } = await supabase
      .from('client')
      .delete()
      .eq('c_clientkey', id)

    if (error) {
      console.error('Failed to delete client:', error)
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
