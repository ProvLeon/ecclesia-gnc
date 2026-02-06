'use server'

import { db } from '@/lib/db'
import { users, members } from '@/lib/db/schema'
import { eq, desc, sql, asc, and, ilike, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getUsers(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize

    const results = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            lastLogin: users.lastLogin,
            createdAt: users.createdAt,
            memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
        })
        .from(users)
        .leftJoin(members, eq(users.id, members.userId))
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset)

    const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)

    return {
        data: results,
        pagination: { page, pageSize, total: Number(countResult?.count || 0) },
    }
}

export async function getUser(id: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1)
    return user
}

import { generateMemberId } from './members'

import { createClient } from '@supabase/supabase-js'

export async function createUser(data: {
    email: string
    firstName: string
    lastName: string
    phone?: string
    role: 'super_admin' | 'pastor' | 'admin' | 'treasurer' | 'dept_leader' | 'shepherd' | 'member'
    isActive?: boolean
}) {
    // Check if email already exists
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1)

    if (existing) {
        return { success: false, error: 'Email already exists' }
    }

    try {
        // 0. Initialize Supabase Admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables')
            return { success: false, error: 'Server configuration error' }
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email.toLowerCase(),
            password: 'password123',
            email_confirm: true,
            user_metadata: {
                role: data.role,
                first_name: data.firstName,
                last_name: data.lastName
            }
        })

        if (authError || !authData.user) {
            console.error('Auth creation error:', authError)
            return { success: false, error: authError?.message || 'Failed to create auth user' }
        }

        const userId = authData.user.id

        // 2. Create DB User
        // Note: We use the SAME ID as Supabase Auth
        const [newUser] = await db
            .insert(users)
            .values({
                id: userId,
                email: data.email.toLowerCase(),
                role: data.role,
                isActive: data.isActive ?? true,
            })
            .returning()

        // 3. Create Member Profile
        const memberId = await generateMemberId()

        await db.insert(members).values({
            userId: newUser.id,
            memberId: memberId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email.toLowerCase(),
            phonePrimary: data.phone || '',
            memberStatus: 'active',
            joinDate: new Date().toISOString(),
        })

        revalidatePath('/settings/users')
        return { success: true, user: newUser }
    } catch (error) {
        console.error('Error creating user:', error)
        return { success: false, error: 'Failed to create user' }
    }
}

export async function updateUserRole(id: string, role: 'super_admin' | 'pastor' | 'admin' | 'treasurer' | 'dept_leader' | 'shepherd' | 'member') {
    const [updated] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning()

    revalidatePath('/settings/users')
    return { success: true, user: updated }
}

export async function toggleUserStatus(id: string) {
    const [user] = await db
        .select({ isActive: users.isActive })
        .from(users)
        .where(eq(users.id, id))
        .limit(1)

    if (!user) return { success: false, error: 'User not found' }

    const [updated] = await db
        .update(users)
        .set({ isActive: !user.isActive, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning()

    revalidatePath('/settings/users')
    return { success: true, user: updated }
}

export async function deleteUser(id: string) {
    // 0. Initialize Supabase Admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, error: 'Server configuration error' }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        // 1. Delete from Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(id)

        if (authError) {
            // If user is not found in Auth, we can still proceed to delete from DB
            // This handles cases where DB and Auth are out of sync
            if (authError.message.includes('not found') || (authError as any).status === 404) {
                console.warn('User not found in Supabase Auth, proceeding with DB deletion:', id)
            } else {
                console.error('Error deleting auth user:', authError)
                return { success: false, error: authError.message }
            }
        }

        // 2. Delete from Database (users table)
        await db.delete(users).where(eq(users.id, id))

        revalidatePath('/settings/users')
        return { success: true }
    } catch (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function getUserStats() {
    const [stats] = await db
        .select({
            total: sql<number>`count(*)`,
            active: sql<number>`count(*) filter (where ${users.isActive} = true)`,
            admins: sql<number>`count(*) filter (where ${users.role} in ('super_admin', 'admin'))`,
            shepherds: sql<number>`count(*) filter (where ${users.role} = 'shepherd')`,
        })
        .from(users)

    return {
        total: Number(stats?.total || 0),
        active: Number(stats?.active || 0),
        admins: Number(stats?.admins || 0),
        shepherds: Number(stats?.shepherds || 0),
    }
}
