'use server'

import { db } from '@/lib/db'
import { tithes, offerings, expenses, members, attendance, services, departments, memberDepartments } from '@/lib/db/schema'
import { sql, eq, gte, and, desc, count, lte } from 'drizzle-orm'

// Helper function to get date range for a month
function getMonthDateRange(monthsBack: number) {
  const today = new Date()
  const date = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1)
  const monthStart = date.toISOString().split('T')[0]
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  const monthEnd = nextMonth.toISOString().split('T')[0]
  const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })

  return { monthStart, monthEnd, monthLabel }
}

// Helper function to get date range for a week
function getWeekDateRange(weeksBack: number) {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - (weeksBack * 7) - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
    label: `Wk ${8 - weeksBack}`,
  }
}

// Get monthly financial trends for the past 6 months using a single optimized query
export async function getFinanceTrends() {
  const months = Array.from({ length: 6 }, (_, i) => getMonthDateRange(5 - i))

  // Get all tithes for the 6-month period in one query
  const allTithes = await db
    .select({
      monthStart: sql<string>`DATE_TRUNC('month', ${tithes.paymentDate}::date)::text`,
      total: sql<number>`COALESCE(SUM(${tithes.amount}), 0)`,
    })
    .from(tithes)
    .where(
      gte(
        tithes.paymentDate,
        months[0].monthStart
      )
    )
    .groupBy(sql`DATE_TRUNC('month', ${tithes.paymentDate}::date)`)

  // Get all offerings for the 6-month period in one query
  const allOfferings = await db
    .select({
      monthStart: sql<string>`DATE_TRUNC('month', ${offerings.serviceDate}::date)::text`,
      total: sql<number>`COALESCE(SUM(${offerings.amount}), 0)`,
    })
    .from(offerings)
    .where(
      gte(
        offerings.serviceDate,
        months[0].monthStart
      )
    )
    .groupBy(sql`DATE_TRUNC('month', ${offerings.serviceDate}::date)`)

  // Get all expenses for the 6-month period in one query
  const allExpenses = await db
    .select({
      monthStart: sql<string>`DATE_TRUNC('month', ${expenses.expenseDate}::date)::text`,
      total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        gte(
          expenses.expenseDate,
          months[0].monthStart
        ),
        eq(expenses.status, 'approved')
      )
    )
    .groupBy(sql`DATE_TRUNC('month', ${expenses.expenseDate}::date)`)

  // Map results back to month objects
  const tithesByMonth = new Map(allTithes.map(t => [t.monthStart?.split('T')[0].slice(0, 7), Number(t.total || 0)]))
  const offeringsByMonth = new Map(allOfferings.map(o => [o.monthStart?.split('T')[0].slice(0, 7), Number(o.total || 0)]))
  const expensesByMonth = new Map(allExpenses.map(e => [e.monthStart?.split('T')[0].slice(0, 7), Number(e.total || 0)]))

  return months.map(({ monthStart, monthLabel }) => {
    const key = monthStart.slice(0, 7)
    return {
      month: monthLabel,
      tithes: tithesByMonth.get(key) || 0,
      offerings: offeringsByMonth.get(key) || 0,
      expenses: expensesByMonth.get(key) || 0,
    }
  })
}

// Get weekly attendance for the past 8 weeks using optimized batch query
export async function getAttendanceTrends() {
  const weeks = Array.from({ length: 8 }, (_, i) => getWeekDateRange(7 - i))
  const startDate = weeks[0].start
  const endDate = weeks[weeks.length - 1].end

  // Get all attendance for the 8-week period in one optimized query
  const attendanceData = await db
    .select({
      weekStart: sql<string>`DATE_TRUNC('week', ${services.serviceDate}::date)::text`,
      count: count(),
    })
    .from(attendance)
    .innerJoin(services, eq(attendance.serviceId, services.id))
    .where(
      and(
        gte(services.serviceDate, startDate),
        lte(services.serviceDate, endDate)
      )
    )
    .groupBy(sql`DATE_TRUNC('week', ${services.serviceDate}::date)`)

  const attendanceByWeek = new Map(attendanceData.map(a => [a.weekStart?.split('T')[0], Number(a.count || 0)]))

  return weeks.map(({ start, label }) => ({
    name: label,
    attendance: attendanceByWeek.get(start) || 0,
    average: 50, // Placeholder average - can be calculated from historical data
  }))
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
    .leftJoin(
      memberDepartments,
      and(
        eq(memberDepartments.departmentId, departments.id),
        eq(memberDepartments.isActive, true)
      )
    )
    .where(eq(departments.isActive, true))
    .groupBy(departments.id, departments.name)
    .orderBy(desc(sql`count(${memberDepartments.id})`))

  return depts.map(d => ({
    name: d.name,
    members: Number(d.members || 0),
  }))
}

// Get member growth over past 6 months using optimized batch query
export async function getMemberGrowth() {
  const months = Array.from({ length: 6 }, (_, i) => getMonthDateRange(5 - i))
  const startDate = months[0].monthStart
  const endDate = months[months.length - 1].monthEnd

  // Get all new members for the 6-month period in one query
  const growthData = await db
    .select({
      monthStart: sql<string>`DATE_TRUNC('month', ${members.joinDate}::date)::text`,
      newMembers: count(),
    })
    .from(members)
    .where(
      and(
        gte(members.joinDate, startDate),
        lte(members.joinDate, endDate)
      )
    )
    .groupBy(sql`DATE_TRUNC('month', ${members.joinDate}::date)`)

  const membersByMonth = new Map(growthData.map(g => [g.monthStart?.split('T')[0].slice(0, 7), Number(g.newMembers || 0)]))

  return months.map(({ monthStart, monthLabel }) => {
    const key = monthStart.slice(0, 7)
    return {
      month: monthLabel,
      newMembers: membersByMonth.get(key) || 0,
    }
  })
}
