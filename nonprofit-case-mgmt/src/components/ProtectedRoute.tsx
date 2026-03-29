'use client'

import React from 'react'
import { useAuth } from '@/src/contexts/auth'
import { hasPermission } from '@/lib/roles'
import type { RolePermission } from '@/lib/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: keyof RolePermission
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallback = <div>Access Denied</div>,
}) => {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!profile) {
    return fallback
  }

  if (requiredPermission && !hasPermission(profile.role, requiredPermission)) {
    return fallback
  }

  return <>{children}</>
}
