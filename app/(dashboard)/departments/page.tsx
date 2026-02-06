import { db } from '@/lib/db'
import { departments, memberDepartments } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { DepartmentsClient } from './components/departments-client'

async function getDepartmentsWithMembers() {
  const depts = await db.select().from(departments).where(eq(departments.isActive, true)).orderBy(asc(departments.name))

  // Get member counts for each department
  const withCounts = await Promise.all(depts.map(async (d) => {
    const [count] = await db
      .select({ count: sql<number>`count(*)` })
      .from(memberDepartments)
      .where(eq(memberDepartments.departmentId, d.id))
    return { ...d, memberCount: Number(count?.count || 0) }
  }))

  return withCounts
}

export default async function DepartmentsPage() {
  const deptList = await getDepartmentsWithMembers()

  return <DepartmentsClient departments={deptList} />
}
