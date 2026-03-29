import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can manage users' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { userId, role } = body

  if (!userId || !role) {
    return NextResponse.json(
      { error: 'Missing userId or role' },
      { status: 400 }
    )
  }

  if (!['admin', 'staff'].includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be admin or staff' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, message: 'User role updated' })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can view users' },
      { status: 403 }
    )
  }

  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, email, role, created_at, updated_at')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }

  return NextResponse.json({ users })
}
