'use server'

import { db } from '@/lib/db'
import { events, departments } from '@/lib/db/schema'
import { eq, desc, sql, gte, and, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getEvents(filter?: { upcoming?: boolean }, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize
    const conditions = [eq(events.isActive, true)]

    if (filter?.upcoming) {
        const today = new Date().toISOString().split('T')[0]
        conditions.push(gte(events.startDate, today))
    }

    const results = await db
        .select({
            id: events.id,
            title: events.title,
            description: events.description,
            eventType: events.eventType,
            startDate: events.startDate,
            endDate: events.endDate,
            startTime: events.startTime,
            endTime: events.endTime,
            location: events.location,
            registrationRequired: events.registrationRequired,
            maxAttendees: events.maxAttendees,
            departmentName: departments.name,
            createdAt: events.createdAt,
        })
        .from(events)
        .leftJoin(departments, eq(events.departmentId, departments.id))
        .where(and(...conditions))
        .orderBy(asc(events.startDate))
        .limit(pageSize)
        .offset(offset)

    const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(and(...conditions))

    return {
        data: results,
        pagination: { page, pageSize, total: Number(countResult?.count || 0) },
    }
}

export async function getEvent(id: string) {
    const [event] = await db
        .select({
            id: events.id,
            title: events.title,
            description: events.description,
            eventType: events.eventType,
            startDate: events.startDate,
            endDate: events.endDate,
            startTime: events.startTime,
            endTime: events.endTime,
            location: events.location,
            registrationRequired: events.registrationRequired,
            maxAttendees: events.maxAttendees,
            departmentId: events.departmentId,
            departmentName: departments.name,
        })
        .from(events)
        .leftJoin(departments, eq(events.departmentId, departments.id))
        .where(eq(events.id, id))
        .limit(1)
    return event
}

export async function createEvent(data: {
    title: string
    description?: string
    eventType?: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    location?: string
    departmentId?: string
    registrationRequired?: boolean
    maxAttendees?: number
}) {
    const [event] = await db
        .insert(events)
        .values({
            title: data.title,
            description: data.description,
            eventType: data.eventType,
            startDate: data.startDate,
            endDate: data.endDate,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location,
            departmentId: data.departmentId || undefined,
            registrationRequired: data.registrationRequired || false,
            maxAttendees: data.maxAttendees,
        })
        .returning()

    revalidatePath('/events')
    return { success: true, event }
}

export async function updateEvent(id: string, data: Partial<{
    title: string
    description: string
    eventType: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    location: string
    departmentId: string
    registrationRequired: boolean
    maxAttendees: number
}>) {
    const [updated] = await db
        .update(events)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning()

    revalidatePath('/events')
    return { success: true, event: updated }
}

export async function deleteEvent(id: string) {
    await db
        .update(events)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(events.id, id))

    revalidatePath('/events')
    return { success: true }
}

export async function getEventStats() {
    const today = new Date().toISOString().split('T')[0]

    const [stats] = await db
        .select({
            total: sql<number>`count(*)`,
            upcoming: sql<number>`count(*) filter (where ${events.startDate} >= ${today})`,
            thisMonth: sql<number>`count(*) filter (where ${events.startDate} >= date_trunc('month', current_date) AND ${events.startDate} < date_trunc('month', current_date) + interval '1 month')`,
        })
        .from(events)
        .where(eq(events.isActive, true))

    return {
        total: Number(stats?.total || 0),
        upcoming: Number(stats?.upcoming || 0),
        thisMonth: Number(stats?.thisMonth || 0),
    }
}
