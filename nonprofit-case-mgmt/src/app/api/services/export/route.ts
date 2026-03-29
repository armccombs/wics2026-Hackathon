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

    // Fetch services with client and staff names
    const { data: services, error } = await supabase
      .from('service')
      .select(`
        s_servicekey,
        s_date,
        s_type,
        s_notes,
        s_createdat,
        client:s_clientkey(c_fullname),
        staff:s_staffkey(pf_first_name, pf_last_name)
      `)
      .eq('s_organizationkey', orgId)
      .order('s_date', { ascending: false })

    if (error) {
      console.error('Failed to fetch services:', error)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    // Format for CSV export
    const csvData = (services || []).map((service: any) => ({
      date: service.s_date || '',
      clientName: service.client?.c_fullname || '',
      serviceType: service.s_type || '',
      notes: service.s_notes || '',
      staffName: service.staff
        ? `${service.staff.pf_first_name || ''} ${service.staff.pf_last_name || ''}`.trim()
        : '',
      createdAt: service.s_createdat || '',
    }))

    const csvContent = generateCSV(csvData)

    // Return CSV as file download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': 'attachment; filename="services_export.csv"',
      },
    })
  } catch (error) {
    console.error('Export services error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
