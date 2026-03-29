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

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Fetch membership + role in one query
    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_org_role')
      .select('uor_organizationkey, uor_role')
      .eq('uor_organizationkey', orgId)
      .eq('uor_userkey', user.id)
      .single()

    if (userOrgError || !userOrg) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    // Optional: export restricted to Admin only
    if (userOrg.uor_role !== 'Admin') {
      return NextResponse.json(
        { error: 'You do not have permission to export services' },
        { status: 403 }
      )
    }

    const { data: services, error } = await supabase
      .from('service')
      .select(`
        s_servicekey,
        s_date,
        s_type,
        s_notes,
        s_createdat,
        s_createdby,
        s_staffkey,
        s_clientkey,
        client:clients!service_s_clientkey_fkey(
          c_fullname
        )
      `)
      .eq('s_organizationkey', orgId)
      .order('s_date', { ascending: false })

    if (error) {
      console.error('Failed to fetch services:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch services' },
        { status: 500 }
      )
    }

    const csvData = (services || []).map((service: any) => ({
      date: service.s_date || '',
      clientName: service.client?.c_fullname || '',
      serviceType: service.s_type || '',
      notes: service.s_notes || '',
      createdAt: service.s_createdat || '',
      createdBy: service.s_createdby || '',
      staffKey: service.s_staffkey || '',
    }))

    const csvContent = generateCSV(csvData)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
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
      s_clientkey,
      s_staffkey,
      s_organizationkey,
      s_date,
      s_type,
      s_notes,
      s_servicetypekey,
    } = body

    if (!s_clientkey || !s_organizationkey) {
      return NextResponse.json(
        { error: 'Client and organization are required' },
        { status: 400 }
      )
    }

    const insertPayload = {
      s_clientkey,
      s_staffkey: s_staffkey || user.id,
      s_organizationkey,
      s_date: s_date || null,
      s_type: s_type || null,
      s_notes: s_notes || null,
      s_servicetypekey: s_servicetypekey || null,
      s_createdby: user.id,
      s_updatedby: user.id,
    }

    const { data, error } = await supabase
      .from('service')
      .insert([insertPayload])
      .select(`
        s_servicekey,
        s_clientkey,
        s_staffkey,
        s_organizationkey,
        s_date,
        s_type,
        s_notes,
        s_createdat,
        s_updatedat,
        s_createdby,
        s_updatedby,
        s_servicetypekey
      `)
      .single()

    if (error) {
      console.error('Create service error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create service' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, service: data }, { status: 201 })
  } catch (error) {
    console.error('Create service route error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}