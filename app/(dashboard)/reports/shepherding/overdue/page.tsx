import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react'
import { db } from '@/lib/db'
import { followUps, members } from '@/lib/db/schema'
import { sql, eq, and } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

async function getOverdueFollowUps() {
  // Get all overdue follow-ups
  const overdueFollowUps = await db
    .select({
      id: followUps.id,
      scheduledDate: followUps.scheduledDate,
      status: followUps.status,
      type: followUps.followUpType,
      notes: followUps.notes,
      memberName: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
      memberEmail: members.email,
      memberPhone: members.phonePrimary,
      memberId: members.memberId,
    })
    .from(followUps)
    .innerJoin(members, eq(followUps.memberId, members.id))
    .where(
      and(
        eq(followUps.status, 'pending'),
        sql`${followUps.scheduledDate} < current_date`
      )
    )

  // Calculate days overdue
  const today = new Date()
  const overdueWithDays = overdueFollowUps.map((followUp) => {
    const scheduledDate = new Date(followUp.scheduledDate)
    const daysOverdue = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
    return {
      ...followUp,
      daysOverdue,
    }
  })

  const sorted = overdueWithDays.sort((a, b) => b.daysOverdue - a.daysOverdue)

  // Get statistics
  const totalOverdue = sorted.length
  const criticalOverdue = sorted.filter((f) => f.daysOverdue >= 30).length
  const avgDaysOverdue = totalOverdue > 0 ? Math.round(sorted.reduce((sum, f) => sum + f.daysOverdue, 0) / totalOverdue) : 0

  // Group by type
  const byType: Record<string, number> = {}
  sorted.forEach((followUp) => {
    const type = followUp.type || 'General'
    byType[type] = (byType[type] || 0) + 1
  })

  return {
    overdueFollowUps: sorted,
    totalOverdue,
    criticalOverdue,
    avgDaysOverdue,
    byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
  }
}

export default async function ShepherdingOverduePage() {
  const { overdueFollowUps, totalOverdue, criticalOverdue, avgDaysOverdue, byType } =
    await getOverdueFollowUps()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/reports/shepherding" className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Shepherding
        </Link>
        <ReportHeader
          title="Overdue Shepherd Follow-ups"
          description="Pastoral care follow-ups that need immediate shepherd attention"
          exportLabel="Export Overdue"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Overdue"
          value={totalOverdue}
          description="Pending follow-ups"
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Critical"
          value={criticalOverdue}
          description="30+ days overdue"
          icon={AlertCircle}
          variant="accent"
        />
        <StatCard
          title="Average Delay"
          value={`${avgDaysOverdue}d`}
          description="Days overdue"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Members Affected"
          value={overdueFollowUps.length}
          description="Requiring follow-up"
          icon={Users}
          variant="neutral"
        />
      </div>

      {/* Follow-up Type Breakdown */}
      {byType.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              Follow-up Types
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {byType.map((item) => (
                <div key={item.type} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{item.type}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Follow-ups List */}
      <Card className="border-orange-200 dark:border-orange-900/30">
        <CardHeader className="pb-4 border-b border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">All Overdue Follow-ups</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{totalOverdue} items pending</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {overdueFollowUps.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No overdue follow-ups</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {overdueFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {followUp.memberName}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {followUp.memberPhone && (
                          <a href={`tel:${followUp.memberPhone}`} className="hover:text-primary dark:hover:text-accent flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {followUp.memberPhone}
                          </a>
                        )}
                        {followUp.memberEmail && (
                          <a href={`mailto:${followUp.memberEmail}`} className="hover:text-primary dark:hover:text-accent flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {followUp.memberEmail}
                          </a>
                        )}
                      </div>
                      {followUp.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{followUp.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                          {followUp.type || 'General'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Due {new Date(followUp.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${followUp.daysOverdue >= 30
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : followUp.daysOverdue >= 14
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          }`}
                      >
                        {followUp.daysOverdue}d overdue
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
        reportType="Overdue Follow-ups"
        dataSource="Shepherding Follow-up Records"
        period="Scheduled before today"
      />
    </div>
  )
}
