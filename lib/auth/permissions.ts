'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUser } from '@/app/actions/auth'
import { hasPermission as checkPermission, UserRole, Permission, canManageRole } from '@/lib/constants/roles'

/**
 * Get the current user's role from the database
 */
export async function getUserRole(): Promise<UserRole | null> {
  const authUser = await getUser()
  if (!authUser?.id) return null

  const [userRecord] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  return (userRecord?.role as UserRole) || null
}

/**
 * Check if the current user has a specific permission
 */
export async function currentUserHasPermission(permission: Permission): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  return checkPermission(role, permission)
}

/**
 * Check if the current user has any of the specified permissions
 */
export async function currentUserHasAnyPermission(permissions: Permission[]): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  return permissions.some(p => checkPermission(role, p))
}

/**
 * Check if the current user has all of the specified permissions
 */
export async function currentUserHasAllPermissions(permissions: Permission[]): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  return permissions.every(p => checkPermission(role, p))
}

/**
 * Require a specific permission, throw if not authorized
 */
export async function requirePermission(permission: Permission, message?: string) {
  const hasPermission = await currentUserHasPermission(permission)
  if (!hasPermission) {
    throw new Error(message || `Unauthorized: requires ${permission} permission`)
  }
}

/**
 * Require any of the specified permissions, throw if not authorized
 */
export async function requireAnyPermission(permissions: Permission[], message?: string) {
  const hasPermission = await currentUserHasAnyPermission(permissions)
  if (!hasPermission) {
    throw new Error(message || `Unauthorized: requires one of [${permissions.join(', ')}] permissions`)
  }
}

/**
 * Check if current user can manage a specific role
 */
export async function currentUserCanManageRole(targetRole: UserRole): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  return canManageRole(role, targetRole)
}

/**
 * Get the current user's full auth context (user object + role)
 */
export async function getCurrentUserWithRole() {
  const authUser = await getUser()
  if (!authUser?.id) return null

  const [userRecord] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)

  if (!userRecord) return null

  return {
    ...authUser,
    role: userRecord.role as UserRole,
  }
}

/**
 * Check if current user can perform an action on a specific resource
 * This is useful for verifying action availability before showing UI elements
 */
export async function canPerformAction(
  action: 'view' | 'create' | 'edit' | 'delete',
  resource: 'members' | 'finances' | 'attendance' | 'shepherding' | 'followups' | 'events' | 'reports' | 'users' | 'settings'
): Promise<boolean> {
  const permissionMap: Record<string, Record<string, Permission>> = {
    members: {
      view: 'members:view',
      create: 'members:create',
      edit: 'members:edit',
      delete: 'members:delete',
    },
    finances: {
      view: 'finances:view',
      create: 'finances:create',
      edit: 'finances:edit',
      delete: 'finances:delete',
    },
    attendance: {
      view: 'attendance:view',
      create: 'attendance:record',
      edit: 'attendance:edit',
      delete: 'attendance:view',
    },
    shepherding: {
      view: 'shepherding:view',
      create: 'shepherding:create',
      edit: 'shepherding:edit',
      delete: 'shepherding:delete',
    },
    followups: {
      view: 'followups:view',
      create: 'followups:create',
      edit: 'followups:edit',
      delete: 'followups:delete',
    },
    events: {
      view: 'reports:view',
      create: 'events:create',
      edit: 'events:edit',
      delete: 'events:delete',
    },
    reports: {
      view: 'reports:view',
      create: 'reports:export',
      edit: 'reports:view',
      delete: 'reports:view',
    },
    users: {
      view: 'users:manage',
      create: 'users:create',
      edit: 'users:edit',
      delete: 'users:delete',
    },
    settings: {
      view: 'settings:view',
      create: 'settings:edit',
      edit: 'settings:edit',
      delete: 'settings:view',
    },
  }

  const permission = permissionMap[resource]?.[action]
  if (!permission) return false

  return currentUserHasPermission(permission)
}
