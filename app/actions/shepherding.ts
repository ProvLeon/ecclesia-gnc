'use server'

import { db } from '@/lib/db'
import { followUps, members, shepherds, shepherdAssignments, users } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/app/actions/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Default password for new accounts (must be changed on first login)
const DEFAULT_PASSWORD = 'password123'


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
    // Get the authenticated user from session
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized - user not authenticated' }
    }

    const createdBy = data.createdBy || user.id

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

// Promote member to shepherd (STEP 1: Update role only, auth creation is separate)
export async function promoteToShepherd(memberId: string) {
  try {
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

    // Update user role if they have a user account
    const [member] = await db
      .select({ userId: members.userId })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (member?.userId) {
      await db.update(users)
        .set({ role: 'shepherd', updatedAt: new Date() })
        .where(eq(users.id, member.userId))
    }

    revalidatePath('/shepherding')
    revalidatePath('/shepherding/assignments')
    revalidatePath('/members')
    return { success: true, shepherdId: shepherd.id }
  } catch (error) {
    console.error('Error promoting member to shepherd:', error)
    return { success: false, error: 'Failed to promote member' }
  }
}

// STEP 2: Create auth account for promoted member (separate from role promotion)
// This is an explicit action that requires admin authorization
// Use after promoteToShepherd() is called
export async function createAuthAccountForMember(memberId: string) {
  try {
    // Get member details
    const [member] = await db
      .select({
        userId: members.userId,
        email: members.email,
        firstName: members.firstName!,
        lastName: members.lastName!
      })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!member || !member.email) {
      return { success: false, error: 'Member not found or has no email' }
    }

    // Check if already has auth account
    const [existingUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, member.email))
      .limit(1)

    if (existingUser) {
      return {
        success: false,
        error: `User already has an auth account (current role: ${existingUser.role})`
      }
    }

    // Get their current role (should be 'shepherd' if recently promoted)
    const memberRole = 'shepherd' // Users promoted via promoteToShepherd should have this role

    // Create auth account with default password via Supabase
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.createUser({
      email: member.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: `${member.firstName} ${member.lastName}`,
        memberId: memberId,
        mustChangePassword: true,
      },
    })

    if (error) {
      console.error('Supabase user creation error:', error)
      return { success: false, error: `Failed to create auth account: ${error.message}` }
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create auth account' }
    }

    // Sync the auth user to database with shepherd role
    await db.insert(users).values({
      id: data.user.id,
      email: member.email,
      role: memberRole,
    }).onConflictDoUpdate({
      target: users.id,
      set: { role: memberRole, updatedAt: new Date() }
    })

    return {
      success: true,
      message: `Auth account created for ${member.email}. Default password: ${DEFAULT_PASSWORD}. User MUST change password on first login.`,
      userId: data.user.id,
      email: member.email,
      role: memberRole,
      temporaryPassword: DEFAULT_PASSWORD,
    }
  } catch (error) {
    console.error('Error creating auth account:', error)
    return { success: false, error: 'Failed to create auth account' }
  }
}

// Legacy function name for backward compatibility
export async function inviteShepherdToAuth(memberId: string) {
  return createAuthAccountForMember(memberId)
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
    .orderBy(desc(shepherds.assignedDate))
}
