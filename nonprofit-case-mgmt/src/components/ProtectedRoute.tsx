'use client'

import React from 'react'
import { useAuth } from '@/src/contexts/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Access Denied</div>,
}) => {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!profile) {
    return fallback
  }

  return <>{children}</>
}
