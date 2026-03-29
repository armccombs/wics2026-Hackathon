import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/lib/roles'
import { redirect } from 'next/navigation'

export const getSession = async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) return null

  return profile as UserProfile
}

export const requireAuth = async (): Promise<UserProfile> => {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export const requireAdmin = async (): Promise<UserProfile> => {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    redirect('/')
  }
  return user
}

export const requireRole = async (role: string): Promise<UserProfile> => {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect('/')
  }
  return user
}
