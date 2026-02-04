import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'
import {
  getFinanceTrends,
  getAttendanceTrends,
  getMemberDistribution,
  getDepartmentStats,
  getMemberGrowth
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Comprehensive church metrics and trends
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{memberStats.total}</p>
              <p className="text-sm text-slate-500">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{memberStats.active}</p>
              <p className="text-sm text-slate-500">Active Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">GH₵ {financeStats.monthIncome.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Monthly Income</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{memberStats.newConverts}</p>
              <p className="text-sm text-slate-500">New Converts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        financeTrends={financeTrends}
        attendanceTrends={attendanceTrends}
        memberDistribution={memberDistribution}
        departmentStats={departmentStats}
        memberGrowth={memberGrowth}
      />
    </div>
  )
}
