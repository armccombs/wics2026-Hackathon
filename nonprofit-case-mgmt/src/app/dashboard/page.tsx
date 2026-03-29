'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/src/contexts/auth'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers()
    }
  }, [profile])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/auth/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'staff') => {
    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  // Prevent rendering until hydration is complete
  if (isLoading || !user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p>{user.email} ({profile.role})</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-gray-400 font-bold"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Info</h2>
        <div className="space-y-2">
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Features</h2>
        <ul className="space-y-2">
          <li>✓ Create clients</li>
          <li>✓ View clients</li>
          {profile.role === 'admin' && <li>✓ Manage users</li>}
          {profile.role === 'admin' && <li>✓ View reports</li>}
        </ul>
      </div>

      {profile.role === 'admin' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Users</h2>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="w-full border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left border-b border-gray-400">Email</th>
                  <th className="p-2 text-left border-b border-gray-400">Role</th>
                  <th className="p-2 text-left border-b border-gray-400">Created</th>
                  <th className="p-2 text-left border-b border-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-400">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2 font-bold">{u.role}</td>
                    <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-2">
                      {u.id !== user.id ? (
                        <>
                          {u.role === 'staff' ? (
                            <button
                              onClick={() => updateUserRole(u.id, 'admin')}
                              className="px-3 py-1 border border-gray-400 font-bold"
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserRole(u.id, 'staff')}
                              className="px-3 py-1 border border-gray-400 font-bold"
                            >
                              Make Staff
                            </button>
                          )}
                        </>
                      ) : (
                        <span>(You)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
