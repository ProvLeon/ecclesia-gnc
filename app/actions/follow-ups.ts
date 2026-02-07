'use server'

import { db } from '@/lib/db'
import {
  followUps,
  followUpTemplates,
  followUpAuditLog,
  members,
  shepherds,
  users,
  shepherdAssignments,
} from '@/lib/db/schema'
import {
  eq,
  desc,
  and,
  sql,
  ne,
  gte,
} from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/app/actions/auth'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateFollowUpInput {
  memberId: string
  followUpType: string
  title: string
  description?: string
  scheduledDate: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  templateId?: string
  notes?: string
}

export interface CompleteFollowUpInput {
  outcome: 'contacted' | 'not_home' | 'left_message' | 'promised_action' | 'resolved' | 'escalated' | 'no_contact'
  outcomeNotes: string
  notes?: string
}

export interface CreateFollowUpTemplateInput {
  departmentId?: string
  name: string
  description?: string
  followUpType: string
  suggestedQuestions?: string[]
  durationMinutes?: number
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

async function isShepherdOfMember(userId: string, memberId: string): Promise<boolean> {
  const [shepherd] = await db
    .select({ id: shepherds.id })
    .from(shepherds)
    .innerJoin(members, eq(shepherds.memberId, members.id))
    .where(
      and(
        eq(members.userId, userId),
        eq(shepherds.isActive, true)
      )
    )
    .limit(1)

  if (!shepherd) return false

  const [assignment] = await db
    .select({ id: shepherdAssignments.id })
    .from(shepherdAssignments)
    .where(
      and(
        eq(shepherdAssignments.shepherdId, shepherd.id),
        eq(shepherdAssignments.memberId, memberId),
        eq(shepherdAssignments.isActive, true)
      )
    )
    .limit(1)

  return !!assignment
}

async function logFollowUpAudit(
  followUpId: string,
  action: 'created' | 'assigned' | 'status_changed' | 'completed' | 'cancelled' | 'notes_added',
  userId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
) {
  try {
    await db.insert(followUpAuditLog).values({
      followUpId,
      action,
      changedBy: userId,
      oldValues: oldValues || undefined,
      newValues: newValues || undefined,
      actionDate: new Date(),
    })
  } catch (error) {
    console.error('Failed to log follow-up audit:', error)
  }
}

// ============================================================================
// FOLLOW-UP CRUD OPERATIONS
// ============================================================================

export async function createFollowUp(data: CreateFollowUpInput) {
  try {
    // Get authenticated user from session
    const authUser = await getUser()
    if (!authUser || !authUser.id) {
      return {
        success: false,
        error: 'Unauthorized - user not authenticated',
      }
    }

    const userId = authUser.id

    const [userData] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!userData) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const canCreate =
      userData.role === 'super_admin' ||
      userData.role === 'pastor' ||
      userData.role === 'admin' ||
      (userData.role === 'shepherd' && (await isShepherdOfMember(userId, data.memberId)))

    if (!canCreate) {
      return {
        success: false,
        error: 'You do not have permission to create follow-ups for this member',
      }
    }

    const [followUp] = await db
      .insert(followUps)
      .values({
        memberId: data.memberId,
        followUpType: data.followUpType as 'new_member' | 'absence' | 'pastoral_care' | 'prayer_request' | 'discipleship' | 'phone_call' | 'visit' | 'prayer' | 'counseling' | 'other',
        title: data.title,
        description: data.description || null,
        scheduledDate: data.scheduledDate,
        dueDate: data.dueDate || null,
        priority: (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        status: 'pending',
        createdBy: userId,
        assignedBy: null,
        templateId: data.templateId || null,
        notes: data.notes || null,
      })
      .returning()

    await logFollowUpAudit(followUp.id, 'created', userId, undefined, {
      title: followUp.title,
      type: followUp.followUpType,
      priority: followUp.priority,
    })

    revalidatePath('/shepherding/follow-ups')
    revalidatePath('/reports/shepherding')

    return {
      success: true,
      data: followUp,
    }
  } catch (error) {
    console.error('Error creating follow-up:', error)
    return {
      success: false,
      error: 'Failed to create follow-up',
    }
  }
}

export async function completeFollowUp(
  followUpId: string,
  data: CompleteFollowUpInput
) {
  try {
    // Get authenticated user from session
    const authUser = await getUser()
    if (!authUser || !authUser.id) {
      return {
        success: false,
        error: 'Unauthorized - user not authenticated',
      }
    }

    const userId = authUser.id

    const [followUp] = await db
      .select()
      .from(followUps)
      .where(eq(followUps.id, followUpId))
      .limit(1)

    if (!followUp) {
      return { success: false, error: 'Follow-up not found' }
    }

    const [userData] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!userData) {
      return { success: false, error: 'User not found' }
    }

    const canComplete =
      userData.role === 'super_admin' ||
      userData.role === 'pastor' ||
      userData.role === 'admin' ||
      followUp.createdBy === userId ||
      (userData.role === 'shepherd' && (await isShepherdOfMember(userId, followUp.memberId)))

    if (!canComplete) {
      return { success: false, error: 'You do not have permission to complete this follow-up' }
    }

    const completedDate = new Date().toISOString().split('T')[0]

    const [updated] = await db
      .update(followUps)
      .set({
        status: 'completed',
        completedBy: userId,
        outcome: data.outcome as 'contacted' | 'not_home' | 'left_message' | 'promised_action' | 'resolved' | 'escalated' | 'no_contact',
        outcomeNotes: data.outcomeNotes,
        notes: data.notes || '',
        completedDate: completedDate,
        updatedAt: new Date(),
      })
      .where(eq(followUps.id, followUpId))
      .returning()

    await logFollowUpAudit(
      followUpId,
      'completed',
      userId,
      { status: followUp.status },
      { status: 'completed', outcome: data.outcome }
    )

    revalidatePath('/shepherding/follow-ups')
    revalidatePath('/reports/shepherding')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error completing follow-up:', error)
    return { success: false, error: 'Failed to complete follow-up' }
  }
}

// ============================================================================
// FOLLOW-UP RETRIEVAL & FILTERING
// ============================================================================

export async function getShepherdFollowUps(shepherdId: string) {
  try {
    const followUpList = await db
      .select({
        id: followUps.id,
        title: followUps.title,
        memberId: followUps.memberId,
        memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
        memberPhone: members.phonePrimary,
        type: followUps.followUpType,
        status: followUps.status,
        priority: followUps.priority,
        scheduledDate: followUps.scheduledDate,
        dueDate: followUps.dueDate,
        outcome: followUps.outcome,
        createdAt: followUps.createdAt,
      })
      .from(followUps)
      .innerJoin(members, eq(followUps.memberId, members.id))
      .where(and(
        eq(followUps.shepherdId, shepherdId),
        ne(followUps.status, 'cancelled')
      ))
      .orderBy(desc(followUps.scheduledDate))

    return { success: true, data: followUpList }
  } catch (error) {
    console.error('Error fetching shepherd follow-ups:', error)
    return { success: false, error: 'Failed to fetch follow-ups', data: [] }
  }
}

export async function getFollowUpsByStatus(status: string, userId: string) {
  try {
    const validStatus = status as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

    const [userData] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!userData) {
      return { success: false, error: 'User not found', data: [] }
    }

    let followUpList = await db
      .select({
        id: followUps.id,
        title: followUps.title,
        memberId: followUps.memberId,
        memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
        status: followUps.status,
        priority: followUps.priority,
        scheduledDate: followUps.scheduledDate,
        dueDate: followUps.dueDate,
        outcome: followUps.outcome,
      })
      .from(followUps)
      .innerJoin(members, eq(followUps.memberId, members.id))
      .where(eq(followUps.status, validStatus))
      .orderBy(desc(followUps.scheduledDate))

    if (userData.role === 'shepherd') {
      const [shepherd] = await db
        .select({ id: shepherds.id })
        .from(shepherds)
        .where(eq(shepherds.memberId, userId))
        .limit(1)

      if (shepherd) {
        followUpList = followUpList.filter(f => f.memberId === shepherd.id)
      }
    } else if (userData.role !== 'admin' && userData.role !== 'pastor' && userData.role !== 'super_admin') {
      return { success: false, error: 'Insufficient permissions', data: [] }
    }

    return { success: true, data: followUpList }
  } catch (error) {
    console.error('Error getting follow-ups by status:', error)
    return { success: false, error: 'Failed to fetch follow-ups', data: [] }
  }
}

export async function getOverdueFollowUps(userId: string) {
  try {
    const [userData] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!userData) {
      return { success: false, error: 'User not found', data: [] }
    }

    const today = new Date().toISOString().split('T')[0]

    let overdueList = await db
      .select({
        id: followUps.id,
        title: followUps.title,
        memberId: followUps.memberId,
        memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
        priority: followUps.priority,
        dueDate: followUps.dueDate,
      })
      .from(followUps)
      .innerJoin(members, eq(followUps.memberId, members.id))
      .where(
        and(
          sql`${followUps.dueDate} < ${today}`,
          ne(followUps.status, 'completed'),
          ne(followUps.status, 'cancelled')
        )
      )

    if (userData.role === 'shepherd') {
      const [shepherd] = await db
        .select({ id: shepherds.id })
        .from(shepherds)
        .where(eq(shepherds.memberId, userId))
        .limit(1)

      if (shepherd) {
        overdueList = overdueList.filter(f => f.memberId === shepherd.id)
      }
    } else if (userData.role !== 'admin' && userData.role !== 'pastor' && userData.role !== 'super_admin') {
      return { success: false, error: 'Insufficient permissions', data: [] }
    }

    return { success: true, data: overdueList }
  } catch (error) {
    console.error('Error getting overdue follow-ups:', error)
    return { success: false, error: 'Failed to fetch overdue follow-ups', data: [] }
  }
}

// ============================================================================
// STATISTICS & REPORTING
// ============================================================================

export async function getFollowUpStats() {
  try {
    const [totals] = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
        assigned: sql<number>`sum(case when status = 'assigned' then 1 else 0 end)`,
        inProgress: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
        completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
        cancelled: sql<number>`sum(case when status = 'cancelled' then 1 else 0 end)`,
        overdue: sql<number>`sum(case when due_date <= current_date and status != 'completed' and status != 'cancelled' then 1 else 0 end)`,
      })
      .from(followUps)

    return {
      total: Number(totals?.total || 0),
      pending: Number(totals?.pending || 0),
      assigned: Number(totals?.assigned || 0),
      inProgress: Number(totals?.inProgress || 0),
      completed: Number(totals?.completed || 0),
      cancelled: Number(totals?.cancelled || 0),
      overdue: Number(totals?.overdue || 0),
    }
  } catch (error) {
    console.error('Error getting follow-up stats:', error)
    return {
      total: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
    }
  }
}

export async function getShepherdCompletionRate(shepherdId: string) {
  try {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
      })
      .from(followUps)
      .where(
        and(
          eq(followUps.shepherdId, shepherdId),
          gte(followUps.createdAt, threeMonthsAgo)
        )
      )

    const total = Number(stats?.total || 0)
    const completed = Number(stats?.completed || 0)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      completionRate,
    }
  } catch (error) {
    console.error('Error calculating completion rate:', error)
    return {
      total: 0,
      completed: 0,
      completionRate: 0,
    }
  }
}

// ============================================================================
// FOLLOW-UP TEMPLATES
// ============================================================================

export async function createFollowUpTemplate(data: CreateFollowUpTemplateInput) {
  try {
    // Get authenticated user from session
    const authUser = await getUser()
    if (!authUser || !authUser.id) {
      return { success: false, error: 'Unauthorized - user not authenticated' }
    }

    const userId = authUser.id

    const [userData] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!userData) {
      return { success: false, error: 'User not found' }
    }

    if (userData.role !== 'super_admin' && userData.role !== 'pastor' && userData.role !== 'admin') {
      return { success: false, error: 'You do not have permission to create templates' }
    }

    const [template] = await db
      .insert(followUpTemplates)
      .values({
        departmentId: data.departmentId || null,
        name: data.name,
        description: data.description || null,
        followUpType: data.followUpType as 'new_member' | 'absence' | 'pastoral_care' | 'prayer_request' | 'discipleship' | 'phone_call' | 'visit' | 'prayer' | 'counseling' | 'other',
        suggestedQuestions: data.suggestedQuestions || null,
        durationMinutes: data.durationMinutes || null,
        createdBy: userId,
      })
      .returning()

    revalidatePath('/shepherding/follow-ups')

    return { success: true, data: template }
  } catch (error) {
    console.error('Error creating template:', error)
    return { success: false, error: 'Failed to create template' }
  }
}

export async function getFollowUpTemplates(departmentId?: string) {
  try {
    let templateList = await db
      .select()
      .from(followUpTemplates)
      .where(eq(followUpTemplates.isActive, true))

    if (departmentId) {
      templateList = templateList.filter(t => t.departmentId === departmentId)
    }

    const sorted = templateList.sort((a, b) => a.name.localeCompare(b.name))

    return { success: true, data: sorted }
  } catch (error) {
    console.error('Error getting templates:', error)
    return { success: false, error: 'Failed to fetch templates', data: [] }
  }
}

// ============================================================================
// FOLLOW-UP DETAILS & AUDIT
// ============================================================================

export async function getFollowUpDetail(followUpId: string) {
  try {
    const [followUp] = await db
      .select()
      .from(followUps)
      .where(eq(followUps.id, followUpId))
      .limit(1)

    if (!followUp) {
      return { success: false, error: 'Follow-up not found' }
    }

    const auditLog = await db
      .select()
      .from(followUpAuditLog)
      .where(eq(followUpAuditLog.followUpId, followUpId))
      .orderBy(desc(followUpAuditLog.actionDate))

    return { success: true, data: { followUp, audit: auditLog } }
  } catch (error) {
    console.error('Error getting follow-up detail:', error)
    return { success: false, error: 'Failed to fetch follow-up' }
  }
}

export async function getFollowUpAuditLog(followUpId: string) {
  try {
    const auditLog = await db
      .select()
      .from(followUpAuditLog)
      .where(eq(followUpAuditLog.followUpId, followUpId))
      .orderBy(desc(followUpAuditLog.actionDate))

    return { success: true, data: auditLog }
  } catch (error) {
    console.error('Error getting audit log:', error)
    return { success: false, error: 'Failed to fetch audit log', data: [] }
  }
}
