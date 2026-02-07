'use server'

import { db } from '@/lib/db'
import { departments, members, memberDepartments } from '@/lib/db/schema'
import { eq, asc, ilike, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createDepartment(data: {
    name: string
    description?: string
}) {
    const [dept] = await db.insert(departments).values({
        name: data.name,
        description: data.description,
        isActive: true,
    }).returning()

    revalidatePath('/departments')
    return { success: true, department: dept }
}

export async function getDepartments() {
    return db
        .select({
            id: departments.id,
            name: departments.name,
        })
        .from(departments)
        .where(eq(departments.isActive, true))
        .orderBy(asc(departments.name))
}

export async function getDepartment(id: string) {
    const [dept] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, id))
        .limit(1)
    return dept
}

export async function updateDepartment(id: string, data: {
    name?: string
    description?: string
    isActive?: boolean
}) {
    await db.update(departments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(departments.id, id))

    revalidatePath('/departments')
    return { success: true }
}

/**
 * Find department by name or create if it doesn't exist.
 * Used by Excel sync to auto-create departments.
 */
export async function findOrCreateDepartment(name: string): Promise<string> {
    const trimmedName = name.trim()

    // Try to find existing department (case-insensitive)
    const existing = await db
        .select({ id: departments.id })
        .from(departments)
        .where(ilike(departments.name, trimmedName))
        .limit(1)

    if (existing.length > 0) {
        return existing[0].id
    }

    // Create new department
    const [newDept] = await db.insert(departments).values({
        name: trimmedName,
        isActive: true,
    }).returning({ id: departments.id })

    return newDept.id
}

/**
 * Register a new member directly to a department.
 * Creates member record and links to department in one action.
 * Used by Dept Leaders to add new members from department page.
 */
export async function registerNewMemberToDepartment(
    departmentId: string,
    memberData: {
        firstName: string
        lastName: string
        phonePrimary: string
        email?: string
        gender?: 'male' | 'female'
        address?: string
    }
) {
    try {
        // Generate member ID
        const [lastMember] = await db
            .select({ memberId: members.memberId })
            .from(members)
            .orderBy(desc(members.createdAt))
            .limit(1)

        let nextNumber = 1
        if (lastMember?.memberId) {
            const match = lastMember.memberId.match(/GNC-(\d+)/)
            if (match) nextNumber = parseInt(match[1], 10) + 1
        }

        const memberId = `GNC-${String(nextNumber).padStart(4, '0')}`

        // Create member
        const [newMember] = await db.insert(members).values({
            memberId,
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            phonePrimary: memberData.phonePrimary,
            email: memberData.email || null,
            gender: memberData.gender,
            address: memberData.address,
            memberStatus: 'active',
            joinDate: new Date().toISOString().split('T')[0],
        }).returning()

        // Link to department
        await db.insert(memberDepartments).values({
            memberId: newMember.id,
            departmentId,
            isActive: true,
            joinDate: new Date().toISOString().split('T')[0],
        })

        revalidatePath('/departments')
        revalidatePath(`/departments/${departmentId}`)
        revalidatePath('/members')

        return { success: true, member: newMember }
    } catch (error) {
        console.error('Error registering member to department:', error)
        return { success: false, error: 'Failed to register member' }
    }
}

// ============================================================================
// DEPARTMENT LEADERS MANAGEMENT
// ============================================================================

import { departmentLeaders, departmentLeaderRoleEnum } from '@/lib/db/schema'
import { sql, and } from 'drizzle-orm'

export type DepartmentLeaderRole = 'president' | 'vice_president' | 'secretary' | 'treasurer' | 'coordinator'

/**
 * Get all leaders for a department
 */
export async function getDepartmentLeaders(departmentId: string) {
    const result = await db
        .select({
            id: departmentLeaders.id,
            role: departmentLeaders.role,
            isActive: departmentLeaders.isActive,
            assignedDate: departmentLeaders.assignedDate,
            memberId: members.id,
            memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
            memberPhone: members.phonePrimary,
            memberEmail: members.email,
        })
        .from(departmentLeaders)
        .innerJoin(members, eq(departmentLeaders.memberId, members.id))
        .where(and(
            eq(departmentLeaders.departmentId, departmentId),
            eq(departmentLeaders.isActive, true)
        ))
        .orderBy(departmentLeaders.role)

    return result
}

/**
 * Add a leader to a department
 */
export async function addDepartmentLeader(
    departmentId: string,
    memberId: string,
    role: DepartmentLeaderRole,
    assignedById?: string
) {
    try {
        const [leader] = await db.insert(departmentLeaders).values({
            departmentId,
            memberId,
            role,
            isActive: true,
            assignedDate: new Date().toISOString().split('T')[0],
            assignedBy: assignedById,
        }).returning()

        revalidatePath(`/departments/${departmentId}`)
        revalidatePath('/departments')
        return { success: true, leader }
    } catch (error: unknown) {
        // Check for unique constraint violation
        if (error instanceof Error && error.message.includes('unique')) {
            return { success: false, error: 'This member is already a leader in this department' }
        }
        console.error('Error adding department leader:', error)
        return { success: false, error: 'Failed to add leader' }
    }
}

/**
 * Update a department leader's role
 */
export async function updateDepartmentLeaderRole(
    leaderId: string,
    role: DepartmentLeaderRole
) {
    try {
        const [updated] = await db.update(departmentLeaders)
            .set({ role })
            .where(eq(departmentLeaders.id, leaderId))
            .returning()

        if (updated) {
            revalidatePath(`/departments/${updated.departmentId}`)
        }
        return { success: true, leader: updated }
    } catch (error) {
        console.error('Error updating department leader:', error)
        return { success: false, error: 'Failed to update leader role' }
    }
}

/**
 * Remove a leader from a department (deactivates, doesn't delete)
 */
export async function removeDepartmentLeader(leaderId: string) {
    try {
        const [removed] = await db.update(departmentLeaders)
            .set({ isActive: false })
            .where(eq(departmentLeaders.id, leaderId))
            .returning()

        if (removed) {
            revalidatePath(`/departments/${removed.departmentId}`)
        }
        return { success: true }
    } catch (error) {
        console.error('Error removing department leader:', error)
        return { success: false, error: 'Failed to remove leader' }
    }
}
