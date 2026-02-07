'use server'

import { db } from '@/lib/db'
import { members, departments, users, shepherds } from '@/lib/db/schema'
import { eq, ilike, or, and, desc, asc, count, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from './messages'

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
  // If photo is being updated, check if we need to delete the old one
  if (data.photoUrl) {
    const [currentMember] = await db
      .select({ photoUrl: members.photoUrl })
      .from(members)
      .where(eq(members.id, id))
      .limit(1)

    if (currentMember?.photoUrl && currentMember.photoUrl !== data.photoUrl) {
      // Delete old photo
      const fileName = currentMember.photoUrl.split('/').pop()
      if (fileName) {
        try {
          const supabase = createAdminClient()
          await supabase.storage
            .from('member-photos')
            .remove([fileName])
        } catch (error) {
          console.error('Error deleting old member photo:', error)
          // Continue with update even if delete fails
        }
      }
    }
  }

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
  try {
    // 1. Get member details first to find linked user and photo
    const [member] = await db
      .select({
        userId: members.userId,
        photoUrl: members.photoUrl
      })
      .from(members)
      .where(eq(members.id, id))
      .limit(1)

    if (!member) return { success: false, error: 'Member not found' }

    const supabase = createAdminClient()

    // 2. Delete photo from storage if exists
    if (member.photoUrl) {
      const fileName = member.photoUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('member-photos')
          .remove([fileName])
      }
    }

    // 3. Delete auth user if exists
    if (member.userId) {
      await supabase.auth.admin.deleteUser(member.userId)

      // Also delete from public users table
      await db.delete(users).where(eq(users.id, member.userId))
    }

    // 4. Delete member record (cascade will handle related records like attendance/tithes if configured, 
    //    but we'll delete the member record explicitly)
    await db.delete(members).where(eq(members.id, id))

    revalidatePath('/members')
    return { success: true }
  } catch (error) {
    console.error('Error deleting member:', error)
    return { success: false, error: 'Failed to delete member' }
  }
}

export async function bulkDeleteMembers(ids: string[]) {
  try {
    const supabase = createAdminClient()
    let successCount = 0
    let failCount = 0

    // We process sequentially or in parallel? Parallel is faster but might hit rate limits if too many.
    // For now, simple Promise.all is fine for reasonable batch sizes.
    await Promise.all(ids.map(async (id) => {
      try {
        // 1. Get member details
        const [member] = await db
          .select({
            userId: members.userId,
            photoUrl: members.photoUrl
          })
          .from(members)
          .where(eq(members.id, id))
          .limit(1)

        if (!member) return

        // 2. Delete photo
        if (member.photoUrl) {
          const fileName = member.photoUrl.split('/').pop()
          if (fileName) {
            await supabase.storage
              .from('member-photos')
              .remove([fileName])
          }
        }

        // 3. Delete auth user
        if (member.userId) {
          await supabase.auth.admin.deleteUser(member.userId)
          await db.delete(users).where(eq(users.id, member.userId))
        }

        // 4. Delete member record
        await db.delete(members).where(eq(members.id, id))
        successCount++
      } catch (err) {
        console.error(`Failed to delete member ${id}:`, err)
        failCount++
      }
    }))

    revalidatePath('/members')
    return { success: true, count: successCount, failed: failCount }
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return { success: false, error: 'Failed to perform bulk delete' }
  }
}

export async function assignMemberRole(memberId: string, role: 'super_admin' | 'pastor' | 'admin' | 'treasurer' | 'dept_leader' | 'shepherd' | 'member') {
  try {
    // 1. Get member details
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!member) return { success: false, error: 'Member not found' }

    // 2. Validate Email and Phone
    if (!member.email || !member.phonePrimary) {
      return {
        success: false,
        error: 'Member must have a valid Email and Phone Number to be promoted.'
      }
    }

    const supabase = createAdminClient()
    const defaultPassword = 'password123'
    let userId = member.userId

    // 3. Create Auth Account if missing
    if (!userId) {
      // Check if user exists by email first (to avoid duplicates)
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingAuthUser = existingUsers.users.find((u: any) => u.email === member.email)

      if (existingAuthUser) {
        userId = existingAuthUser.id
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: member.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            first_name: member.firstName,
            last_name: member.lastName,
            full_name: `${member.firstName} ${member.lastName}`,
            role: role
          }
        })

        if (createError) {
          console.error('Auth creation error:', createError)
          return { success: false, error: 'Failed to create user account: ' + createError.message }
        }

        if (!newUser.user) return { success: false, error: 'Failed to create user account' }
        userId = newUser.user.id
      }

      // Link member to user
      await db.update(members).set({ userId }).where(eq(members.id, memberId))
    }

    if (!userId) return { success: false, error: 'Failed to determine user ID' }

    // 4. Update or Create User Record in DB
    await db.insert(users).values({
      id: userId,
      email: member.email,
      role: role,
      isActive: true,
    }).onConflictDoUpdate({
      target: users.id,
      set: { role: role, updatedAt: new Date() }
    })

    // 5. Handle Shepherd Role Specifics
    if (role === 'shepherd') {
      // Check if already a shepherd
      const [existingShepherd] = await db
        .select()
        .from(shepherds)
        .where(and(eq(shepherds.memberId, memberId), eq(shepherds.isActive, true)))
        .limit(1)

      if (!existingShepherd) {
        await db.insert(shepherds).values({
          memberId,
          assignedDate: new Date().toISOString().split('T')[0],
          isActive: true,
        })
      }
    }

    // 6. Send SMS Notification
    try {
      const message = `Congratulations ${member.firstName}! You have been promoted to ${role.replace('_', ' ').toUpperCase()} at GNC. Login details - Email: ${member.email}, Password: ${defaultPassword}. Please change your password on login.`

      await sendSMS({
        recipients: [{ memberId, phone: member.phonePrimary }],
        message
      })
    } catch (smsError) {
      console.error('Failed to send promotion SMS:', smsError)
      // We don't fail the whole operation if SMS fails, but we log it
    }

    revalidatePath('/members')
    revalidatePath(`/members/${memberId}`)
    return { success: true }

  } catch (error) {
    console.error('Error assigning role:', error)
    return { success: false, error: 'Failed to assign role' }
  }
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

export async function generateMemberId() {
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
