import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Heart,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react'
import { db } from '@/lib/db'
import { shepherds, members, shepherdAssignments } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

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

  // Get assignment counts for each shepherd
  const shepherdsWithCounts = await Promise.all(
    activeShepherds.map(async (shepherd) => {
      const [assignmentCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(shepherdAssignments)
        .where(sql`${shepherdAssignments.shepherdId} = ${shepherd.id} AND ${shepherdAssignments.isActive} = true`)

      return {
        ...shepherd,
        assignmentCount: Number(assignmentCount?.count || 0),
      }
    })
  )

  const totalShepherds = shepherdsWithCounts.length
  const totalAssignments = shepherdsWithCounts.reduce((sum, s) => sum + s.assignmentCount, 0)
  const avgAssignmentsPerShepherd = totalShepherds > 0 ? Math.round(totalAssignments / totalShepherds) : 0

  return {
    shepherds: shepherdsWithCounts.sort((a, b) => b.assignmentCount - a.assignmentCount),
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
                <div
                  key={shepherd.id}
                  className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {shepherd.firstName} {shepherd.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {shepherd.phonePrimary && (
                          <a href={`tel:${shepherd.phonePrimary}`} className="hover:text-primary dark:hover:text-accent flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {shepherd.phonePrimary}
                          </a>
                        )}
                        {shepherd.email && (
                          <a href={`mailto:${shepherd.email}`} className="hover:text-primary dark:hover:text-accent flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {shepherd.email}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{shepherd.assignmentCount}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">members</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Since {new Date(shepherd.assignedDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-4 w-4 text-primary dark:text-accent" />
                      </Button>
                    </div>
                  </div>
                </div>
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
