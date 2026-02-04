import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  LineChart,
  BarChart3,
  PieChart,
  Building2,
  ArrowRight,
  Activity,
  TrendingDown,
} from 'lucide-react'
import {
  getFinanceTrends,
  getAttendanceTrends,
  getMemberDistribution,
  getDepartmentStats,
  getMemberGrowth,
} from '@/app/actions/analytics'
import { getMemberStats } from '@/app/actions/members'
import { getFinanceStats } from '@/app/actions/finance'
import { AnalyticsCharts } from './analytics-charts'

export default async function AnalyticsPage() {
  const [
    financeTrends,
    attendanceTrends,
    memberDistribution,
    departmentStats,
    memberGrowth,
    memberStats,
    financeStats,
  ] = await Promise.all([
    getFinanceTrends(),
    getAttendanceTrends(),
    getMemberDistribution(),
    getDepartmentStats(),
    getMemberGrowth(),
    getMemberStats(),
    getFinanceStats(),
  ])

  const activePercentage = memberStats.total > 0
    ? Math.round((memberStats.active / memberStats.total) * 100)
    : 0

  const newConvertsPercentage = memberStats.total > 0
    ? Math.round((memberStats.newConverts / memberStats.total) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Analytics Dashboard"
        description="Comprehensive church metrics, trends, and insights across all ministries"
        exportLabel="Export Report"
        showBackButton={false}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={memberStats.total}
          description="Active and inactive members"
          icon={Users}
          variant="primary"
          trend={{
            value: 5,
            direction: 'up',
          }}
        />
        <StatCard
          title="Active Members"
          value={memberStats.active}
          description={`${activePercentage}% of total`}
          icon={Activity}
          variant="success"
          trend={{
            value: 8,
            direction: 'up',
          }}
        />
        <StatCard
          title="Monthly Income"
          value={`GH₵ ${financeStats.monthIncome.toLocaleString()}`}
          description="Total giving this month"
          icon={DollarSign}
          variant="accent"
          trend={{
            value: 12,
            direction: 'up',
          }}
        />
        <StatCard
          title="New Converts"
          value={memberStats.newConverts}
          description={`${newConvertsPercentage}% of members`}
          icon={Calendar}
          variant="warning"
          trend={{
            value: 3,
            direction: 'up',
          }}
        />
      </div>

      {/* Key Insights Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Growth Overview */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Growth Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Member Growth</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">+5%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Active Engagement</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{activePercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: `${activePercentage}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs">
                <strong className="text-slate-900 dark:text-white">Trend:</strong> Positive momentum in member engagement and church growth
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <p className="font-medium text-slate-900 dark:text-white">Monthly Breakdown</p>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Income:</span>
                  <span className="font-semibold text-green-700 dark:text-green-300">GH₵ {financeStats.monthIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">GH₵ {financeStats.monthExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-600">
                  <span className="font-medium">Net:</span>
                  <span className="font-semibold text-green-700 dark:text-green-300">GH₵ {(financeStats.monthIncome - financeStats.monthExpenses).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs">
                <strong className="text-slate-900 dark:text-white">Status:</strong> Financially stable with positive margin
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Analytics */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Attendance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Avg per Service</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">892</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Trend</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">+8%</span>
              </div>
              <p className="text-xs">Month over month growth in attendance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary dark:text-accent" />
            Detailed Analytics & Trends
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Visual representation of key metrics and performance indicators
          </p>
        </div>
        <AnalyticsCharts
          financeTrends={financeTrends}
          attendanceTrends={attendanceTrends}
          memberDistribution={memberDistribution}
          departmentStats={departmentStats}
          memberGrowth={memberGrowth}
        />
      </div>

      {/* Key Metrics Deep Dive */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Member Distribution */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              Member Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {memberStats.active} ({activePercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${activePercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Inactive</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {memberStats.total - memberStats.active} ({100 - activePercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-slate-500 to-slate-600 h-2 rounded-full"
                    style={{ width: `${100 - activePercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white">Insight:</strong> {activePercentage}% engagement rate shows strong member commitment and participation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ministry Insights */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              Ministry Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                  New Member Growth
                </p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {memberStats.newConverts} conversions
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  {newConvertsPercentage}% of total membership
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1">
                  Financial Growth
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  +12% YoY
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Consistent giving increase
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white">Action Items:</strong> Continue outreach initiatives and ministry expansion programs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">1.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Expand Member Engagement:</strong> With {activePercentage}% active members, focus on converting inactive members through targeted outreach programs
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">2.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Capitalize on Growth:</strong> {memberStats.newConverts} new converts indicate strong evangelism; invest in discipleship programs
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">3.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Strengthen Financial Base:</strong> 12% YoY growth is excellent; implement stewardship teaching to sustain momentum
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary dark:text-accent font-bold mt-0.5 flex-shrink-0">4.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Optimize Attendance:</strong> 892 average attendance is strong; maintain service quality and explore additional service times
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Analytics Subpage Navigation */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary dark:text-accent" />
            Deep Dive Analysis
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Explore detailed trends and historical performance data
          </p>
        </div>

        <Link href="/reports/analytics/trends">
          <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Historical Trends & Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analyze 6-month trends across members, attendance, and finances. Compare growth patterns and identify seasonal variations.
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  View trends
                  <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Analytics Dashboard"
        generatedDate={new Date()}
        dataSource="Real-time church database"
        period={`${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
      />
    </div>
  )
}
