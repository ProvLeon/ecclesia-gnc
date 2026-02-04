'use server'

import { db } from '@/lib/db'
import { followUps, members, shepherds, shepherdAssignments } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'


export async function getShepherdingStats() {
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(followUps)
    .where(eq(followUps.status, 'pending'))

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
        eq(followUps.status, 'pending'),
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
  const conditions = status ? [eq(followUps.status, status as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled')] : []

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
  createdBy?: string
  title?: string
}) {
  try {
    // Use a default system user ID if not provided
    const createdBy = data.createdBy || '00000000-0000-0000-0000-000000000000'

    await db.insert(followUps).values({
      memberId: data.memberId,
      scheduledDate: data.scheduledDate,
      followUpType: data.type as 'new_member' | 'absence' | 'pastoral_care' | 'prayer_request' | 'discipleship' | 'phone_call' | 'visit' | 'prayer' | 'counseling' | 'other',
      notes: data.notes || null,
      status: 'pending',
      createdBy: createdBy,
      title: data.title || `Follow-up: ${data.type}`,
    })

    revalidatePath('/shepherding')
    return { success: true }
  } catch (error) {
    console.error('Error creating follow-up:', error)
    return { success: false, error: 'Failed to create follow-up' }
  }
}

export async function completeFollowUp(id: string, data?: { outcome?: string; notes?: string }) {
  try {
    await db.update(followUps).set({
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
      notes: data?.notes ? `${data.outcome || 'Completed'}: ${data.notes}` : data?.outcome || 'Completed',
    }).where(eq(followUps.id, id))
  } catch (error) {
    console.error('Error completing follow-up:', error)
    return { success: false, error: 'Failed to complete follow-up' }
  }

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

// Promote member to shepherd
export async function promoteToShepherd(memberId: string) {
  // Check if already a shepherd
  const [existing] = await db
    .select({ id: shepherds.id })
    .from(shepherds)
    .where(and(
      eq(shepherds.memberId, memberId),
      eq(shepherds.isActive, true)
    ))
    .limit(1)

  if (existing) {
    return { success: false, error: 'Already a shepherd' }
  }

  const [shepherd] = await db.insert(shepherds).values({
    memberId,
    assignedDate: new Date().toISOString().split('T')[0],
    isActive: true,
  }).returning()

  revalidatePath('/shepherding')
  revalidatePath('/shepherding/assignments')
  revalidatePath('/members')
  return { success: true, shepherdId: shepherd.id }
}

export async function getActiveShepherds() {
  return db
    .select({
      id: shepherds.id,
      memberId: shepherds.memberId,
      name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
      phone: members.phonePrimary,
      assignedDate: shepherds.assignedDate,
    })
    .from(shepherds)
    .innerJoin(members, eq(shepherds.memberId, members.id))
    .where(eq(shepherds.isActive, true))
    .orderBy(members.firstName)
}
