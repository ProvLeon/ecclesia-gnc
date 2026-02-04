import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import { db } from '@/lib/db'
import { services, attendance } from '@/lib/db/schema'
import { sql, desc, gte } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

async function getAttendanceComparison() {
  // Get current month and previous month data
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0]
  const previousMonthStartStr = previousMonthStart.toISOString().split('T')[0]
  const previousMonthEndStr = previousMonthEnd.toISOString().split('T')[0]

  // Get current month services
  const currentMonthServices = await db
    .select({
      id: services.id,
      date: services.serviceDate,
      type: services.serviceType,
      attendeeCount: sql<number>`(SELECT COUNT(*) FROM attendance WHERE attendance.service_id = services.id)`,
    })
    .from(services)
    .where(gte(services.serviceDate, currentMonthStartStr))
    .orderBy(desc(services.serviceDate))

  // Get previous month services
  const previousMonthServices = await db
    .select({
      id: services.id,
      date: services.serviceDate,
      type: services.serviceType,
      attendeeCount: sql<number>`(SELECT COUNT(*) FROM attendance WHERE attendance.service_id = services.id)`,
    })
    .from(services)
    .where(
      sql`${services.serviceDate} >= ${previousMonthStartStr} AND ${services.serviceDate} <= ${previousMonthEndStr}`
    )
    .orderBy(desc(services.serviceDate))

  // Calculate metrics for current month
  const currentTotal = currentMonthServices.reduce((sum, s) => sum + Number(s.attendeeCount), 0)
  const currentAvg = currentMonthServices.length > 0 ? Math.round(currentTotal / currentMonthServices.length) : 0
  const currentMax = currentMonthServices.length > 0 ? Math.max(...currentMonthServices.map((s) => Number(s.attendeeCount))) : 0
  const currentMin = currentMonthServices.length > 0 ? Math.min(...currentMonthServices.map((s) => Number(s.attendeeCount))) : 0

  // Calculate metrics for previous month
  const previousTotal = previousMonthServices.reduce((sum, s) => sum + Number(s.attendeeCount), 0)
  const previousAvg = previousMonthServices.length > 0 ? Math.round(previousTotal / previousMonthServices.length) : 0
  const previousMax = previousMonthServices.length > 0 ? Math.max(...previousMonthServices.map((s) => Number(s.attendeeCount))) : 0
  const previousMin = previousMonthServices.length > 0 ? Math.min(...previousMonthServices.map((s) => Number(s.attendeeCount))) : 0

  // Calculate comparisons
  const avgChange = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
  const totalChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

  // Get service type breakdown for current month
  const serviceTypeData: Record<string, { count: number; attendance: number }> = {}
  currentMonthServices.forEach((service) => {
    const type = service.type || 'Unknown'
    if (!serviceTypeData[type]) {
      serviceTypeData[type] = { count: 0, attendance: 0 }
    }
    serviceTypeData[type].count += 1
    serviceTypeData[type].attendance += Number(service.attendeeCount)
  })

  const serviceTypeBreakdown = Object.entries(serviceTypeData).map(([type, data]) => ({
    type,
    count: data.count,
    totalAttendance: data.attendance,
    avgAttendance: Math.round(data.attendance / data.count),
  }))

  return {
    current: {
      services: currentMonthServices,
      total: currentTotal,
      average: currentAvg,
      max: currentMax,
      min: currentMin,
      count: currentMonthServices.length,
    },
    previous: {
      total: previousTotal,
      average: previousAvg,
      max: previousMax,
      min: previousMin,
      count: previousMonthServices.length,
    },
    avgChange,
    totalChange,
    currentMonth: currentMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    previousMonth: previousMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    serviceTypeBreakdown,
  }
}

export default async function AttendanceComparisonPage() {
  const {
    current,
    previous,
    avgChange,
    totalChange,
    currentMonth,
    previousMonth,
    serviceTypeBreakdown,
  } = await getAttendanceComparison()

  const isAvgPositive = avgChange >= 0
  const isTotalPositive = totalChange >= 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/reports/attendance" className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Attendance
        </Link>
        <ReportHeader
          title="Attendance Comparison"
          description="Month-over-month attendance analysis"
          exportLabel="Export Comparison"
        />
      </div>

      {/* Main Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Month */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
            <CardTitle className="text-lg font-semibold">{currentMonth}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{current.count} services held</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Attendance</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{current.total}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Average per Service</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{current.average}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Peak</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{current.max}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Low</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{current.min}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800">
            <CardTitle className="text-lg font-semibold">{previousMonth}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{previous.count} services held</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Attendance</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{previous.total}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Average per Service</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{previous.average}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Peak</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{previous.max}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Low</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{previous.min}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`border-slate-200 dark:border-slate-700 ${isAvgPositive ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-orange-50/50 dark:bg-orange-900/10'}`}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${isAvgPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}
              >
                {isAvgPositive ? (
                  <TrendingUp
                    className={`h-4 w-4 ${isAvgPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}
                  />
                ) : (
                  <TrendingDown
                    className={`h-4 w-4 ${isAvgPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}
                  />
                )}
              </div>
              Average Attendance Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p
                className={`text-3xl font-bold ${isAvgPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}
              >
                {isAvgPositive ? '+' : ''}{Math.round(avgChange)}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                From {previous.average} to {current.average} members per service
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-slate-200 dark:border-slate-700 ${isTotalPositive ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}`}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${isTotalPositive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
              >
                {isTotalPositive ? (
                  <TrendingUp
                    className={`h-4 w-4 ${isTotalPositive ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}
                  />
                ) : (
                  <TrendingDown
                    className={`h-4 w-4 ${isTotalPositive ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}
                  />
                )}
              </div>
              Total Attendance Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p
                className={`text-3xl font-bold ${isTotalPositive ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {isTotalPositive ? '+' : ''}{Math.round(totalChange)}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                From {previous.total} to {current.total} total attendees
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Type Breakdown */}
      {serviceTypeBreakdown.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Service Type Breakdown</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Attendance by service type ({currentMonth})</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {serviceTypeBreakdown.map((serviceType) => (
                <div
                  key={serviceType.type}
                  className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{serviceType.type} Services</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{serviceType.count} services held</p>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{serviceType.totalAttendance}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">total</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{serviceType.avgAttendance}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">avg</p>
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
          </CardContent>
        </Card>
      )}

      {/* Recent Services Current Month */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Recent Services ({currentMonth})</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Latest attendance records</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {current.services.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No services this month</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {current.services.slice(0, 5).map((service) => (
                <div
                  key={service.id}
                  className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{service.type} Service</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(service.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{service.attendeeCount}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">attendees</p>
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
        reportType="Attendance Comparison"
        dataSource="Service Attendance Records"
        period={`${previousMonth} vs ${currentMonth}`}
      />
    </div>
  )
}
