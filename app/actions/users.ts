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

export async function createUser(data: {
    email: string
    role: 'super_admin' | 'pastor' | 'admin' | 'treasurer' | 'dept_leader' | 'shepherd' | 'member'
    memberId?: string
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

    const [newUser] = await db
        .insert(users)
        .values({
            email: data.email.toLowerCase(),
            role: data.role,
        })
        .returning()

    // Link to member if provided
    if (data.memberId) {
        await db
            .update(members)
            .set({ userId: newUser.id })
            .where(eq(members.id, data.memberId))
    }

    revalidatePath('/settings/users')
    return { success: true, user: newUser }
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
