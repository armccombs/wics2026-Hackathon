import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { parseCSV, validateClientCSVData } from '@/lib/csv-utils'

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
    const { csvContent, orgId } = body

    if (!csvContent || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: csvContent, orgId' },
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

    // Parse CSV
    const rows = parseCSV(csvContent)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      )
    }

    // Validate data
    const validation = validateClientCSVData(rows)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'CSV validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Prepare clients for insertion
    const clientsToInsert = rows.map((row) => ({
      c_fullname: row.fullName.trim(),
      c_DOB: row.dob ? row.dob.trim() : null,
      c_email: row.email ? row.email.trim() : null,
      c_phone: row.phone ? row.phone.trim() : null,
      c_language: row.language ? row.language.trim() : null,
      c_householdsize: row.householdSize ? parseInt(row.householdSize, 10) : null,
      c_gender: row.gender ? row.gender.trim() : null,
      c_configurable1: row.configurable1 ? row.configurable1.trim() : null,
      c_configurable2: row.configurable2 ? row.configurable2.trim() : null,
      c_configurable3: row.configurable3 ? row.configurable3.trim() : null,
      c_createdby: user.id,
      c_organizationkey: orgId,
    }))

    // Insert clients
    const { data: insertedClients, error: insertError } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select()

    if (insertError) {
      console.error('Failed to import clients:', insertError)
      return NextResponse.json(
        { error: 'Failed to import clients', details: insertError.message },
        { status: 500 }
      )
    }

    // Format response
    const formattedClients = (insertedClients || []).map((client: any) => ({
      id: client.c_clientkey,
      name: client.c_fullname,
      fullName: client.c_fullname,
      dob: client.c_DOB || '',
      email: client.c_email || '',
      phone: client.c_phone || '',
      language: client.c_language || '',
      householdSize: client.c_householdsize,
      gender: client.c_gender || '',
    }))

    return NextResponse.json(
      {
        success: true,
        message: `Successfully imported ${insertedClients?.length || 0} clients`,
        clientsImported: insertedClients?.length || 0,
        clients: formattedClients,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
