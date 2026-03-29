'use client'

import { useAuth } from '@/src/contexts/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [isLoading, user, router])

  // Don't render auth-dependent content until client-side hydration is complete
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4">
            Case Management Platform
          </h1>
          <p className="text-lg mb-6">
            Simple client and service tracking for nonprofits.
          </p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Case Management Platform
        </h1>
        <p className="text-lg mb-6">
          Simple client and service tracking for nonprofits.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/auth/login">
            <button className="w-full px-4 py-2 bg-blue-600 text-white">
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="w-full px-4 py-2 border border-gray-400">
              Create Account
            </button>
          </Link>
        </div>

        <div className="mt-12 space-y-4 text-left">
          <div className="p-4 border border-gray-200">
            <h3 className="font-bold mb-2">Client Management</h3>
            <p>Register and track clients</p>
          </div>
          <div className="p-4 border border-gray-200">
            <h3 className="font-bold mb-2">Service Logging</h3>
            <p>Log services and visits</p>
          </div>
          <div className="p-4 border border-gray-200">
            <h3 className="font-bold mb-2">Access Control</h3>
            <p>Role-based permissions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
