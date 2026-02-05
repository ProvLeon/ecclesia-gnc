import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Heart,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react'
import { db } from '@/lib/db'
import { shepherds, members, shepherdAssignments } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import { ShepherdCardWithModal } from '@/components/shepherds/shepherd-card-with-modal'

async function getShepherdingData() {
  // Get all active shepherds
  const activeShepherds = await db
    .select({
      id: shepherds.id,
      memberId: shepherds.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phonePrimary: members.phonePrimary,
      assignedDate: shepherds.assignedDate,
    })
    .from(shepherds)
    .innerJoin(members, eq(shepherds.memberId, members.id))
    .where(eq(shepherds.isActive, true))

  // Get all assignments for each shepherd
  const shepherdsWithAssignments = await Promise.all(
    activeShepherds.map(async (shepherd) => {
      const rawAssignments = await db
        .select({
          id: shepherdAssignments.id,
          memberId: shepherdAssignments.memberId,
          memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
          memberEmail: members.email,
          memberPhone: members.phonePrimary,
          assignedDate: shepherdAssignments.assignedDate,
          status: sql<string>`'assigned'`,
        })
        .from(shepherdAssignments)
        .innerJoin(members, eq(shepherdAssignments.memberId, members.id))
        .where(sql`${shepherdAssignments.shepherdId} = ${shepherd.id} AND ${shepherdAssignments.isActive} = true`)

      // Map null values to undefined for type safety
      const assignments = rawAssignments.map(a => ({
        id: a.id,
        memberId: a.memberId,
        memberName: a.memberName,
        memberEmail: a.memberEmail ?? undefined,
        memberPhone: a.memberPhone ?? undefined,
        assignedDate: a.assignedDate,
        status: a.status,
      })) as Array<{
        id: string
        memberId: string
        memberName: string
        memberEmail?: string
        memberPhone?: string
        assignedDate: string
        status: string
      }>

      return {
        ...shepherd,
        assignmentCount: assignments.length,
        assignments,
      }
    })
  )

  const totalShepherds = shepherdsWithAssignments.length
  const totalAssignments = shepherdsWithAssignments.reduce((sum, s) => sum + s.assignmentCount, 0)
  const avgAssignmentsPerShepherd = totalShepherds > 0 ? Math.round(totalAssignments / totalShepherds) : 0

  return {
    shepherds: shepherdsWithAssignments.sort((a, b) => b.assignmentCount - a.assignmentCount),
    totalShepherds,
    totalAssignments,
    avgAssignmentsPerShepherd,
  }
}

export default async function ShepherdingShepherdsPage() {
  const { shepherds: shepherdsList, totalShepherds, totalAssignments, avgAssignmentsPerShepherd } =
    await getShepherdingData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/reports/shepherding" className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Shepherding
        </Link>
        <ReportHeader
          title="Shepherds Overview"
          description="Active shepherds and their member assignments"
          exportLabel="Export Shepherds"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Shepherds"
          value={totalShepherds}
          description="Serving members"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Assignments"
          value={totalAssignments}
          description="Members assigned"
          icon={Heart}
          variant="success"
        />
        <StatCard
          title="Average Load"
          value={avgAssignmentsPerShepherd}
          description="Per shepherd"
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Coverage"
          value={`${totalShepherds > 0 ? Math.round((totalAssignments / (totalShepherds * 5)) * 100) : 0}%`}
          description="Team capacity"
          icon={Users}
          variant="neutral"
        />
      </div>

      {/* Shepherds List */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">All Shepherds</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{totalShepherds} active shepherds</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {shepherdsList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No active shepherds</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {shepherdsList.map((shepherd) => (
                <ShepherdCardWithModal
                  key={shepherd.id}
                  id={shepherd.id}
                  firstName={shepherd.firstName}
                  lastName={shepherd.lastName}
                  email={shepherd.email || undefined}
                  phonePrimary={shepherd.phonePrimary}
                  assignedDate={shepherd.assignedDate}
                  assignmentCount={shepherd.assignmentCount}
                  assignments={shepherd.assignments}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <ReportFooter
        reportType="Shepherds Overview"
        dataSource="Shepherd Assignments"
        period="Active assignments"
      />
    </div>
  )
}
