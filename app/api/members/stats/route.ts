import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET() {
  try {
    // Get total members
    const [{ total }] = await db
      .select({ total: count() })
      .from(members)

    // Get active members
    const [{ active }] = await db
      .select({ active: count() })
      .from(members)
      .where(eq(members.memberStatus, 'active'))

    // Get inactive members
    const [{ inactive }] = await db
      .select({ inactive: count() })
      .from(members)
      .where(eq(members.memberStatus, 'inactive'))

    // Get visitors
    const [{ visitors }] = await db
      .select({ visitors: count() })
      .from(members)
      .where(eq(members.memberStatus, 'visitor'))

    return NextResponse.json({
      success: true,
      data: {
        total: total || 0,
        active: active || 0,
        inactive: inactive || 0,
        visitors: visitors || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching member stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member statistics' },
      { status: 500 }
    )
  }
}
