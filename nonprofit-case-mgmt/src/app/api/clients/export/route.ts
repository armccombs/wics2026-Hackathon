import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateCSV } from '@/lib/csv-utils'

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
      .from('clients')
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

    // Format for CSV export
    const csvData = (clients || []).map((client: any) => ({
      fullName: client.c_fullname,
      dob: client.c_DOB || '',
      email: client.c_email || '',
      phone: client.c_phone || '',
      language: client.c_language || '',
      householdSize: client.c_householdsize || '',
      gender: client.c_gender || '',
      configurable1: client.c_configurable1 || '',
      configurable2: client.c_configurable2 || '',
      configurable3: client.c_configurable3 || '',
    }))

    const csvContent = generateCSV(csvData)

    // Return CSV as file download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': 'attachment; filename="clients_export.csv"',
      },
    })
  } catch (error) {
    console.error('Export clients error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
