import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Download,
  Filter,
} from 'lucide-react'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'
import { getMembers, getMemberStats } from '@/app/actions/members'

const joinSourceBreakdown = [
  { source: 'Friend Referral', percentage: 35 },
  { source: 'Service Visit', percentage: 30 },
  { source: 'Online/Website', percentage: 20 },
  { source: 'Event/Outreach', percentage: 15 },
]

export default async function NewMembersReportPage() {
  const [membersData, memberStats] = await Promise.all([
    getMembers({
      status: 'new_convert',
      pageSize: 50,
      sortBy: 'joinDate',
      sortOrder: 'desc',
    }),
    getMemberStats(),
  ])

  const members = membersData.data
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisYearStart = new Date(now.getFullYear(), 0, 1)

  const newThisMonth = members.filter(
    (m: any) => new Date(m.joinDate) >= thisMonthStart
  ).length

  const newThisYear = members.filter(
    (m: any) => new Date(m.joinDate) >= thisYearStart
  ).length

  const conversionRate =
    memberStats.total > 0
      ? Math.round((newThisYear / memberStats.total) * 100)
      : 0

  const stats = {
    totalNew: members.length,
    thisMonth: newThisMonth,
    thisYear: newThisYear,
    conversionRate,
    averageJoinDays: 3.5,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="New Members Report"
        description="Track and analyze newly joined church members"
        exportLabel="Export CSV"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New This Month"
          value={stats.thisMonth}
          description="Members joined"
          icon={Users}
          variant="primary"
          trend={{
            value: 8,
            direction: 'up',
          }}
        />
        <StatCard
          title="This Year"
          value={stats.thisYear}
          description="YTD total"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          description="Visitor to member"
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Avg Join Time"
          value={`${stats.averageJoinDays} days`}
          description="From first visit"
          icon={TrendingUp}
          variant="info"
        />
      </div>

      {/* Join Source Analysis */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Join Source Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {joinSourceBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.source}
                  </span>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
                <ProgressBar value={item.percentage} variant="success" showPercentage={false} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Members List */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              New Members This Month
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {members && members.length > 0 ? (
              members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {member.firstName} {member.lastName}
                    </h3>
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
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{new Date(member.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                No new members found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              New member growth is tracking well with {stats.thisMonth} new members this month.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Key Points:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Friend referrals are the strongest conversion channel</li>
                <li>Service visits showing steady conversion</li>
                <li>Online channel underperforming - consider investment</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Recommended actions to improve member onboarding and retention.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Recommended Actions:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Schedule welcome calls for new members</li>
                <li>Assign mentors to new members</li>
                <li>Enhance friend referral incentive program</li>
                <li>Follow up with online channel visitors</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          View Monthly Trends
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="New Members Report"
        period={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        dataSource="Member database"
      />
    </div>
  )
}
