import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  ArrowLeft,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Target,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { getShepherdingStats, getFollowUps } from '@/app/actions/shepherding'
import { format } from 'date-fns'

export default async function ShepherdingReportPage() {
  const [stats, { data: scheduled }, { data: completed }] = await Promise.all([
    getShepherdingStats(),
    getFollowUps('scheduled', 1, 10),
    getFollowUps('completed', 1, 10),
  ])

  const totalFollowUps = stats.pending + stats.completedThisMonth
  const completionRate = totalFollowUps > 0 ? Math.round((stats.completedThisMonth / totalFollowUps) * 100) : 0
  const overduePercentage = stats.pending > 0 ? Math.round((stats.overdue / stats.pending) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Pastoral Care Report
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Follow-up activity, shepherding metrics, and care program insights
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scheduled Follow-ups */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Scheduled
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.pending}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Awaiting visits
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-200 dark:bg-blue-800/50">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed This Month */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
                  Completed
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.completedThisMonth}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  This month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-200 dark:bg-green-800/50">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Visits */}
        <Card className={`border-slate-200 dark:border-slate-700 bg-gradient-to-br ${stats.overdue > 0
          ? 'from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20'
          : 'from-slate-50 to-slate-100/50 dark:from-slate-950/20 dark:to-slate-900/20'
          }`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${stats.overdue > 0
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-slate-700 dark:text-slate-300'
                  }`}>
                  Overdue
                </p>
                <p className={`text-2xl sm:text-3xl font-bold mt-2 ${stats.overdue > 0
                  ? 'text-amber-900 dark:text-amber-400'
                  : 'text-slate-900 dark:text-white'
                  }`}>
                  {stats.overdue}
                </p>
                <p className={`text-xs mt-2 ${stats.overdue > 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400'
                  }`}>
                  {stats.overdue > 0 ? 'Needs attention' : 'All on track'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stats.overdue > 0
                ? 'bg-amber-200 dark:bg-amber-800/50'
                : 'bg-slate-200 dark:bg-slate-800/50'
                }`}>
                <AlertTriangle className={`h-6 w-6 ${stats.overdue > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400'
                  }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Completion Rate
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {completionRate}%
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Of total follow-ups
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-200 dark:bg-purple-800/50">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats and Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              Care Program Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">Current Workload</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {stats.pending}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Follow-ups in progress
              </p>
            </div>

            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Monthly Achievement</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {stats.completedThisMonth}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Completed this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Target className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion Rate</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{completionRate}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Overdue Rate</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{overduePercentage}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${overduePercentage > 20
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : overduePercentage > 10
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                  style={{ width: `${overduePercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Heart className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              Care Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <p className="font-medium text-slate-900 dark:text-white mb-1">Current Focus</p>
              <p className="text-xs">
                {stats.pending > 0
                  ? `${stats.pending} active follow-ups awaiting pastoral visits`
                  : 'All scheduled follow-ups are on track'}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-medium text-slate-900 dark:text-white mb-1">Recommendation</p>
              <p className="text-xs">
                {stats.overdue > 0
                  ? 'Schedule overdue visits immediately to maintain care standards'
                  : 'Maintain current pace and consider outreach expansion'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled and Completed Follow-ups */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scheduled Follow-ups */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Scheduled Follow-ups</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pending pastoral visits</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{scheduled.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {scheduled.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No scheduled follow-ups</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {scheduled.map((followUp) => {
                  const isOverdue = followUp.scheduledDate
                    ? new Date(followUp.scheduledDate) < new Date()
                    : false

                  return (
                    <div
                      key={followUp.id}
                      className={`py-4 -mx-6 px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isOverdue ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {followUp.memberName}
                            </p>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs flex-shrink-0">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 capitalize mb-2">
                            {followUp.type}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {followUp.scheduledDate
                              ? format(new Date(followUp.scheduledDate), 'MMM d, yyyy')
                              : 'No date set'}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Completed */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Recently Completed</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Successful pastoral visits</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{completed.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {completed.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No completed follow-ups yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {completed.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="py-4 -mx-6 px-6 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {followUp.memberName}
                          </p>
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs flex-shrink-0 border-0">
                            Done
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 capitalize mb-2">
                          {followUp.type}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {followUp.completedDate
                            ? format(new Date(followUp.completedDate), 'MMM d, yyyy')
                            : 'Date not recorded'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Care Program Recommendations */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Care Program Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">1.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Prioritize Overdue Visits:</strong> {stats.overdue} follow-ups need immediate attention to maintain pastoral care standards
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">2.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Increase Visit Frequency:</strong> Current completion rate of {completionRate}% shows room for improvement
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">3.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Train Shepherds:</strong> Ensure all team members follow up guidelines and document visits consistently
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">4.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Monthly Reviews:</strong> Schedule regular check-ins to discuss care progress and member needs
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                Report Type
              </p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">Pastoral Care Summary</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                Generated
              </p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">
                {new Date().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                Data Source
              </p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">Follow-up Records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
