'use server'

import { db } from '@/lib/db'
import { members, departments } from '@/lib/db/schema'
import { eq, ilike, or, and, desc, asc, count, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type MemberFilters = {
  search?: string
  status?: string
  department?: string
  gender?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getMembers(filters: MemberFilters = {}) {
  const {
    search = '',
    status,
    gender,
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters

  const offset = (page - 1) * pageSize

  // Build where conditions
  const conditions = []

  if (search) {
    conditions.push(
      or(
        ilike(members.firstName, `%${search}%`),
        ilike(members.lastName, `%${search}%`),
        ilike(members.phonePrimary, `%${search}%`),
        ilike(members.email, `%${search}%`),
        ilike(members.memberId, `%${search}%`)
      )
    )
  }

  if (status && status !== 'all') {
    conditions.push(eq(members.memberStatus, status as 'active' | 'inactive' | 'visitor' | 'new_convert'))
  }

  if (gender && gender !== 'all') {
    conditions.push(eq(members.gender, gender as 'male' | 'female'))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(members)
    .where(whereClause)

  // Get paginated results
  const orderDirection = sortOrder === 'asc' ? asc : desc

  // Determine sort column based on sortBy parameter
  type OrderColumn = typeof members.createdAt | typeof members.firstName | typeof members.lastName | typeof members.phonePrimary | typeof members.email | typeof members.memberStatus | typeof members.joinDate

  let orderColumn: OrderColumn = members.createdAt
  switch (sortBy) {
    case 'firstName':
      orderColumn = members.firstName
      break
    case 'lastName':
      orderColumn = members.lastName
      break
    case 'phonePrimary':
      orderColumn = members.phonePrimary
      break
    case 'email':
      orderColumn = members.email
      break
    case 'memberStatus':
      orderColumn = members.memberStatus
      break
    case 'joinDate':
      orderColumn = members.joinDate
      break
    default:
      orderColumn = members.createdAt
  }

  const results = await db
    .select({
      id: members.id,
      memberId: members.memberId,
      firstName: members.firstName,
      middleName: members.middleName,
      lastName: members.lastName,
      phonePrimary: members.phonePrimary,
      email: members.email,
      gender: members.gender,
      memberStatus: members.memberStatus,
      photoUrl: members.photoUrl,
      joinDate: members.joinDate,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(whereClause)
    .orderBy(orderDirection(orderColumn))
    .limit(pageSize)
    .offset(offset)

  return {
    data: results,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getMember(id: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, id))
    .limit(1)

  return member
}



export async function updateMember(
  id: string,
  data: Partial<{
    firstName: string
    middleName: string
    lastName: string
    phonePrimary: string
    phoneSecondary: string
    email: string
    dateOfBirth: string
    gender: 'male' | 'female'
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
    address: string
    city: string
    region: string
    occupation: string
    memberStatus: 'active' | 'inactive' | 'visitor' | 'new_convert'
    joinDate: string
    baptismDate: string
    isBaptized: boolean
    emergencyContactName: string
    emergencyContactPhone: string
    notes: string
    photoUrl: string
  }>
) {
  const [updated] = await db
    .update(members)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(members.id, id))
    .returning()

  revalidatePath('/members')
  revalidatePath(`/members/${id}`)
  return updated
}

export async function deleteMember(id: string) {
  // Soft delete by setting status to inactive
  const [deleted] = await db
    .update(members)
    .set({
      memberStatus: 'inactive',
      updatedAt: new Date(),
    })
    .where(eq(members.id, id))
    .returning()

  revalidatePath('/members')
  return deleted
}

// Define input type
type CreateMemberInput = Omit<typeof members.$inferInsert, 'id' | 'memberId' | 'createdAt' | 'updatedAt'> & {
  photoUrl?: string | null
}

export async function createMember(data: CreateMemberInput) {
  try {
    // Generate member ID
    const memberId = await generateMemberId()

    await db.insert(members).values({
      ...data,
      memberId,
    })

    revalidatePath('/members')
    return { success: true }
  } catch (error) {
    console.error('Error creating member:', error)
    throw new Error('Failed to create member')
  }
}

async function generateMemberId() {
  const [lastMember] = await db
    .select({ memberId: members.memberId })
    .from(members)
    .orderBy(desc(members.createdAt))
    .limit(1)

  let nextNumber = 1
  if (lastMember?.memberId) {
    const match = lastMember.memberId.match(/GNC-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `GNC-${String(nextNumber).padStart(4, '0')}`
}

export async function getDepartments() {
  return db
    .select({
      id: departments.id,
      name: departments.name,
    })
    .from(departments)
    .where(eq(departments.isActive, true))
    .orderBy(asc(departments.name))
}

export async function getMemberStats() {
  const [stats] = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where ${members.memberStatus} = 'active')`,
      inactive: sql<number>`count(*) filter (where ${members.memberStatus} = 'inactive')`,
      visitors: sql<number>`count(*) filter (where ${members.memberStatus} = 'visitor')`,
      newConverts: sql<number>`count(*) filter (where ${members.memberStatus} = 'new_convert')`,
    })
    .from(members)

  return stats
}
