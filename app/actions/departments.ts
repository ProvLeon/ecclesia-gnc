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

