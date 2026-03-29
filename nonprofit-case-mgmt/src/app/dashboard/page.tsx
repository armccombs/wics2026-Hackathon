'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/src/contexts/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [isLoading, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Prevent rendering until hydration is complete
  if (isLoading || !user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/org">
              <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
                Organizations
              </button>
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {profile.pf_username || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
