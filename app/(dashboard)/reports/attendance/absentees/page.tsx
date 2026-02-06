import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Users,
  TrendingDown,
  Phone,
  Mail,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import { db } from '@/lib/db'
import { members, services, attendance } from '@/lib/db/schema'
import { sql, desc, eq } from 'drizzle-orm'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

async function getAbsenteeReport() {
  // Get last 8 weeks of services
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
  const startDate = eightWeeksAgo.toISOString().split('T')[0]

  // Get all services in period
  const servicesInPeriod = await db
    .select({ id: services.id, date: services.serviceDate })
    .from(services)
    .where(sql`${services.serviceDate} >= ${startDate}`)

  const serviceIds = servicesInPeriod.map((s) => s.id)

  if (serviceIds.length === 0) {
    return {
      absentees: [],
      totalMembers: 0,
      totalAbsences: 0,
      topAbsentees: [],
      averageAbsenceRate: 0,
      servicesAnalyzed: 0,
    }
  }

  // Get all active members
  const allActiveMembers = await db
    .select({
      id: members.id,
      memberId: members.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
      emailPrimary: members.email,
      phonePrimary: members.phonePrimary,
    })
    .from(members)
    .where(eq(members.memberStatus, 'active'))

  const memberAttendanceData = await Promise.all(
    allActiveMembers.map(async (member) => {
      const [attendanceRecord] = await db
        .select({ count: sql<number>`count(*)` })
        .from(attendance)
        .where(sql`${attendance.memberId} = ${member.id} AND ${attendance.serviceId} IN (${sql.raw(
          serviceIds.map(() => '?').join(',')
        )})`)

      return {
        ...member,
        attendanceCount: Number(attendanceRecord?.count || 0),
        absenceCount: serviceIds.length - Number(attendanceRecord?.count || 0),
        absenceRate: ((serviceIds.length - Number(attendanceRecord?.count || 0)) / serviceIds.length) * 100,
      }
    })
  )

  // Filter and sort absentees (those with >50% absence rate)
  const absentees = memberAttendanceData
    .filter((m) => m.absenceRate > 50)
    .sort((a, b) => b.absenceCount - a.absenceCount)

  const topAbsentees = absentees.slice(0, 5)
  const totalAbsences = absentees.reduce((sum, m) => sum + m.absenceCount, 0)
  const averageAbsenceRate =
    allActiveMembers.length > 0
      ? Math.round(
        allActiveMembers.reduce((sum, m) => {
          const record = memberAttendanceData.find((ma) => ma.id === m.id)
          return sum + (record?.absenceRate || 0)
        }, 0) / allActiveMembers.length
      )
      : 0

  return {
    absentees,
    totalMembers: allActiveMembers.length,
    totalAbsences,
    topAbsentees,
    averageAbsenceRate,
    servicesAnalyzed: serviceIds.length,
  }
}

export default async function AttendanceAbsenteesPage() {
  const { absentees, totalMembers, totalAbsences, topAbsentees, averageAbsenceRate, servicesAnalyzed } =
    await getAbsenteeReport()

  const engagementRate = totalMembers > 0 ? Math.round(((totalMembers - absentees.length) / totalMembers) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/reports/attendance" className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Attendance
        </Link>
        <ReportHeader
          title="Absentees Report"
          description="Members with low attendance and engagement patterns"
          exportLabel="Export Absentees"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Inactive Members"
          value={absentees.length}
          description={`${absentees.length > 0 ? ((absentees.length / totalMembers) * 100).toFixed(1) : 0}% of congregation`}
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Total Absences"
          value={totalAbsences}
          description={`Across ${servicesAnalyzed} services`}
          icon={TrendingDown}
          variant="accent"
        />
        <StatCard
          title="Engagement Rate"
          value={`${engagementRate}%`}
          description="Active members"
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Avg Absence Rate"
          value={`${averageAbsenceRate}%`}
          description="Across all members"
          icon={TrendingDown}
          variant="warning"
        />
      </div>

      {/* Top Absentees */}
      {topAbsentees.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10">
          <CardHeader className="pb-4 border-b border-orange-200 dark:border-orange-900/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Top 5 Absentees
                </CardTitle>
                <p className="text-sm text-orange-700 dark:text-orange-200 mt-0.5">Members requiring attention</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {topAbsentees.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/30"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">ID: {member.memberId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{member.absenceCount}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">absences</p>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.absenceRate >= 75
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}
                    >
                      {Math.round(member.absenceRate)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Engagement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Members</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{totalMembers - absentees.length}</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${engagementRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Inactive Members</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{absentees.length}</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${100 - engagementRate}%` }}
                  />
                </div>
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
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Contact top {Math.min(3, topAbsentees.length)} absentees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Schedule follow-up meetings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Identify barriers to attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Plan re-engagement initiatives</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Full Absentees List */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <AlertCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">All Absentees</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Members with greater than 50% absence rate</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {absentees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No members with low attendance</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {absentees.map((member) => (
                <div
                  key={member.id}
                  className="py-4 px-6 -mx-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {member.phonePrimary && (
                          <a href={`tel:${member.phonePrimary}`} className="hover:text-primary dark:hover:text-accent flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phonePrimary}
                          </a>
                        )}
                        {member.emailPrimary && (
                          <a href={`mailto:${member.emailPrimary}`} className="hover:text-primary dark:hover:text-accent flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.emailPrimary}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{member.absenceCount}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">absences</p>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${member.absenceRate >= 75
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : member.absenceRate >= 60
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          }`}
                      >
                        {Math.round(member.absenceRate)}%
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
        reportType="Absentees Report"
        dataSource="Service Attendance Records (Last 8 Weeks)"
        period="8-week analysis"
      />
    </div>
  )
}
