import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { departments, memberDepartments, members, departmentLeaders } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { DepartmentDetailClient } from './components/department-detail-client'
import { DepartmentLeadersSection } from './components/department-leaders-section'
import { getDepartmentLeaders } from '@/app/actions/departments'
import { getCurrentUserWithRole } from '@/lib/auth/proxy'
import { redirect } from 'next/navigation'

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
    joinDate: m.joinDate ? m.joinDate : null,
  }))
}

async function getAvailableMembers(deptId: string) {
  // Get members not already leaders of this department
  const existingLeaderIds = await db
    .select({ memberId: departmentLeaders.memberId })
    .from(departmentLeaders)
    .where(and(
      eq(departmentLeaders.departmentId, deptId),
      eq(departmentLeaders.isActive, true)
    ))

  const leaderIdSet = new Set(existingLeaderIds.map(l => l.memberId))

  const allMembers = await db
    .select({
      id: members.id,
      name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
      phone: members.phonePrimary,
    })
    .from(members)
    .where(eq(members.memberStatus, 'active'))
    .limit(200)

  return allMembers.filter(m => !leaderIdSet.has(m.id))
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  const user = await getCurrentUserWithRole()
  if (!user) redirect('/login')

  const { id } = await params
  const [dept, deptMembers, leaders, availableMembers] = await Promise.all([
    getDepartment(id),
    getDepartmentMembers(id),
    getDepartmentLeaders(id),
    getAvailableMembers(id),
  ])

  if (!dept) {
    notFound()
  }

  // Check if user can manage leaders (admin roles or is a leader of this department)
  const adminRoles = ['super_admin', 'pastor', 'admin']
  const isAdmin = adminRoles.includes(user.role)
  const isLeaderOfThisDept = leaders.some(l => l.memberId === user.id || l.memberEmail === user.email)
  const canManageLeaders = isAdmin || isLeaderOfThisDept

  return (
    <div className="space-y-6">
      {/* Leadership Section */}
      <DepartmentLeadersSection
        departmentId={id}
        leaders={leaders}
        availableMembers={availableMembers}
        canManage={canManageLeaders}
      />

      {/* Members Section */}
      <DepartmentDetailClient department={dept} members={deptMembers} />
    </div>
  )
}
