import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Heart,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Target,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { getShepherdingStats, getFollowUps } from '@/app/actions/shepherding'
import { format } from 'date-fns'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

export default async function ShepherdingReportPage() {
  const [stats, { data: scheduled }, { data: completed }] = await Promise.all([
    getShepherdingStats(),
    getFollowUps('pending', 1, 10),
    getFollowUps('completed', 1, 10),
  ])

  const totalFollowUps = stats.pending + stats.completedThisMonth
  const completionRate = totalFollowUps > 0 ? Math.round((stats.completedThisMonth / totalFollowUps) * 100) : 0
  const overduePercentage = stats.pending > 0 ? Math.round((stats.overdue / stats.pending) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Pastoral Care Report"
        description="Follow-up activity, shepherding metrics, and care program insights"
        exportLabel="Export PDF"
      />

      {/* Key Metrics - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Visits"
          value={stats.pending}
          description="Awaiting completion"
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="Completed"
          value={stats.completedThisMonth}
          description="This month"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          description={overduePercentage > 0 ? `${overduePercentage}% of pending` : 'On track'}
          icon={AlertTriangle}
          variant={stats.overdue > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Of total follow-ups"
          icon={TrendingUp}
          variant={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'accent' : 'warning'}
        />
      </div>

      {/* Summary Insights - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workload Overview */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Workload Overview</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Current status</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                Pending Follow-ups
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                In Progress
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.pending - stats.overdue}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">On schedule</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Performance</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Completion Rate Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion Rate</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{completionRate}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                Completed This Month
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedThisMonth}</p>
            </div>
          </CardContent>
        </Card>

        {/* Health Status */}
        <Card className={`border-slate-200 dark:border-slate-800 ${stats.overdue > 0
          ? 'bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/20'
          : 'bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-green-950/20'
          }`}>
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg border ${stats.overdue > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                : 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800'
                }`}>
                <AlertCircle className={`h-5 w-5 ${stats.overdue > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
                  }`} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Program Health</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Status</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div>
              <p className={`text-2xl font-bold mb-2 ${stats.overdue > 0
                ? 'text-amber-900 dark:text-amber-100'
                : 'text-green-900 dark:text-green-100'
                }`}>
                {stats.overdue > 0 ? 'Needs Attention' : 'Healthy'}
              </p>
              <p className={`text-sm ${stats.overdue > 0
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-green-700 dark:text-green-300'
                }`}>
                {stats.overdue > 0
                  ? `${stats.overdue} overdue visit${stats.overdue !== 1 ? 's' : ''}`
                  : 'All visits on schedule'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Follow-ups */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Scheduled Follow-ups</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upcoming visits</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {scheduled.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No scheduled follow-ups</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">All pending visits are listed in the overdue section</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {scheduled.map((followUp) => {
                return (
                  <div
                    key={followUp.id}
                    className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors first:pt-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {followUp.memberName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {followUp.type}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {scheduled.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 -mx-6 px-6 pb-0">
              <Link href="/reports/shepherding/overdue">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all scheduled visits
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Follow-ups */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Recently Completed</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest completed visits</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {completed.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No completed visits this month</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Completed visits will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {completed.map((followUp) => (
                <div
                  key={followUp.id}
                  className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors first:pt-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {followUp.memberName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {followUp.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium flex-shrink-0">
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Reports */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Detailed Reports
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explore shepherding insights and team performance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Overdue Visits */}
          <Link href="/reports/shepherding/overdue">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Overdue Visits
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Follow-ups that need immediate attention
                    </p>
                    <div className="flex items-center gap-1 text-primary dark:text-accent mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View overdue</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Shepherd Activity */}
          <Link href="/reports/shepherding/shepherds">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Shepherd Activity
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Team performance and assignment overview
                    </p>
                    <div className="flex items-center gap-1 text-primary dark:text-accent mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View activity</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Pastoral Care Summary"
        period={format(new Date(), 'MMMM yyyy')}
        dataSource="Shepherding Records"
      />
    </div>
  )
}
