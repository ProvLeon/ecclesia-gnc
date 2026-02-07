import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { eq, ilike, or, and, desc, asc, count, inArray, SQLWrapper } from 'drizzle-orm'
import { getCurrentUserWithRole, getScopedMemberIds } from '@/lib/auth/proxy'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const offset = (page - 1) * pageSize

    // Get current user and role for scoping
    const user = await getCurrentUserWithRole()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get scoped member IDs (null = full access)
    const scopedMemberIds = await getScopedMemberIds(user.id, user.role)

    // Build where conditions
    const conditions: (SQLWrapper | undefined)[] = []

    // Apply role-based scoping
    if (scopedMemberIds !== null) {
      if (scopedMemberIds.length === 0) {
        // No assigned members - return empty result
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        })
      }
      conditions.push(inArray(members.id, scopedMemberIds))
    }

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
      conditions.push(
        eq(members.memberStatus, status as 'active' | 'inactive' | 'visitor' | 'new_convert')
      )
    }

    // Build sort condition
    const sortColumn = sortBy === 'name' ? members.firstName : members.createdAt
    const orderBy = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn)

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(members)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    // Get paginated data
    const data = await db
      .select()
      .from(members)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset)

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

