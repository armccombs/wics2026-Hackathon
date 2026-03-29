'use client'

import React from 'react'
import Link from 'next/link'

export default function OrgSelectionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Organization</h1>
        
        <div className="space-y-3">
          <Link href="/org/create">
            <button className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">
              Create Organization
            </button>
          </Link>

          <Link href="/org/join">
            <button className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700">
              Join Organization
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
