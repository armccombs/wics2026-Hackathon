'use client'

import React from 'react'
import { useAuth } from '@/src/contexts/auth'
import Link from 'next/link'
import { Button } from '@/src/app/components/ui/button'

export const AuthNav: React.FC = () => {
  const { user, profile, isLoading, signOut } = useAuth()

  if (isLoading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Case Management</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </nav>
    )
  }

  if (!user) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Case Management</h1>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Case Management</h1>
          <p className="text-sm text-gray-600">
            {user.email} ({profile?.role || 'loading'})
          </p>
        </div>
        <Button onClick={signOut} variant="outline">
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
