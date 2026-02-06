import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { departments, memberDepartments, members } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DepartmentDetailClient } from './components/department-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getDepartment(id: string) {
  const [dept] = await db.select().from(departments).where(eq(departments.id, id)).limit(1)
  return dept
}

async function getDepartmentMembers(deptId: string) {
  const result = await db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phonePrimary,
      joinedAt: memberDepartments.createdAt,
      joinDate: memberDepartments.joinDate,
      role: memberDepartments.role,
    })
    .from(memberDepartments)
    .innerJoin(members, eq(memberDepartments.memberId, members.id))
    .where(eq(memberDepartments.departmentId, deptId))

  return result.map(m => ({
    ...m,
    joinedAt: m.joinedAt ? m.joinedAt.toISOString() : null,
    joinDate: m.joinDate ? m.joinDate : null, // date string from db usually
  }))
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { id } = await params
  const [dept, deptMembers] = await Promise.all([
    getDepartment(id),
    getDepartmentMembers(id),
  ])

  if (!dept) {
    notFound()
  }

  return <DepartmentDetailClient department={dept} members={deptMembers} />
}
