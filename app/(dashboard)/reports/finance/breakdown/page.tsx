'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  ArrowLeft,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard, ReportHeader } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'

// Mock data - replace with actual data fetching
const incomeData = {
  tithes: { amount: 45000, percentage: 45, trend: 8 },
  offerings: { amount: 25000, percentage: 25, trend: -3 },
  donations: { amount: 18000, percentage: 18, trend: 12 },
  other: { amount: 12000, percentage: 12, trend: 0 },
}

const expenseData = {
  operations: { amount: 35000, percentage: 40, trend: 5 },
  staffing: { amount: 28000, percentage: 32, trend: 2 },
  missions: { amount: 15000, percentage: 17, trend: 15 },
  maintenance: { amount: 10000, percentage: 11, trend: -5 },
}

const totalIncome = Object.values(incomeData).reduce((sum, item) => sum + item.amount, 0)
const totalExpenses = Object.values(expenseData).reduce((sum, item) => sum + item.amount, 0)
const netIncome = totalIncome - totalExpenses

export default function FinanceBreakdownPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Financial Breakdown"
        description="Detailed analysis of income sources and expense categories"
        exportLabel="Export Details"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={`GH₵ ${totalIncome.toLocaleString()}`}
          description="All income sources"
          icon={TrendingUp}
          variant="success"
          trend={{
            value: 5,
            direction: 'up',
          }}
        />
        <StatCard
          title="Total Expenses"
          value={`GH₵ ${totalExpenses.toLocaleString()}`}
          description="All expense categories"
          icon={TrendingDown}
          variant="warning"
          trend={{
            value: 2,
            direction: 'up',
          }}
        />
        <StatCard
          title="Net Income"
          value={`GH₵ ${netIncome.toLocaleString()}`}
          description={netIncome > 0 ? 'Surplus' : 'Deficit'}
          icon={DollarSign}
          variant={netIncome > 0 ? 'success' : 'warning'}
        />
        <StatCard
          title="Margin"
          value={`${((netIncome / totalIncome) * 100).toFixed(1)}%`}
          description="Profit margin"
          icon={BarChart3}
          variant="primary"
        />
      </div>

      {/* Income Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            Income Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {Object.entries(incomeData).map(([key, data]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize">
                      {key}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      GH₵ {data.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{data.percentage}%</Badge>
                    <span
                      className={`text-xs font-semibold ${data.trend >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                      {data.trend >= 0 ? '+' : ''}{data.trend}%
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={data.amount}
                  max={totalIncome}
                  variant="success"
                  showPercentage={false}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {Object.entries(expenseData).map(([key, data]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize">
                      {key}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      GH₵ {data.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{data.percentage}%</Badge>
                    <span
                      className={`text-xs font-semibold ${data.trend >= 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                        }`}
                    >
                      {data.trend >= 0 ? '+' : ''}{data.trend}%
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={data.amount}
                  max={totalExpenses}
                  variant="warning"
                  showPercentage={false}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-base">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Income Stability
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Strong
                </span>
              </div>
              <ProgressBar value={85} variant="success" showPercentage={false} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expense Control
                </span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Moderate
                </span>
              </div>
              <ProgressBar value={65} variant="warning" showPercentage={false} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Financial Health
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Healthy
                </span>
              </div>
              <ProgressBar value={78} variant="info" showPercentage={false} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-base">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                Tithes leading income
              </p>
              <p>
                Tithes represent {incomeData.tithes.percentage}% of total income and
                show positive growth trending.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">
                Staffing major expense
              </p>
              <p>
                Personnel costs account for {expenseData.staffing.percentage}% of
                expenses. Monitor for optimization opportunities.
              </p>
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
          Download Detailed Report
        </Button>
      </div>
    </div>
  )
}
