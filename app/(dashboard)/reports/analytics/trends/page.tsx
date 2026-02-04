'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
} from 'lucide-react'
import { StatCard, ReportHeader } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'

// Mock data - replace with actual data fetching
const memberTrends = [
  { month: 'Jan', active: 850, inactive: 150, converts: 12 },
  { month: 'Feb', active: 865, inactive: 145, converts: 18 },
  { month: 'Mar', active: 890, inactive: 140, converts: 25 },
  { month: 'Apr', active: 912, inactive: 135, converts: 22 },
  { month: 'May', active: 945, inactive: 128, converts: 33 },
  { month: 'Jun', active: 978, inactive: 120, converts: 28 },
]

const attendanceTrends = [
  { month: 'Jan', sunday: 750, midweek: 280, special: 120 },
  { month: 'Feb', sunday: 765, midweek: 290, special: 145 },
  { month: 'Mar', sunday: 780, midweek: 310, special: 160 },
  { month: 'Apr', sunday: 795, midweek: 320, special: 180 },
  { month: 'May', sunday: 820, midweek: 335, special: 200 },
  { month: 'Jun', sunday: 845, midweek: 350, special: 220 },
]

const financeTrends = [
  { month: 'Jan', income: 42000, expenses: 38000, net: 4000 },
  { month: 'Feb', income: 45000, expenses: 39000, net: 6000 },
  { month: 'Mar', income: 48000, expenses: 40000, net: 8000 },
  { month: 'Apr', income: 51000, expenses: 42000, net: 9000 },
  { month: 'May', income: 54000, expenses: 43000, net: 11000 },
  { month: 'Jun', income: 58000, expenses: 44000, net: 14000 },
]

const latestMember = memberTrends[memberTrends.length - 1]
const latestAttendance = attendanceTrends[attendanceTrends.length - 1]
const latestFinance = financeTrends[financeTrends.length - 1]

const memberGrowth = ((latestMember.active - memberTrends[0].active) / memberTrends[0].active) * 100
const attendanceGrowth = ((latestAttendance.sunday - attendanceTrends[0].sunday) / attendanceTrends[0].sunday) * 100
const incomeGrowth = ((latestFinance.income - financeTrends[0].income) / financeTrends[0].income) * 100

export default function AnalyticsTrendsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Historical Trends Analysis"
        description="Track key metrics over the past 6 months with detailed comparisons"
        exportLabel="Export Trends Report"
      />

      {/* Growth Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Member Growth"
          value={`${memberGrowth.toFixed(1)}%`}
          description="6-month trend"
          icon={TrendingUp}
          variant="success"
          trend={{
            value: Math.round(memberGrowth),
            direction: 'up',
          }}
        />
        <StatCard
          title="Attendance Growth"
          value={`${attendanceGrowth.toFixed(1)}%`}
          description="Sunday services"
          icon={TrendingUp}
          variant="success"
          trend={{
            value: Math.round(attendanceGrowth),
            direction: 'up',
          }}
        />
        <StatCard
          title="Income Growth"
          value={`${incomeGrowth.toFixed(1)}%`}
          description="6-month trend"
          icon={TrendingUp}
          variant="success"
          trend={{
            value: Math.round(incomeGrowth),
            direction: 'up',
          }}
        />
        <StatCard
          title="Overall Health"
          value="Excellent"
          description="All metrics positive"
          icon={BarChart3}
          variant="primary"
        />
      </div>

      {/* Member Trends */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Member Growth Trend (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {memberTrends.map((trend, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {trend.month}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Active: {trend.active} | Inactive: {trend.inactive} | Converts: {trend.converts}
                    </p>
                  </div>
                  <Badge variant="outline">{trend.active + trend.inactive} total</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Active Members</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {((trend.active / (trend.active + trend.inactive)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={trend.active}
                      max={trend.active + trend.inactive}
                      variant="success"
                      showPercentage={false}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Trends */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Attendance Pattern (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {attendanceTrends.map((trend, idx) => {
              const total = trend.sunday + trend.midweek + trend.special
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {trend.month}
                    </h4>
                    <Badge variant="outline">{total} attendees</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Sunday Services</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {trend.sunday}
                        </span>
                      </div>
                      <ProgressBar
                        value={trend.sunday}
                        max={total}
                        variant="success"
                        showPercentage={false}
                        size="sm"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Midweek Services</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {trend.midweek}
                        </span>
                      </div>
                      <ProgressBar
                        value={trend.midweek}
                        max={total}
                        variant="info"
                        showPercentage={false}
                        size="sm"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Special Events</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {trend.special}
                        </span>
                      </div>
                      <ProgressBar
                        value={trend.special}
                        max={total}
                        variant="warning"
                        showPercentage={false}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Trends */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            Financial Performance (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {financeTrends.map((trend, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {trend.month}
                  </h4>
                  <Badge
                    variant="outline"
                    className={
                      trend.net > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                    }
                  >
                    GH₵ {trend.net.toLocaleString()}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Income</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        GH₵ {trend.income.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar
                      value={trend.income}
                      max={Math.max(...financeTrends.map(t => t.income))}
                      variant="success"
                      showPercentage={false}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        GH₵ {trend.expenses.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar
                      value={trend.expenses}
                      max={Math.max(...financeTrends.map(t => t.expenses))}
                      variant="warning"
                      showPercentage={false}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Positive Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              All major metrics show consistent upward trends over the 6-month period:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                <span>Member growth of {memberGrowth.toFixed(1)}% with positive conversion rate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                <span>Attendance increasing by {attendanceGrowth.toFixed(1)}% across all service types</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                <span>Financial health improving with income growth of {incomeGrowth.toFixed(1)}%</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Based on current trends, consider these actions:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Plan ahead for increased attendance with facility expansion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Allocate additional resources for member care programs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Launch strategic initiatives to sustain growth momentum</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Compare Periods
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Download Trend Report
        </Button>
      </div>
    </div>
  )
}
