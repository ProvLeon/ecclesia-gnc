'use server'

import { db } from '@/lib/db'
import { followUps, members } from '@/lib/db/schema'
import { eq, desc, sql, and, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getShepherdingStats() {
    const [pendingCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(followUps)
        .where(eq(followUps.status, 'scheduled'))

    const [completedThisMonth] = await db
        .select({ count: sql<number>`count(*)` })
        .from(followUps)
        .where(
            and(
                eq(followUps.status, 'completed'),
                sql`${followUps.completedDate} >= date_trunc('month', current_date)`
            )
        )

    const [overdueCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(followUps)
        .where(
            and(
                eq(followUps.status, 'scheduled'),
                sql`${followUps.scheduledDate} < current_date`
            )
        )

    return {
        pending: Number(pendingCount?.count || 0),
        completedThisMonth: Number(completedThisMonth?.count || 0),
        overdue: Number(overdueCount?.count || 0),
    }
}

export async function getFollowUps(status?: string, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize
    const conditions = status ? [eq(followUps.status, status as any)] : []

    const results = await db
        .select({
            id: followUps.id,
            scheduledDate: followUps.scheduledDate,
            completedDate: followUps.completedDate,
            status: followUps.status,
            notes: followUps.notes,
            type: followUps.followUpType,
            memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
            memberPhone: members.phonePrimary,
            memberId: members.memberId,
        })
        .from(followUps)
        .innerJoin(members, eq(followUps.memberId, members.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(followUps.scheduledDate))
        .limit(pageSize)
        .offset(offset)

    return { data: results }
}

export async function createFollowUp(data: {
    memberId: string
    scheduledDate: string
    type: string
    notes?: string
}) {
    await db.insert(followUps).values({
        memberId: data.memberId,
        scheduledDate: data.scheduledDate,
        followUpType: data.type as any,
        notes: data.notes,
        status: 'scheduled',
    })

    revalidatePath('/shepherding')
    return { success: true }
}

export async function completeFollowUp(id: string, data?: { outcome?: string; notes?: string }) {
    await db.update(followUps).set({
        status: 'completed',
        completedDate: new Date().toISOString().split('T')[0],
        notes: data?.notes ? `${data.outcome || 'Completed'}: ${data.notes}` : data?.outcome || 'Completed',
    }).where(eq(followUps.id, id))

    revalidatePath('/shepherding')
    return { success: true }
}

export async function getMembersForFollowUp() {
    return db
        .select({
            id: members.id,
            name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
            memberId: members.memberId,
            phone: members.phonePrimary,
        })
        .from(members)
        .where(eq(members.memberStatus, 'active'))
        .orderBy(members.firstName)
        .limit(200)
}

// Shepherd Assignments
import { shepherdAssignments } from '@/lib/db/schema'

export async function assignMemberToShepherd(shepherdId: string, memberId: string) {
    // Check if already assigned
    const [existing] = await db
        .select({ id: shepherdAssignments.id })
        .from(shepherdAssignments)
        .where(and(
            eq(shepherdAssignments.shepherdId, shepherdId),
            eq(shepherdAssignments.memberId, memberId),
            eq(shepherdAssignments.isActive, true)
        ))
        .limit(1)

    if (existing) {
        return { success: false, error: 'Already assigned' }
    }

    await db.insert(shepherdAssignments).values({
        shepherdId,
        memberId,
        assignedDate: new Date().toISOString().split('T')[0],
        isActive: true,
    })

    revalidatePath('/shepherding')
    revalidatePath('/shepherding/assignments')
    return { success: true }
}

export async function unassignMember(assignmentId: string) {
    await db
        .update(shepherdAssignments)
        .set({ isActive: false })
        .where(eq(shepherdAssignments.id, assignmentId))

    revalidatePath('/shepherding')
    revalidatePath('/shepherding/assignments')
    return { success: true }
}
