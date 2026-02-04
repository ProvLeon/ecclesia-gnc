'use server'

import { db } from '@/lib/db'
import { tithes, offerings, expenses, members, attendance, services, departments, memberDepartments } from '@/lib/db/schema'
import { sql, eq, gte, and, desc, count } from 'drizzle-orm'

// Get monthly financial trends for the past 6 months
export async function getFinanceTrends() {
    const months = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthStart = date.toISOString().split('T')[0]
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
        const monthEnd = nextMonth.toISOString().split('T')[0]

        months.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            monthStart,
            monthEnd,
        })
    }

    const trends = await Promise.all(
        months.map(async ({ month, monthStart, monthEnd }) => {
            const [titheSum] = await db
                .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
                .from(tithes)
                .where(and(gte(tithes.paymentDate, monthStart), sql`${tithes.paymentDate} < ${monthEnd}`))

            const [offeringSum] = await db
                .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
                .from(offerings)
                .where(and(gte(offerings.serviceDate, monthStart), sql`${offerings.serviceDate} < ${monthEnd}`))

            const [expenseSum] = await db
                .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
                .from(expenses)
                .where(and(
                    gte(expenses.expenseDate, monthStart),
                    sql`${expenses.expenseDate} < ${monthEnd}`,
                    eq(expenses.status, 'approved')
                ))

            return {
                month,
                tithes: Number(titheSum?.total || 0),
                offerings: Number(offeringSum?.total || 0),
                expenses: Number(expenseSum?.total || 0),
            }
        })
    )

    return trends
}

// Get weekly attendance for the past 8 weeks
export async function getAttendanceTrends() {
    const weeks = []
    const today = new Date()

    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - (i * 7) - today.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        weeks.push({
            name: `Wk ${8 - i}`,
            start: weekStart.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0],
        })
    }

    const attendanceData = await Promise.all(
        weeks.map(async ({ name, start, end }) => {
            const [result] = await db
                .select({ count: count() })
                .from(attendance)
                .innerJoin(services, eq(attendance.serviceId, services.id))
                .where(and(
                    gte(services.serviceDate, start),
                    sql`${services.serviceDate} <= ${end}`
                ))

            return {
                name,
                attendance: Number(result?.count || 0),
                average: 50, // Placeholder average
            }
        })
    )

    return attendanceData
}

// Get member distribution by status
export async function getMemberDistribution() {
    const [stats] = await db
        .select({
            active: sql<number>`count(*) filter (where ${members.memberStatus} = 'active')`,
            inactive: sql<number>`count(*) filter (where ${members.memberStatus} = 'inactive')`,
            visitors: sql<number>`count(*) filter (where ${members.memberStatus} = 'visitor')`,
            newConverts: sql<number>`count(*) filter (where ${members.memberStatus} = 'new_convert')`,
        })
        .from(members)

    return [
        { name: 'Active', value: Number(stats?.active || 0) },
        { name: 'Inactive', value: Number(stats?.inactive || 0) },
        { name: 'Visitors', value: Number(stats?.visitors || 0) },
        { name: 'New Converts', value: Number(stats?.newConverts || 0) },
    ].filter(item => item.value > 0)
}

// Get department member counts
export async function getDepartmentStats() {
    const depts = await db
        .select({
            name: departments.name,
            members: sql<number>`count(${memberDepartments.id})`,
        })
        .from(departments)
        .leftJoin(memberDepartments, and(
            eq(memberDepartments.departmentId, departments.id),
            eq(memberDepartments.isActive, true)
        ))
        .where(eq(departments.isActive, true))
        .groupBy(departments.id, departments.name)
        .orderBy(desc(sql`count(${memberDepartments.id})`))

    return depts.map(d => ({
        name: d.name,
        members: Number(d.members || 0),
    }))
}

// Get member growth over past 6 months
export async function getMemberGrowth() {
    const months = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthStart = date.toISOString().split('T')[0]
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
        const monthEnd = nextMonth.toISOString().split('T')[0]

        months.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            monthStart,
            monthEnd,
        })
    }

    const growth = await Promise.all(
        months.map(async ({ month, monthStart, monthEnd }) => {
            const [result] = await db
                .select({ count: count() })
                .from(members)
                .where(and(
                    gte(members.joinDate, monthStart),
                    sql`${members.joinDate} < ${monthEnd}`
                ))

            return {
                month,
                newMembers: Number(result?.count || 0),
            }
        })
    )

    return growth
}
