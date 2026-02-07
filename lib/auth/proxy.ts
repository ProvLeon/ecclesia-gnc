import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users, members } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import {
    UserRole,
    Permission,
    hasPermission,
    DEFAULT_ROLE
} from '@/lib/constants/roles'

/**
 * Get current authenticated user with their specific role from database.
 * Falls back to DEFAULT_ROLE if DB record is missing but Auth exists.
 */
export async function getCurrentUserWithRole() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    // Fetch role and member details from database
    try {
        const [dbUser] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        // Fetch member profile for UI display (photo, name)
        const member = await db.query.members.findFirst({
            where: eq(members.userId, user.id),
            columns: {
                firstName: true,
                lastName: true,
                photoUrl: true
            }
        })

        if (member) {
            user.user_metadata = {
                ...user.user_metadata,
                avatar_url: member.photoUrl || '',
                full_name: `${member.firstName} ${member.lastName}`,
                first_name: member.firstName,
                last_name: member.lastName
            }
        }

        return {
            ...user,
            role: (dbUser?.role || DEFAULT_ROLE) as UserRole
        }
    } catch (err) {
        console.error('Error fetching user role:', err)
        // Fallback for safety, though this implies DB issues
        return {
            ...user,
            role: DEFAULT_ROLE as UserRole
        }
    }
}

/**
 * Server-side route guard.
 * Redirects to /dashboard (or /login) if user lacks the required permission.
 */
export async function protectPage(requiredPermission: Permission) {
    const user = await getCurrentUserWithRole()

    if (!user) {
        redirect('/login')
    }

    if (!hasPermission(user.role, requiredPermission)) {
        console.warn(`Access denied: User ${user.email} (Role: ${user.role}) attempted to access protected resource requiring ${requiredPermission}`)

        // Check if they have at least dashboard access, otherwise login
        if (hasPermission(user.role, 'members:view_own')) {
            redirect('/dashboard?error=unauthorized')
        } else {
            redirect('/login')
        }
    }

    return user
}

/**
 * Check permission for conditional rendering (Server Components).
 * Returns boolean, does NOT redirect.
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
    const user = await getCurrentUserWithRole()
    if (!user) return false
    return hasPermission(user.role, permission)
}

/**
 * Get scoped member IDs based on user role.
 * Returns null for full access (admin roles), or array of member IDs for scoped roles.
 */
export async function getScopedMemberIds(userId: string, role: UserRole): Promise<string[] | null> {
    // Admin roles have full access
    if (['super_admin', 'pastor', 'admin', 'treasurer'].includes(role)) {
        return null // null = full access
    }

    const { shepherds, shepherdAssignments, memberDepartments, departments } = await import('@/lib/db/schema')

    // Shepherd: get assigned member IDs
    if (role === 'shepherd') {
        // First find the shepherd record for this user
        const shepherdMember = await db.query.members.findFirst({
            where: eq(members.userId, userId),
            columns: { id: true }
        })

        if (!shepherdMember) return []

        const shepherdRecord = await db.query.shepherds.findFirst({
            where: and(
                eq(shepherds.memberId, shepherdMember.id),
                eq(shepherds.isActive, true)
            ),
            columns: { id: true }
        })

        if (!shepherdRecord) return []

        const assignments = await db
            .select({ memberId: shepherdAssignments.memberId })
            .from(shepherdAssignments)
            .where(and(
                eq(shepherdAssignments.shepherdId, shepherdRecord.id),
                eq(shepherdAssignments.isActive, true)
            ))

        return assignments.map(a => a.memberId)
    }

    // Dept Leader: get department member IDs
    if (role === 'dept_leader') {
        const deptId = await getDeptLeaderDepartmentId(userId)
        if (!deptId) return []

        const deptMembers = await db
            .select({ memberId: memberDepartments.memberId })
            .from(memberDepartments)
            .where(and(
                eq(memberDepartments.departmentId, deptId),
                eq(memberDepartments.isActive, true)
            ))

        return deptMembers.map(m => m.memberId)
    }

    // Default: no access (empty array)
    return []
}

/**
 * Get the department ID for a department leader.
 * Assumes dept leader is linked via departments.leaderId -> members.id.
 */
export async function getDeptLeaderDepartmentId(userId: string): Promise<string | null> {
    const { departments } = await import('@/lib/db/schema')

    // Find member linked to this user
    const member = await db.query.members.findFirst({
        where: eq(members.userId, userId),
        columns: { id: true }
    })

    if (!member) return null

    // Find department where this member is the leader
    const dept = await db.query.departments.findFirst({
        where: and(
            eq(departments.leaderId, member.id),
            eq(departments.isActive, true)
        ),
        columns: { id: true }
    })

    return dept?.id || null
}
