import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  LineChart,
  ArrowLeft,
  Download,
  ChevronRight,
} from 'lucide-react'
import { db } from '@/lib/db'
import { services, attendance } from '@/lib/db/schema'
import { sql, desc, gte } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

async function getAttendanceTrends() {
  // Get last 12 weeks of services
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)
  const startDate = twelveWeeksAgo.toISOString().split('T')[0]

  const servicesData = await db
    .select({
      id: services.id,
      date: services.serviceDate,
      type: services.serviceType,
      attendeeCount: sql<number>`(SELECT COUNT(*) FROM attendance WHERE attendance.service_id = services.id)`,
    })
    .from(services)
    .where(gte(services.serviceDate, startDate))
    .orderBy(desc(services.serviceDate))

  // Group by week
  const weeklyData: Record<string, { total: number; count: number; date: string; week: string }> = {}

  servicesData.forEach((service) => {
    const date = new Date(service.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        total: 0,
        count: 0,
        date: weekKey,
        week: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      }
    }
    weeklyData[weekKey].total += Number(service.attendeeCount)
    weeklyData[weekKey].count += 1
  })

  const trends = Object.values(weeklyData)
    .map((week) => ({
      ...week,
      average: week.count > 0 ? Math.round(week.total / week.count) : 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate trend statistics
  const averages = trends.map((t) => t.average)
  const overallAverage = averages.length > 0 ? Math.round(averages.reduce((a, b) => a + b, 0) / averages.length) : 0
  const highest = Math.max(...averages, 0)
  const lowest = Math.min(...averages.filter((a) => a > 0), Infinity)
  const variance =
    trends.length > 1
      ? ((trends[trends.length - 1].average - trends[0].average) / trends[0].average) * 100
      : 0

  return {
    trends,
    overallAverage,
    highest,
    lowest,
    variance,
    weeksAnalyzed: trends.length,
  }
}

export default async function AttendanceTrendsPage() {
  const { trends, overallAverage, highest, lowest, variance, weeksAnalyzed } = await getAttendanceTrends()

  const isPositiveTrend = variance >= 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/reports/attendance"
          className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Attendance
        </Link>
        <ReportHeader
          title="Attendance Trends"
          description="12-week attendance analysis and pattern identification"
          exportLabel="Export Trends"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Average"
          value={overallAverage}
          description={`${weeksAnalyzed} weeks analyzed`}
          icon={BarChart3}
          variant="primary"
        />
        <StatCard
          title="Peak Attendance"
          value={highest}
          description="Highest weekly average"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Lowest Attendance"
          value={lowest === Infinity ? 0 : lowest}
          description="Lowest weekly average"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="Trend Direction"
          value={`${Math.abs(Math.round(variance))}%`}
          description={isPositiveTrend ? 'Growing' : 'Declining'}
          icon={isPositiveTrend ? TrendingUp : TrendingDown}
          variant={isPositiveTrend ? 'success' : 'warning'}
          trend={{
            value: Math.abs(Math.round(variance)),
            direction: isPositiveTrend ? 'up' : 'down',
          }}
        />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <LineChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Direction</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {isPositiveTrend ? 'Upward Trend' : 'Downward Trend'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change Rate</p>
                <p
                  className={`text-lg font-bold mt-1 ${isPositiveTrend
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                    }`}
                >
                  {Math.round(variance)}% per week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Range Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variation</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {highest - (lowest === Infinity ? 0 : lowest)} members
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stability</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {(((highest - (lowest === Infinity ? 0 : lowest)) / overallAverage) * 100).toFixed(1)}% variance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Focus on weeks with lower attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>{isPositiveTrend ? 'Maintain current momentum' : 'Increase member engagement'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Track seasonal patterns</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Weekly Breakdown</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Last 12 weeks of attendance data</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {trends.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No attendance data available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {trends.map((week, idx) => {
                const prevWeek = idx > 0 ? trends[idx - 1] : null
                const weekTrend = prevWeek ? ((week.average - prevWeek.average) / prevWeek.average) * 100 : 0

                return (
                  <div
                    key={week.date}
                    className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{week.week}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(week.date).toLocaleDateString('en-GB', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{week.average}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">avg attendance</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{week.count} services</p>
                        </div>

                        {prevWeek && weekTrend !== 0 && (
                          <div
                            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${weekTrend >= 0
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-orange-100 dark:bg-orange-900/30'
                              }`}
                          >
                            {weekTrend >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            )}
                            <span
                              className={`text-xs font-semibold ${weekTrend >= 0
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-orange-700 dark:text-orange-300'
                                }`}
                            >
                              {Math.round(weekTrend)}%
                            </span>
                          </div>
                        )}

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
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <ReportFooter
        reportType="Attendance Trends"
        dataSource="Service Attendance Records (Last 12 Weeks)"
        period="12-week analysis"
      />
    </div>
  )
}
