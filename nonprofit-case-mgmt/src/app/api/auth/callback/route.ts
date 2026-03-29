import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
          .from('profiles')
          .select('*')
          .eq('pf_id', user.id)
          .single()

        if (!existingProfile) {
          // Create user profile
          const username = user.email?.split('@')[0] || `user_${Date.now()}`
          
          // Use service role key if available to bypass RLS
          if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const cookieStore = await cookies()
            const supabaseAdmin = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
              {
                cookies: {
                  getAll() {
                    return cookieStore.getAll()
                  },
                  setAll(cookiesToSet) {
                    try {
                      cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                      )
                    } catch {
                      // ignore
                    }
                  },
                },
              }
            )
            
            await supabaseAdmin.from('profiles').insert([
              {
                pf_id: user.id,
                pf_email: user.email,
                pf_username: username,
              },
            ])
          } else {
            // Fallback to regular client
            await supabase.from('profiles').insert([
              {
                pf_id: user.id,
                pf_email: user.email,
                pf_username: username,
              },
            ])
          }
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
