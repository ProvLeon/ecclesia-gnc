'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserRole, currentUserHasPermission, currentUserHasAnyPermission } from '@/lib/auth/permissions'
import { Permission, UserRole } from '@/lib/constants/roles'

/**
 * Hook to check if current user has a specific permission
 */
export function useHasPermission(permission: Permission) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await currentUserHasPermission(permission)
        setHasPermission(result)
      } catch (error) {
        console.error('Error checking permission:', error)
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermission()
  }, [permission])

  return { hasPermission, isLoading }
}

/**
 * Hook to check if current user has any of the specified permissions
 */
export function useHasAnyPermission(permissions: Permission[]) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await currentUserHasAnyPermission(permissions)
        setHasPermission(result)
      } catch (error) {
        console.error('Error checking permissions:', error)
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermission()
  }, [permissions])

  return { hasPermission, isLoading }
}

/**
 * Hook to get the current user's role
 */
export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await getUserRole()
        setRole(userRole)
      } catch (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
  }, [])

  return { role, isLoading }
}

/**
 * Guard to redirect if user lacks permission
 */
export function usePermissionGuard(permission: Permission, redirectTo: string = '/') {
  const router = useRouter()
  const { hasPermission, isLoading } = useHasPermission(permission)

  useEffect(() => {
    if (!isLoading && !hasPermission) {
      router.push(redirectTo)
    }
  }, [hasPermission, isLoading, router, redirectTo])

  return { isLoading, hasPermission }
}

/**
 * Guard to redirect if user's role is not allowed
 */
export function useRoleGuard(allowedRoles: UserRole[], redirectTo: string = '/') {
  const router = useRouter()
  const { role, isLoading } = useUserRole()

  useEffect(() => {
    if (!isLoading && (!role || !allowedRoles.includes(role))) {
      router.push(redirectTo)
    }
  }, [role, isLoading, router, redirectTo, allowedRoles])

  return { isLoading, role }
}

/**
 * Conditional render component based on permission
 */
export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission, isLoading } = useHasPermission(permission)

  if (isLoading) {
    return fallback || null
  }

  return hasPermission ? children : (fallback || null)
}

/**
 * Conditional render component based on role
 */
export function RoleGate({
  roles,
  children,
  fallback,
}: {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { role, isLoading } = useUserRole()

  if (isLoading) {
    return fallback || null
  }

  return role && roles.includes(role) ? children : (fallback || null)
}
