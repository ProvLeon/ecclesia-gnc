'use server'

import { db } from '@/lib/db'
import { tithes, offerings, expenses, members } from '@/lib/db/schema'
import { eq, desc, sql, gte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getFinanceStats() {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]

  const [monthTithes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(tithes)
    .where(gte(tithes.paymentDate, startOfMonth))

  const [monthOfferings] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(offerings)
    .where(gte(offerings.serviceDate, startOfMonth))

  const [monthExpenses] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(expenses)
    .where(gte(expenses.expenseDate, startOfMonth))

  const [yearTithes] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(tithes)
    .where(gte(tithes.paymentDate, startOfYear))

  return {
    monthTithes: Number(monthTithes?.total || 0),
    monthOfferings: Number(monthOfferings?.total || 0),
    monthExpenses: Number(monthExpenses?.total || 0),
    yearTithes: Number(yearTithes?.total || 0),
    monthIncome: Number(monthTithes?.total || 0) + Number(monthOfferings?.total || 0),
    monthNet: Number(monthTithes?.total || 0) + Number(monthOfferings?.total || 0) - Number(monthExpenses?.total || 0),
  }
}

export async function getTithes(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize

  const [results, countResult] = await Promise.all([
    db
      .select({
        id: tithes.id,
        amount: tithes.amount,
        paymentDate: tithes.paymentDate,
        monthYear: tithes.monthYear,
        paymentMethod: tithes.paymentMethod,
        memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
        memberId: members.memberId,
      })
      .from(tithes)
      .leftJoin(members, eq(tithes.memberId, members.id))
      .orderBy(desc(tithes.paymentDate))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(tithes),
  ])

  return {
    data: results,
    pagination: { page, pageSize, total: Number(countResult[0]?.count || 0) },
  }
}

export async function getOfferings(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize

  const results = await db
    .select({
      id: offerings.id,
      amount: offerings.amount,
      serviceDate: offerings.serviceDate,
      offeringType: offerings.offeringType,
      paymentMethod: offerings.paymentMethod,
      isAnonymous: offerings.isAnonymous,
      memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
    })
    .from(offerings)
    .leftJoin(members, eq(offerings.memberId, members.id))
    .orderBy(desc(offerings.serviceDate))
    .limit(pageSize)
    .offset(offset)

  return { data: results }
}

export async function getExpenses(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize

  const results = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.expenseDate))
    .limit(pageSize)
    .offset(offset)

  return { data: results }
}

export async function recordTithe(data: {
  memberId: string
  amount: number
  paymentDate: string
  paymentMethod?: string
  notes?: string
}) {
  const monthYear = data.paymentDate.slice(0, 7)

  await db.insert(tithes).values({
    memberId: data.memberId,
    amount: String(data.amount),
    paymentDate: data.paymentDate,
    monthYear,
    paymentMethod: (data.paymentMethod as 'cash' | 'mobile_money' | 'bank_transfer' | undefined),
    notes: data.notes,
  })

  revalidatePath('/finance')
  return { success: true }
}

export async function recordOffering(data: {
  memberId?: string
  amount: number
  serviceDate: string
  offeringType: string
  paymentMethod?: string
  isAnonymous?: boolean
}) {
  await db.insert(offerings).values({
    memberId: data.memberId || undefined,
    amount: String(data.amount),
    serviceDate: data.serviceDate,
    offeringType: data.offeringType,
    paymentMethod: (data.paymentMethod as 'cash' | 'mobile_money' | 'bank_transfer' | undefined),
    isAnonymous: data.isAnonymous || false,
  })

  revalidatePath('/finance')
  return { success: true }
}

export async function recordExpense(data: {
  category: string
  amount: number
  description: string
  expenseDate: string
  receiptUrl?: string
}) {
  await db.insert(expenses).values({
    category: data.category,
    amount: String(data.amount),
    description: data.description,
    expenseDate: data.expenseDate,
    receiptUrl: data.receiptUrl,
    status: 'pending',
  })

  revalidatePath('/finance')
  return { success: true }
}

export async function getMembersForFinance() {
  return db
    .select({
      id: members.id,
      name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
      memberId: members.memberId,
    })
    .from(members)
    .where(eq(members.memberStatus, 'active'))
    .orderBy(members.firstName)
    .limit(200)
}

// Expense Approval Workflow
export async function getPendingExpenses() {
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.status, 'pending'))
    .orderBy(desc(expenses.createdAt))
}

export async function getExpensesByStatus(status: 'pending' | 'approved' | 'rejected', page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize

  const results = await db
    .select()
    .from(expenses)
    .where(eq(expenses.status, status))
    .orderBy(desc(expenses.expenseDate))
    .limit(pageSize)
    .offset(offset)

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(expenses)
    .where(eq(expenses.status, status))

  return {
    data: results,
    pagination: { page, pageSize, total: Number(countResult?.count || 0) },
  }
}

export async function approveExpense(id: string) {
  const [updated] = await db
    .update(expenses)
    .set({
      status: 'approved',
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, id))
    .returning()

  revalidatePath('/finance')
  revalidatePath('/finance/expenses')
  return { success: true, expense: updated }
}

export async function rejectExpense(id: string) {
  const [updated] = await db
    .update(expenses)
    .set({
      status: 'rejected',
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, id))
    .returning()

  revalidatePath('/finance')
  revalidatePath('/finance/expenses')
  return { success: true, expense: updated }
}

export async function getExpenseStats() {
  const [stats] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${expenses.status} = 'pending')`,
      approved: sql<number>`count(*) filter (where ${expenses.status} = 'approved')`,
      rejected: sql<number>`count(*) filter (where ${expenses.status} = 'rejected')`,
      pendingAmount: sql<number>`COALESCE(SUM(amount) filter (where ${expenses.status} = 'pending'), 0)`,
      approvedAmount: sql<number>`COALESCE(SUM(amount) filter (where ${expenses.status} = 'approved'), 0)`,
    })
    .from(expenses)

  return {
    pending: Number(stats?.pending || 0),
    approved: Number(stats?.approved || 0),
    rejected: Number(stats?.rejected || 0),
    pendingAmount: Number(stats?.pendingAmount || 0),
    approvedAmount: Number(stats?.approvedAmount || 0),
  }
}
