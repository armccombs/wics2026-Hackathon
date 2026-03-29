import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const updatePayload: Record<string, any> = {
      s_updatedby: user.id,
    }

    if ('s_clientkey' in body) updatePayload.s_clientkey = body.s_clientkey
    if ('s_staffkey' in body) updatePayload.s_staffkey = body.s_staffkey
    if ('s_organizationkey' in body) updatePayload.s_organizationkey = body.s_organizationkey
    if ('s_date' in body) updatePayload.s_date = body.s_date
    if ('s_type' in body) updatePayload.s_type = body.s_type
    if ('s_notes' in body) updatePayload.s_notes = body.s_notes
    if ('s_servicetypekey' in body) updatePayload.s_servicetypekey = body.s_servicetypekey

    const { data, error } = await supabase
      .from('service')
      .update(updatePayload)
      .eq('s_servicekey', id)
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
      console.error('Update service error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update service' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, service: data })
  } catch (error) {
    console.error('Update service route error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}


export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const { error } = await supabase
      .from('service')
      .delete()
      .eq('s_servicekey', id)

    if (error) {
      console.error('Delete service error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete service' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service route error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}