import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CalendarCheck,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { db } from '@/lib/db'
import { services } from '@/lib/db/schema'
import { sql, desc } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

async function getAttendanceReport() {
  const recentServices = await db
    .select({
      id: services.id,
      type: services.serviceType,
      date: services.serviceDate,
      attendeeCount: sql<number>`(SELECT COUNT(*) FROM attendance WHERE attendance.service_id = services.id)`,
    })
    .from(services)
    .orderBy(desc(services.serviceDate))
    .limit(10)

  const totalAttendance = recentServices.reduce((sum, s) => sum + Number(s.attendeeCount), 0)
  const avgAttendance = recentServices.length > 0 ? Math.round(totalAttendance / recentServices.length) : 0
  const maxAttendance = recentServices.length > 0 ? Math.max(...recentServices.map(s => Number(s.attendeeCount))) : 0
  const minAttendance = recentServices.length > 0 ? Math.min(...recentServices.map(s => Number(s.attendeeCount))) : 0

  return {
    recentServices,
    totalAttendance,
    avgAttendance,
    serviceCount: recentServices.length,
    maxAttendance,
    minAttendance,
  }
}

export default async function AttendanceReportPage() {
  const { recentServices, totalAttendance, avgAttendance, serviceCount, maxAttendance, minAttendance } =
    await getAttendanceReport()

  const attendanceTrend = recentServices.length > 1
    ? ((Number(recentServices[0]?.attendeeCount) - Number(recentServices[recentServices.length - 1]?.attendeeCount)) /
      Number(recentServices[recentServices.length - 1]?.attendeeCount)) *
    100
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Attendance Report"
        description="Service attendance summary and trend analysis"
        exportLabel="Export CSV"
      />

      {/* Key Metrics - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Attendance"
          value={totalAttendance}
          description={`Last ${serviceCount} services`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Average per Service"
          value={avgAttendance}
          description="Members per service"
          icon={BarChart3}
          variant="success"
        />
        <StatCard
          title="Peak Attendance"
          value={maxAttendance}
          description="Highest service"
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Attendance Trend"
          value={`${Math.abs(Math.round(attendanceTrend))}%`}
          description={attendanceTrend >= 0 ? 'Growth' : 'Decline'}
          icon={attendanceTrend >= 0 ? TrendingUp : TrendingDown}
          variant={attendanceTrend >= 0 ? 'success' : 'warning'}
          trend={{
            value: Math.abs(Math.round(attendanceTrend)),
            direction: attendanceTrend >= 0 ? 'up' : 'down',
          }}
        />
      </div>

      {/* Summary Cards - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Reporting Period</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Data coverage</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">Services Tracked</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{serviceCount}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-medium mb-2">Date Range</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {recentServices.length > 0 && recentServices[recentServices.length - 1]?.date
                  ? new Date(recentServices[recentServices.length - 1].date).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                  })
                  : 'N/A'}{' '}
                to{' '}
                {recentServices.length > 0 && recentServices[0]?.date
                  ? new Date(recentServices[0].date).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                  })
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Attendance Range</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High and low</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">Highest</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{maxAttendance}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">Lowest</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{minAttendance}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Key Insights</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Summary points</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 dark:text-slate-500 font-bold mt-0.5 flex-shrink-0">•</span>
                <span className="text-slate-700 dark:text-slate-300">
                  Variation of {maxAttendance - minAttendance} members
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 dark:text-slate-500 font-bold mt-0.5 flex-shrink-0">•</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {attendanceTrend >= 0 ? '↑ Growing' : '↓ Declining'} trend
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 dark:text-slate-500 font-bold mt-0.5 flex-shrink-0">•</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {serviceCount} weeks of data
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services List */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <CalendarCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Recent Services</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attendance by service</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentServices.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No services recorded</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start recording services to see attendance data</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentServices.map((service, idx) => {
                const prevService = idx < recentServices.length - 1 ? recentServices[idx + 1] : null
                const attendanceChange = prevService
                  ? ((Number(service.attendeeCount) - Number(prevService.attendeeCount)) /
                    Number(prevService.attendeeCount)) *
                  100
                  : 0

                return (
                  <div
                    key={service.id}
                    className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer first:pt-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            <CalendarCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white truncate text-sm capitalize">
                              {service.type} Service
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {service.date
                                ? new Date(service.date).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {service.attendeeCount}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">members</p>
                        </div>

                        {prevService && attendanceChange !== 0 && (
                          <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 ${attendanceChange >= 0
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/30'
                            }`}>
                            {attendanceChange >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                            )}
                            <span className={`text-xs font-semibold ${attendanceChange >= 0
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-orange-700 dark:text-orange-300'
                              }`}>
                              {Math.round(attendanceChange)}%
                            </span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
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

      {/* Detailed Reports Navigation */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Detailed Reports
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explore deeper attendance insights and analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Trends Card */}
          <Link href="/reports/attendance/trends">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Attendance Trends
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monthly patterns and growth analysis
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Absentees Card */}
          <Link href="/reports/attendance/absentees">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Absentees
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Members missing recent services
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Service Comparison Card */}
          <Link href="/reports/attendance/comparison">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/40 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                        <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Service Comparison
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Compare different service types
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Attendance Summary"
        dataSource="Service Attendance Records"
        period={`Last ${serviceCount} services`}
      />
    </div>
  )
}
