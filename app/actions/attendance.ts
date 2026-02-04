'use server'

import { db } from '@/lib/db'
import { attendance, services, members } from '@/lib/db/schema'
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

interface ServiceFilters {
    startDate?: string
    endDate?: string
    serviceType?: string
    page?: number
    pageSize?: number
}

export async function getServices(filters: ServiceFilters = {}) {
    const { startDate, endDate, serviceType, page = 1, pageSize = 10 } = filters
    const offset = (page - 1) * pageSize

    const conditions = []
    if (startDate) conditions.push(gte(services.serviceDate, startDate))
    if (endDate) conditions.push(lte(services.serviceDate, endDate))
    if (serviceType) conditions.push(eq(services.serviceType, serviceType))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [results, countResult] = await Promise.all([
        db
            .select()
            .from(services)
            .where(whereClause)
            .orderBy(desc(services.serviceDate))
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: sql<number>`count(*)` })
            .from(services)
            .where(whereClause),
    ])

    return {
        data: results,
        pagination: {
            page,
            pageSize,
            total: Number(countResult[0]?.count || 0),
            totalPages: Math.ceil(Number(countResult[0]?.count || 0) / pageSize),
        },
    }
}

export async function getService(id: string) {
    const [service] = await db.select().from(services).where(eq(services.id, id))
    return service
}

export async function createService(data: {
    name: string
    serviceType: string
    serviceDate: string
    serviceTime?: string
    location?: string
    notes?: string
}) {
    const [newService] = await db.insert(services).values(data).returning()
    revalidatePath('/attendance')
    return newService
}

export async function getServiceAttendance(serviceId: string) {
    const results = await db
        .select({
            id: attendance.id,
            memberId: attendance.memberId,
            memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
            memberMemberId: members.memberId,
            checkedInAt: attendance.checkedInAt,
            checkInMethod: attendance.checkInMethod,
        })
        .from(attendance)
        .innerJoin(members, eq(attendance.memberId, members.id))
        .where(eq(attendance.serviceId, serviceId))
        .orderBy(attendance.checkedInAt)

    return results
}

export async function recordAttendance(data: {
    serviceId: string
    memberIds: string[]
    checkInMethod?: string
}) {
    const { serviceId, memberIds, checkInMethod = 'manual' } = data

    const values = memberIds.map((memberId) => ({
        serviceId,
        memberId,
        checkInMethod,
    }))

    // Use ON CONFLICT DO NOTHING to skip duplicates
    await db.insert(attendance).values(values).onConflictDoNothing()

    revalidatePath('/attendance')
    revalidatePath(`/attendance/${serviceId}`)
    return { success: true, count: memberIds.length }
}

export async function removeAttendance(id: string) {
    await db.delete(attendance).where(eq(attendance.id, id))
    revalidatePath('/attendance')
    return { success: true }
}

export async function getAttendanceStats() {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const lastSunday = new Date(today)
    lastSunday.setDate(today.getDate() - today.getDay())
    const lastSundayStr = lastSunday.toISOString().split('T')[0]

    // Get last Sunday's attendance
    const [lastSundayService] = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.serviceDate, lastSundayStr))
        .limit(1)

    let lastSundayCount = 0
    if (lastSundayService) {
        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(attendance)
            .where(eq(attendance.serviceId, lastSundayService.id))
        lastSundayCount = Number(countResult?.count || 0)
    }

    // Get this month's services count
    const [monthServicesResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(services)
        .where(gte(services.serviceDate, startOfMonth))
    const monthServices = Number(monthServicesResult?.count || 0)

    // Get monthly average using raw SQL to avoid subquery issues
    let monthlyAvg = 0
    if (monthServices > 0) {
        const avgResult = await db.execute(sql`
            SELECT COALESCE(AVG(att_count), 0) as avg_count FROM (
                SELECT COUNT(*) as att_count 
                FROM attendance a
                INNER JOIN services s ON a.service_id = s.id
                WHERE s.service_date >= ${startOfMonth}
                GROUP BY a.service_id
            ) sub
        `)
        monthlyAvg = Math.round(Number((avgResult as any)?.[0]?.avg_count || 0))
    }

    return {
        lastSunday: lastSundayCount,
        monthlyAverage: monthlyAvg,
        servicesThisMonth: monthServices,
    }
}

export async function getMembersForAttendance(search?: string) {
    const results = await db
        .select({
            id: members.id,
            memberId: members.memberId,
            name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
            phone: members.phonePrimary,
        })
        .from(members)
        .where(eq(members.memberStatus, 'active'))
        .orderBy(members.firstName)
        .limit(100)

    return results
}
