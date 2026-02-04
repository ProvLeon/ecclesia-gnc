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
    if (filter?.status) conditions.push(eq(members.memberStatus, filter.status as any))
    if (filter?.gender) conditions.push(eq(members.gender, filter.gender as any))

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

export async function sendBroadcast(data: { message: string; recipientType: string }) {
    const { message, recipientType } = data

    if (!ARKESEL_API_KEY) {
        return { success: false, error: 'SMS API not configured' }
    }

    // Get recipients based on type
    let recipientList: { id: string; phone: string | null }[] = []

    if (recipientType === 'all') {
        recipientList = await db
            .select({ id: members.id, phone: members.phonePrimary })
            .from(members)
            .where(sql`${members.phonePrimary} IS NOT NULL`)
    } else if (recipientType === 'active') {
        recipientList = await db
            .select({ id: members.id, phone: members.phonePrimary })
            .from(members)
            .where(and(eq(members.memberStatus, 'active'), sql`${members.phonePrimary} IS NOT NULL`))
    } else if (recipientType === 'leaders') {
        // For now, just get active members - extend this when you have leader roles
        recipientList = await db
            .select({ id: members.id, phone: members.phonePrimary })
            .from(members)
            .where(and(eq(members.memberStatus, 'active'), sql`${members.phonePrimary} IS NOT NULL`))
            .limit(50)
    }

    const validRecipients = recipientList.filter(r => r.phone).map(r => ({
        memberId: r.id,
        phone: r.phone!,
    }))

    if (validRecipients.length === 0) {
        return { success: false, error: 'No recipients with valid phone numbers' }
    }

    // Use existing sendSMS function
    return sendSMS({ recipients: validRecipients, message })
}
