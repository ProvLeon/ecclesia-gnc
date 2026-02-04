import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { eq, ilike, or, and, desc, asc, count, SQLWrapper } from 'drizzle-orm'

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

    // Build where conditions
    const conditions: (SQLWrapper | undefined)[] = []

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
