import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  TrendingDown,
  Download,
  Heart,
} from 'lucide-react'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'
import { getMembers } from '@/app/actions/members'

const reasonBreakdown = [
  { reason: 'No recent attendance', count: 2, percentage: 40 },
  { reason: 'Health issues', count: 1, percentage: 20 },
  { reason: 'Relocated', count: 1, percentage: 20 },
  { reason: 'Other reasons', count: 1, percentage: 20 },
]

export default async function InactiveMembersReportPage() {
  const membersData = await getMembers({
    status: 'inactive',
    pageSize: 100,
    sortBy: 'joinDate',
    sortOrder: 'desc',
  })

  const members = membersData.data
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())

  const recentlyInactiveCount = members.filter(
    (m: any) => m.joinDate && new Date(m.joinDate) >= threeMonthsAgo
  ).length

  const longTermInactiveCount = members.filter(
    (m: any) => m.joinDate && new Date(m.joinDate) < sixMonthsAgo
  ).length

  const stats = {
    totalInactive: members.length,
    percentageOfTotal: 15,
    recentlyInactive: recentlyInactiveCount,
    longTermInactive: longTermInactiveCount,
    outreachNeeded: members.length,
  }

  const daysInactive = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Inactive Members Report"
        description="Members who haven't attended services recently and need pastoral care outreach"
        exportLabel="Export CSV"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inactive"
          value={stats.totalInactive}
          description={`${stats.percentageOfTotal}% of members`}
          icon={Users}
          variant="warning"
          trend={{
            value: 3,
            direction: 'down',
          }}
        />
        <StatCard
          title="Recently Inactive"
          value={stats.recentlyInactive}
          description="Last 3 months"
          icon={AlertCircle}
          variant="danger"
        />
        <StatCard
          title="Long-term Inactive"
          value={stats.longTermInactive}
          description="Over 6 months"
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          title="Outreach Needed"
          value={stats.outreachNeeded}
          description="Requiring follow-up"
          icon={Heart}
          variant="info"
        />
      </div>

      {/* Inactivity Reason Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Reasons for Inactivity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {reasonBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.reason}</span>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
                <ProgressBar value={item.percentage} variant="warning" showPercentage={false} />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {item.count} member{item.count > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Members List */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
            Inactive Member Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {members && members.length > 0 ? (
              members.map((member: any) => {
                const daysSince = daysInactive(member.joinDate)
                const monthsSince = Math.floor(daysSince / 30)
                let statusVariant = 'default'
                let statusLabel = ''

                if (daysSince < 90) {
                  statusVariant = 'warning'
                  statusLabel = 'Recently Inactive'
                } else if (daysSince < 180) {
                  statusVariant = 'warning'
                  statusLabel = 'Moderately Inactive'
                } else {
                  statusVariant = 'destructive'
                  statusLabel = 'Long-term Inactive'
                }

                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {member.firstName} {member.lastName}
                        </h3>
                        <Badge
                          variant={statusVariant as any}
                          className={
                            statusVariant === 'warning'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }
                        >
                          {statusLabel}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {member.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.phonePrimary && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{member.phonePrimary}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          <strong>Member Since:</strong> {new Date(member.joinDate).toLocaleDateString()}
                        </span>
                        <span>
                          <strong>Status:</strong> Inactive for {monthsSince} month{monthsSince > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Reach Out
                    </Button>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                No inactive members found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outreach Strategy */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Outreach Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Recommended pastoral care actions to re-engage inactive members.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Priority Actions:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Schedule personal phone calls or visits</li>
                <li>Send encouragement cards and prayer requests</li>
                <li>Invite to special events and programs</li>
                <li>Address known barriers (health, schedule, etc.)</li>
                <li>Connect with support groups or ministries</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Understanding inactivity patterns helps target outreach efforts effectively.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Key Findings:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>{stats.percentageOfTotal}% of membership is currently inactive</li>
                <li>Health and relocation are significant barriers</li>
                <li>Recent inactives are more likely to return</li>
                <li>Personalized outreach shows highest success rate</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Outreach
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Export List
        </Button>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Inactive Members Report"
        period={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        dataSource="Member attendance database"
      />
    </div>
  )
}
