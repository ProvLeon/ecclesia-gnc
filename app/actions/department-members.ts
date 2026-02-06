'use server'

import { db } from '@/lib/db'
import { memberDepartments, members } from '@/lib/db/schema'
import { eq, and, notInArray, ilike, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function addMemberToDepartment(
    departmentId: string,
    memberId: string,
    role: 'member' | 'leader' | 'co_leader' = 'member'
) {
    try {
        // Check if member is already in the department to avoid duplicates
        // Although the schema has a unique constraint, it's good UX to check or handle the error gracefully
        const existing = await db.query.memberDepartments.findFirst({
            where: and(
                eq(memberDepartments.departmentId, departmentId),
                eq(memberDepartments.memberId, memberId)
            ),
        })

        if (existing) {
            return { success: false, error: 'Member is already in this department' }
        }

        await db.insert(memberDepartments).values({
            departmentId,
            memberId,
            role,
            joinDate: new Date().toISOString(), // Using ISO string for date field if schema expects string, or Date object if schema handles it. 
            // Schema says: joinDate: date('join_date').notNull() which usually takes a Date object or YYYY-MM-DD string.
            // Let's use new Date() and let Drizzle handle it or formatted string.
        })

        revalidatePath(`/departments/${departmentId}`)
        revalidatePath('/departments')
        return { success: true }
    } catch (error) {
        console.error('Error adding member to department:', error)
        return { success: false, error: 'Failed to add member' }
    }
}

export async function removeMemberFromDepartment(departmentId: string, memberId: string) {
    try {
        await db.delete(memberDepartments)
            .where(and(
                eq(memberDepartments.departmentId, departmentId),
                eq(memberDepartments.memberId, memberId)
            ))

        revalidatePath(`/departments/${departmentId}`)
        revalidatePath('/departments')
        return { success: true }
    } catch (error) {
        console.error('Error removing member from department:', error)
        return { success: false, error: 'Failed to remove member' }
    }
}

export async function updateMemberRole(
    departmentId: string,
    memberId: string,
    role: 'member' | 'leader' | 'co_leader'
) {
    try {
        await db.update(memberDepartments)
            .set({ role })
            .where(and(
                eq(memberDepartments.departmentId, departmentId),
                eq(memberDepartments.memberId, memberId)
            ))

        revalidatePath(`/departments/${departmentId}`)
        return { success: true }
    } catch (error) {
        console.error('Error updating member role:', error)
        return { success: false, error: 'Failed to update role' }
    }
}

export async function searchMembersForDepartment(departmentId: string, query: string) {
    // Find members NOT in this department matching the query
    // First get IDs of members in the department
    const existingMemberIds = await db
        .select({ id: memberDepartments.memberId })
        .from(memberDepartments)
        .where(eq(memberDepartments.departmentId, departmentId))
        .then(rows => rows.map(r => r.id))

    const searchConditions = or(
        ilike(members.firstName, `%${query}%`),
        ilike(members.lastName, `%${query}%`),
        ilike(members.email, `%${query}%`)
    )

    const whereClause = existingMemberIds.length > 0
        ? and(searchConditions, notInArray(members.id, existingMemberIds))
        : searchConditions

    const results = await db
        .select({
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            email: members.email,
            photoUrl: members.photoUrl,
        })
        .from(members)
        .where(whereClause)
        .limit(10)

    return results
}
