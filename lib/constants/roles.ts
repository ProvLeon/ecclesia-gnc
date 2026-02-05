/**
 * Role Definitions and Permissions Matrix
 * ========================================
 *
 * This file defines all user roles in the GNC-AG Church Management System
 * and their associated permissions across all modules.
 */

/**
 * User Role Types
 * All valid roles in the system
 */
export type UserRole =
  | 'super_admin'
  | 'pastor'
  | 'admin'
  | 'treasurer'
  | 'dept_leader'
  | 'shepherd'
  | 'member'

/**
 * Role Metadata and Descriptions
 */
export const ROLE_METADATA: Record<UserRole, { label: string; description: string; level: number }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access including user management and system configuration',
    level: 7,
  },
  pastor: {
    label: 'Pastor/Church Leader',
    description: 'Strategic oversight with view-only financial access and full reporting',
    level: 6,
  },
  admin: {
    label: 'Admin/Office Manager',
    description: 'Day-to-day operations including member and financial management',
    level: 5,
  },
  treasurer: {
    label: 'Treasurer/Finance Secretary',
    description: 'Full financial access including expense management and approvals',
    level: 4,
  },
  dept_leader: {
    label: 'Department Leader',
    description: 'Department-specific access and management',
    level: 3,
  },
  shepherd: {
    label: 'Shepherd',
    description: 'Assigned member oversight and follow-up management',
    level: 2,
  },
  member: {
    label: 'Member',
    description: 'Personal data access and self-service portal',
    level: 1,
  },
}

/**
 * Permission Definitions
 * Each permission key represents an action that can be performed
 */
export type Permission =
  // Member Management
  | 'members:view'
  | 'members:create'
  | 'members:edit'
  | 'members:delete'
  | 'members:view_own'
  | 'members:edit_own'
  // Financial Management
  | 'finances:view'
  | 'finances:create'
  | 'finances:edit'
  | 'finances:delete'
  | 'finances:approve'
  // Attendance
  | 'attendance:view'
  | 'attendance:record'
  | 'attendance:edit'
  // Shepherd Management
  | 'shepherding:view'
  | 'shepherding:create'
  | 'shepherding:edit'
  | 'shepherding:delete'
  | 'shepherding:manage_assignments'
  // Follow-ups
  | 'followups:view'
  | 'followups:create'
  | 'followups:edit'
  | 'followups:delete'
  | 'followups:complete'
  // Communication
  | 'sms:send'
  | 'email:send'
  | 'events:create'
  | 'events:edit'
  | 'events:delete'
  // Reporting
  | 'reports:view'
  | 'reports:export'
  // System
  | 'users:manage'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'settings:view'
  | 'settings:edit'

/**
 * Permissions Matrix by Role
 * Maps each role to their allowed permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Full access to all permissions
    'members:view',
    'members:create',
    'members:edit',
    'members:delete',
    'members:view_own',
    'members:edit_own',
    'finances:view',
    'finances:create',
    'finances:edit',
    'finances:delete',
    'finances:approve',
    'attendance:view',
    'attendance:record',
    'attendance:edit',
    'shepherding:view',
    'shepherding:create',
    'shepherding:edit',
    'shepherding:delete',
    'shepherding:manage_assignments',
    'followups:view',
    'followups:create',
    'followups:edit',
    'followups:delete',
    'followups:complete',
    'sms:send',
    'email:send',
    'events:create',
    'events:edit',
    'events:delete',
    'reports:view',
    'reports:export',
    'users:manage',
    'users:create',
    'users:edit',
    'users:delete',
    'settings:view',
    'settings:edit',
  ],

  pastor: [
    // Strategic oversight
    'members:view',
    'members:view_own',
    'members:edit_own',
    'finances:view', // View-only
    'attendance:view',
    'shepherding:view',
    'followups:view',
    'sms:send',
    'email:send',
    'events:create',
    'events:edit',
    'reports:view',
    'reports:export',
  ],

  admin: [
    // Day-to-day operations
    'members:view',
    'members:create',
    'members:edit',
    'members:view_own',
    'members:edit_own',
    'finances:view',
    'finances:create',
    'finances:edit',
    'attendance:view',
    'attendance:record',
    'attendance:edit',
    'shepherding:view',
    'shepherding:create',
    'shepherding:edit',
    'followups:view',
    'followups:create',
    'followups:edit',
    'sms:send',
    'email:send',
    'events:create',
    'events:edit',
    'events:delete',
    'reports:view',
    'reports:export',
  ],

  treasurer: [
    // Financial management
    'members:view',
    'members:view_own',
    'members:edit_own',
    'finances:view',
    'finances:create',
    'finances:edit',
    'finances:delete',
    'finances:approve',
    'reports:view',
    'reports:export',
  ],

  dept_leader: [
    // Department-specific
    'members:view', // Department members only
    'members:edit',
    'members:view_own',
    'members:edit_own',
    'finances:view', // Department finances only
    'attendance:view',
    'attendance:record',
    'shepherding:view',
    'followups:view',
    'sms:send',
    'events:create',
    'events:edit',
    'events:delete',
    'reports:view',
  ],

  shepherd: [
    // Assigned member access
    'members:view', // Assigned members only
    'members:view_own',
    'members:edit_own',
    'followups:view',
    'followups:create',
    'followups:edit',
    'followups:complete',
    'sms:send', // To assigned members only
    'reports:view', // Shepherd dashboard only
  ],

  member: [
    // Self-service only
    'members:view_own',
    'members:edit_own',
    'reports:view', // Own data only
  ],
}

/**
 * Role Hierarchy
 * Higher level roles have greater authority
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  super_admin: ['pastor', 'admin', 'treasurer', 'dept_leader', 'shepherd', 'member'],
  pastor: ['admin', 'treasurer', 'dept_leader', 'shepherd', 'member'],
  admin: ['dept_leader', 'shepherd', 'member'],
  treasurer: ['member'],
  dept_leader: ['shepherd', 'member'],
  shepherd: ['member'],
  member: [],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === targetRole) return true
  return ROLE_HIERARCHY[managerRole]?.includes(targetRole) ?? false
}

/**
 * Get all roles that a role can manage
 */
export function getManagedRoles(role: UserRole): UserRole[] {
  return ROLE_HIERARCHY[role] ?? []
}

/**
 * Get role display information
 */
export function getRoleInfo(role: UserRole) {
  return ROLE_METADATA[role] ?? null
}

/**
 * Sort roles by hierarchy level
 */
export function sortRolesByHierarchy(roles: UserRole[]): UserRole[] {
  return [...roles].sort((a, b) =>
    (ROLE_METADATA[b]?.level ?? 0) - (ROLE_METADATA[a]?.level ?? 0)
  )
}

/**
 * Default Role Assignment
 */
export const DEFAULT_ROLE: UserRole = 'member'

/**
 * System Roles (cannot be deleted)
 */
export const SYSTEM_ROLES: UserRole[] = ['super_admin', 'member']

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_METADATA) as UserRole[]
}
