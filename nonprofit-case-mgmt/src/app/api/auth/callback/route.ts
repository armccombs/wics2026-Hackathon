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
          // Create user profile (no default organization or role)
          // Generate username from email (first part before @)
          const username = user.email?.split('@')[0] || `user_${Date.now()}`
          
          await supabase.from('user_profiles').insert([
            {
              id: user.id,
              email: user.email,
            },
          ])
        }
      }

      return NextResponse.redirect(new URL('/org', request.url))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    new URL('/auth/login?error=Could+not+authenticate+user', request.url)
  )
}
