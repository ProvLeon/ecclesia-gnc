import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CalendarCheck,
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { db } from '@/lib/db'
import { services } from '@/lib/db/schema'
import { sql, desc } from 'drizzle-orm'

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
              Attendance Report
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Service attendance summary and trend analysis
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Total Attendance
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {totalAttendance}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Last {serviceCount} services
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-200 dark:bg-blue-800/50">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
                  Average per Service
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {avgAttendance}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Members per service
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-200 dark:bg-green-800/50">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Peak Attendance
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {maxAttendance}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Highest service
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-200 dark:bg-amber-800/50">
                <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-slate-200 dark:border-slate-700 bg-gradient-to-br ${attendanceTrend >= 0
          ? 'from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-rose-900/20'
          : 'from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20'
          }`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${attendanceTrend >= 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-orange-700 dark:text-orange-300'
                  }`}>
                  Attendance Trend
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {Math.abs(Math.round(attendanceTrend))}%
                  </p>
                  {attendanceTrend >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {attendanceTrend >= 0 ? 'Growth' : 'Decline'} vs last service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Reporting Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Services Tracked</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{serviceCount}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Range</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {recentServices.length > 0 && recentServices[recentServices.length - 1]?.date
                    ? new Date(recentServices[recentServices.length - 1].date).toLocaleDateString()
                    : 'N/A'}{' '}
                  to{' '}
                  {recentServices.length > 0 && recentServices[0]?.date
                    ? new Date(recentServices[0].date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Attendance Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Highest</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{maxAttendance}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lowest</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{minAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Attendance varies by {maxAttendance - minAttendance} members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>
                  {attendanceTrend >= 0 ? 'Trending upward' : 'Needs attention'} in recent weeks
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>
                  {serviceCount} weeks of data available
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services List */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <CalendarCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Recent Services</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Attendance by service</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentServices.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No services recorded yet</p>
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
                    className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            <CalendarCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white capitalize truncate">
                              {service.type} Service
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {service.date
                                ? new Date(service.date).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
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
                          <div className="flex items-center gap-1">
                            <div
                              className={`px-2 py-1 rounded-full flex items-center gap-1 ${attendanceChange >= 0
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-orange-100 dark:bg-orange-900/30'
                                }`}
                            >
                              {attendanceChange >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                              )}
                              <span
                                className={`text-xs font-semibold ${attendanceChange >= 0
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-orange-700 dark:text-orange-300'
                                  }`}
                              >
                                {Math.round(attendanceChange)}%
                              </span>
                            </div>
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

      {/* Report Footer */}
      <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="pt-5">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong>Report Type:</strong> Attendance Summary
            </p>
            <p>
              <strong>Generated:</strong> {new Date().toLocaleString()}
            </p>
            <p>
              <strong>Data Source:</strong> Service Attendance Records
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
