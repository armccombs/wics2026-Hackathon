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

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Signed out successfully' })
}
