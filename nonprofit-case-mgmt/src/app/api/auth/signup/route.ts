import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
        data: {
          email_confirmed: true, // Auto-confirm for development
        },
      },
    })

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // For new users, create an immediate session by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // Session creation failed - user still needs to confirm email
      console.warn('Auto sign-in failed:', signInError)
    }

    // Create user profile using service role (bypasses RLS)
    const username = email.split('@')[0]
    
    // Use service role key if available for profile creation
    let profileError = null
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
      
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            pf_id: authData.user.id,
            pf_email: email,
            pf_username: username,
          },
        ])
      profileError = error
    } else {
      // Fallback to regular client if service role not available
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            pf_id: authData.user.id,
            pf_email: email,
            pf_username: username,
          },
        ])
      profileError = error
    }

    if (profileError) {
      // If profile creation fails, still return success since auth user is created
      console.error('Profile creation error:', profileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
