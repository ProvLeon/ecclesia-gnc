import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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

    // Fetch role from database
    try {
        const [dbUser] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

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
