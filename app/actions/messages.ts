'use server'

import { db } from '@/lib/db'
import { smsMessages, smsRecipients, members } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY
const ARKESEL_SENDER_ID = process.env.ARKESEL_SENDER_ID || 'GNC AG'

export async function getMessageStats() {
  const [totalSent] = await db
    .select({ count: sql<number>`count(*)` })
    .from(smsMessages)
    .where(eq(smsMessages.status, 'sent'))

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const [sentThisMonth] = await db
    .select({ count: sql<number>`count(*)` })
    .from(smsMessages)
    .where(
      and(
        eq(smsMessages.status, 'sent'),
        sql`${smsMessages.createdAt} >= ${startOfMonth}`
      )
    )

  const [failed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(smsMessages)
    .where(eq(smsMessages.status, 'failed'))

  return {
    totalSent: Number(totalSent?.count || 0),
    sentThisMonth: Number(sentThisMonth?.count || 0),
    failed: Number(failed?.count || 0),
  }
}

export async function getMessages(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize

  const results = await db
    .select({
      id: smsMessages.id,
      messageText: smsMessages.messageText,
      recipientType: smsMessages.recipientType,
      status: smsMessages.status,
      totalRecipients: smsMessages.totalRecipients,
      successfulSends: smsMessages.successfulSends,
      failedSends: smsMessages.failedSends,
      createdAt: smsMessages.createdAt,
    })
    .from(smsMessages)
    .orderBy(desc(smsMessages.createdAt))
    .limit(pageSize)
    .offset(offset)

  return { data: results }
}

export async function sendSMS(data: {
  recipients: { memberId?: string; phone: string }[]
  message: string
}) {
  const { recipients, message } = data

  if (!ARKESEL_API_KEY) {
    return { success: false, error: 'SMS API not configured' }
  }

  // Create the message record first
  const [newMessage] = await db.insert(smsMessages).values({
    messageText: message,
    recipientType: 'Individual',
    status: 'pending',
    totalRecipients: recipients.length,
    successfulSends: 0,
    failedSends: 0,
  }).returning()

  let successCount = 0
  let failCount = 0

  for (const recipient of recipients) {
    try {
      // Arkesel SMS API
      const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
        method: 'POST',
        headers: {
          'api-key': ARKESEL_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: ARKESEL_SENDER_ID,
          message,
          recipients: [recipient.phone],
        }),
      })

      const result = await response.json()
      const status = result.status === 'success' ? 'sent' : 'failed'

      // Log recipient
      await db.insert(smsRecipients).values({
        messageId: newMessage.id,
        memberId: recipient.memberId || undefined,
        phoneNumber: recipient.phone,
        status,
        sentAt: status === 'sent' ? new Date() : undefined,
      })

      if (status === 'sent') successCount++
      else failCount++
    } catch (e) {
      await db.insert(smsRecipients).values({
        messageId: newMessage.id,
        memberId: recipient.memberId || undefined,
        phoneNumber: recipient.phone,
        status: 'failed',
        errorMessage: e instanceof Error ? e.message : 'Unknown error',
      })
      failCount++
    }
  }

  // Update message with results
  await db.update(smsMessages).set({
    status: failCount === recipients.length ? 'failed' : 'sent',
    successfulSends: successCount,
    failedSends: failCount,
    sentTime: new Date(),
  }).where(eq(smsMessages.id, newMessage.id))

  revalidatePath('/messages')

  return { success: true, sent: successCount, failed: failCount, total: recipients.length }
}

export async function getMembersForSMS(filter?: { gender?: string; status?: string }) {
  const conditions = []
  if (filter?.status) conditions.push(eq(members.memberStatus, filter.status as 'active' | 'inactive' | 'visitor' | 'new_convert'))
  if (filter?.gender) conditions.push(eq(members.gender, filter.gender as 'male' | 'female'))

  return db
    .select({
      id: members.id,
      name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
      phone: members.phonePrimary,
      memberId: members.memberId,
    })
    .from(members)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(members.firstName)
    .limit(500)
}

export async function sendBroadcast(data: {
  type: 'all' | 'department' | 'status'
  departmentId?: string
  memberStatus?: string
  message: string
}) {
  const { type, departmentId, memberStatus, message } = data

  if (!ARKESEL_API_KEY) {
    return { success: false, error: 'SMS API not configured' }
  }

  let recipientList: { id: string; phone: string | null }[] = []

  // Department filtering - join with member_departments table
  if (type === 'department' && departmentId) {
    const { memberDepartments } = await import('@/lib/db/schema')

    recipientList = await db
      .select({ id: members.id, phone: members.phonePrimary })
      .from(members)
      .innerJoin(memberDepartments, and(
        eq(memberDepartments.memberId, members.id),
        eq(memberDepartments.departmentId, departmentId),
        eq(memberDepartments.isActive, true)
      ))
      .where(and(
        sql`${members.phonePrimary} IS NOT NULL`,
        sql`length(${members.phonePrimary}) >= 10`
      ))
  } else if (type === 'status' && memberStatus) {
    recipientList = await db
      .select({ id: members.id, phone: members.phonePrimary })
      .from(members)
      .where(and(
        eq(members.memberStatus, memberStatus as 'active' | 'inactive' | 'visitor' | 'new_convert'),
        sql`${members.phonePrimary} IS NOT NULL`,
        sql`length(${members.phonePrimary}) >= 10`
      ))
  } else if (type === 'all') {
    recipientList = await db
      .select({ id: members.id, phone: members.phonePrimary })
      .from(members)
      .where(and(
        eq(members.memberStatus, 'active'),
        sql`${members.phonePrimary} IS NOT NULL`,
        sql`length(${members.phonePrimary}) >= 10`
      ))
  }

  const validRecipients = recipientList
    .filter(r => r.phone)
    .map(r => ({
      memberId: r.id,
      phone: r.phone!,
    }))

  if (validRecipients.length === 0) {
    return { success: false, error: 'No recipients with valid phone numbers found matching criteria' }
  }

  // Use existing sendSMS function
  return sendSMS({ recipients: validRecipients, message })
}

/**
 * Get user's broadcast scope for role-based filtering.
 * For Dept Leaders: returns their department ID
 * For Admins: returns null (full access)
 */
export async function getUserBroadcastScope() {
  const { getCurrentUserWithRole, getDeptLeaderDepartmentId } = await import('@/lib/auth/proxy')

  const user = await getCurrentUserWithRole()
  if (!user) return { role: null, departmentId: null }

  if (user.role === 'dept_leader') {
    const deptId = await getDeptLeaderDepartmentId(user.id)
    return { role: user.role, departmentId: deptId }
  }

  return { role: user.role, departmentId: null }
}


// ============================================================================
// SMS TEMPLATES
// ============================================================================

import { smsTemplates } from '@/lib/db/schema'

export async function getSmsTemplates() {
  return db
    .select()
    .from(smsTemplates)
    .where(eq(smsTemplates.isActive, true))
    .orderBy(desc(smsTemplates.createdAt))
}

export async function getSmsTemplatesByCategory(category: string) {
  return db
    .select()
    .from(smsTemplates)
    .where(and(
      eq(smsTemplates.isActive, true),
      eq(smsTemplates.category, category)
    ))
    .orderBy(smsTemplates.name)
}

export async function getSmsTemplate(id: string) {
  const [template] = await db
    .select()
    .from(smsTemplates)
    .where(eq(smsTemplates.id, id))
    .limit(1)
  return template
}

export async function createSmsTemplate(data: {
  name: string
  category: string
  content: string
}) {
  const [template] = await db
    .insert(smsTemplates)
    .values({
      name: data.name,
      category: data.category,
      content: data.content,
    })
    .returning()

  revalidatePath('/messages/templates')
  return { success: true, template }
}

export async function updateSmsTemplate(id: string, data: {
  name?: string
  category?: string
  content?: string
}) {
  const [updated] = await db
    .update(smsTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(smsTemplates.id, id))
    .returning()

  revalidatePath('/messages/templates')
  return { success: true, template: updated }
}

export async function deleteSmsTemplate(id: string) {
  await db
    .update(smsTemplates)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(smsTemplates.id, id))

  revalidatePath('/messages/templates')
  return { success: true }
}
