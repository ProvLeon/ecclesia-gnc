'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
} from 'lucide-react'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'

// Mock data - replace with actual data fetching
const titheRecords = [
  {
    id: '1',
    memberName: 'John Doe',
    email: 'john@example.com',
    titheAmount: 500,
    date: '2024-01-15',
    method: 'Cash',
    frequency: 'Weekly',
  },
  {
    id: '2',
    memberName: 'Jane Smith',
    email: 'jane@example.com',
    titheAmount: 1200,
    date: '2024-01-14',
    method: 'Bank Transfer',
    frequency: 'Monthly',
  },
  {
    id: '3',
    memberName: 'Michael Johnson',
    email: 'michael@example.com',
    titheAmount: 800,
    date: '2024-01-13',
    method: 'Mobile Money',
    frequency: 'Bi-weekly',
  },
  {
    id: '4',
    memberName: 'Sarah Williams',
    email: 'sarah@example.com',
    titheAmount: 600,
    date: '2024-01-12',
    method: 'Cash',
    frequency: 'Weekly',
  },
  {
    id: '5',
    memberName: 'Robert Brown',
    email: 'robert@example.com',
    titheAmount: 1500,
    date: '2024-01-11',
    method: 'Bank Transfer',
    frequency: 'Monthly',
  },
]

const stats = {
  totalTithes: 45000,
  monthTithes: 12500,
  averageTithe: 850,
  totalGivers: 156,
  activeGivers: 142,
  givingRate: 91,
}

const methodBreakdown = [
  { method: 'Cash', amount: 5500, percentage: 35 },
  { method: 'Bank Transfer', amount: 4200, percentage: 28 },
  { method: 'Mobile Money', amount: 2100, percentage: 21 },
  { method: 'Online', amount: 700, percentage: 16 },
]

const frequencyBreakdown = [
  { frequency: 'Weekly', count: 45, percentage: 32 },
  { frequency: 'Bi-weekly', count: 32, percentage: 23 },
  { frequency: 'Monthly', count: 42, percentage: 30 },
  { frequency: 'Occasional', count: 23, percentage: 15 },
]

export default function TitheReportPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Tithe Report"
        description="Individual tithe records, giver analysis, and trend tracking"
        exportLabel="Export CSV"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Tithes"
          value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
          description="This month total"
          icon={DollarSign}
          variant="success"
          trend={{
            value: 8,
            direction: 'up',
          }}
        />
        <StatCard
          title="Active Givers"
          value={stats.activeGivers}
          description={`${stats.givingRate}% of members`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Average Tithe"
          value={`GH₵ ${stats.averageTithe}`}
          description="Per giver"
          icon={BarChart3}
          variant="accent"
        />
        <StatCard
          title="Total YTD"
          value={`GH₵ ${stats.totalTithes.toLocaleString()}`}
          description="Year to date"
          icon={TrendingUp}
          variant="info"
        />
      </div>

      {/* Payment Method Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {methodBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.method}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.percentage}%</Badge>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      GH₵ {item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ProgressBar value={item.percentage} variant="success" showPercentage={false} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Giving Frequency */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Giving Frequency Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {frequencyBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.frequency}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.percentage}%</Badge>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {item.count} givers
                    </span>
                  </div>
                </div>
                <ProgressBar value={item.percentage} variant="info" showPercentage={false} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tithe Records */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              Recent Tithe Records
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Member
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Amount
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Date
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Method
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {titheRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{record.memberName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                      GH₵ {record.titheAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {record.method}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {record.frequency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Giving Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Strong tithe participation with {stats.givingRate}% of members actively giving shows healthy church finances and member commitment.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Key Findings:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Cash is most common payment method (35%)</li>
                <li>Monthly givers represent 30% of givers</li>
                <li>Bank transfer shows growing trend</li>
                <li>Average tithe amount is consistent and healthy</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Continue to encourage consistent giving and explore digital payment options.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Action Items:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Promote digital payment methods for convenience</li>
                <li>Recognize consistent givers in leadership</li>
                <li>Offer online giving during services</li>
                <li>Send thank you communications to givers</li>
                <li>Track and follow up with lapsed givers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          View Historical Trends
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Export Tithe Report
        </Button>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Tithe Report"
        period={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        dataSource="Financial records database"
      />
    </div>
  )
}
