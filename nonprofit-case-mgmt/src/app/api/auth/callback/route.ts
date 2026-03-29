import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Get the user from the session
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if user profile exists, if not create it
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // Create user profile with default staff role
          await supabase.from('user_profiles').insert([
            {
              id: user.id,
              email: user.email,
              role: 'staff', // Default role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
        }
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    new URL('/auth/login?error=Could+not+authenticate+user', request.url)
  )
}
