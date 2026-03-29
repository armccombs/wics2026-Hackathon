import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the org_id from query params
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Verify user belongs to this organization
    const { data: userOrg } = await supabase
      .from('user_org_role')
      .select('uor_organizationkey')
      .eq('uor_organizationkey', orgId)
      .eq('uor_userkey', user.id)
      .single()

    if (!userOrg) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    // Fetch clients for this organization
    const { data: clients, error } = await supabase
      .from('client')
      .select('*')
      .eq('c_organizationkey', orgId)
      .order('c_createdat', { ascending: false })

    if (error) {
      console.error('Failed to fetch clients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedClients = clients?.map((client: any) => ({
      id: client.c_clientkey,
      name: client.c_fullname,
      fullName: client.c_fullname,
      dob: client.c_DOB || '',
      email: client.c_email || '',
      phone: client.c_phone || '',
      language: client.c_language || '',
      householdSize: client.c_householdsize,
      gender: client.c_gender || '',
    })) || []

    return NextResponse.json({ clients: formattedClients })
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      orgId,
    } = body

    // Validate required fields
    if (!fullName || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, orgId' },
        { status: 400 }
      )
    }

    // Verify user has permission to create clients in this organization
    const { data: userOrg } = await supabase
      .from('user_org_role')
      .select('uor_role')
      .eq('uor_organizationkey', orgId)
      .eq('uor_userkey', user.id)
      .single()

    if (!userOrg || !['Admin', 'Staff'].includes(userOrg.uor_role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create clients' },
        { status: 403 }
      )
    }

    // Create the client
    const { data: newClient, error } = await supabase
      .from('client')
      .insert([
        {
          c_fullname: fullName,
          c_DOB: dob || null,
          c_email: email || null,
          c_phone: phone || null,
          c_language: language || null,
          c_householdsize: householdSize || null,
          c_gender: gender || null,
          c_createdby: user.id,
          c_organizationkey: orgId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create client:', error)
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        client: {
          id: newClient.c_clientkey,
          name: newClient.c_fullname,
          fullName: newClient.c_fullname,
          dob: newClient.c_DOB || '',
          email: newClient.c_email || '',
          phone: newClient.c_phone || '',
          language: newClient.c_language || '',
          householdSize: newClient.c_householdsize,
          gender: newClient.c_gender || '',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
