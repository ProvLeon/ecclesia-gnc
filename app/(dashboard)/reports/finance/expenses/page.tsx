'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingDown,
  BarChart3,
  Calendar,
  Download,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'

// Mock data - replace with actual data fetching
const expenseRecords = [
  {
    id: '1',
    category: 'Operations',
    amount: 8500,
    date: '2024-01-15',
    description: 'Utilities and maintenance',
    vendor: 'City Utilities',
  },
  {
    id: '2',
    category: 'Staffing',
    amount: 6000,
    date: '2024-01-14',
    description: 'Salaries and benefits',
    vendor: 'Payroll',
  },
  {
    id: '3',
    category: 'Missions',
    amount: 3200,
    date: '2024-01-13',
    description: 'Outreach program supplies',
    vendor: 'Community Partners',
  },
  {
    id: '4',
    category: 'Maintenance',
    amount: 2100,
    date: '2024-01-12',
    description: 'Building repairs',
    vendor: 'Contractor Services',
  },
  {
    id: '5',
    category: 'Programs',
    amount: 1800,
    date: '2024-01-11',
    description: 'Youth ministry event',
    vendor: 'Event Supplier',
  },
]

const stats = {
  totalExpenses: 75000,
  monthExpenses: 21600,
  largestCategory: 'Staffing',
  largestAmount: 28000,
  budgetUtilization: 68,
  yearOverYearGrowth: -3,
}

const expenseCategoryBreakdown = [
  { category: 'Staffing', amount: 28000, percentage: 37 },
  { category: 'Operations', amount: 22000, percentage: 29 },
  { category: 'Missions', amount: 13000, percentage: 17 },
  { category: 'Maintenance', amount: 8500, percentage: 11 },
  { category: 'Programs', amount: 3500, percentage: 6 },
]

export default function ExpenseReportPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Expense Report"
        description="Detailed breakdown of organizational expenses by category and vendor"
        exportLabel="Export CSV"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Expenses"
          value={`GH₵ ${stats.monthExpenses.toLocaleString()}`}
          description="This month total"
          icon={DollarSign}
          variant="warning"
          trend={{
            value: Math.abs(stats.yearOverYearGrowth),
            direction: 'down',
          }}
        />
        <StatCard
          title="Largest Category"
          value={stats.largestCategory}
          description={`GH₵ ${stats.largestAmount.toLocaleString()}`}
          icon={BarChart3}
          variant="accent"
        />
        <StatCard
          title="Budget Utilization"
          value={`${stats.budgetUtilization}%`}
          description="Of annual budget"
          icon={TrendingDown}
          variant="info"
        />
        <StatCard
          title="Total YTD"
          value={`GH₵ ${stats.totalExpenses.toLocaleString()}`}
          description="Year to date"
          icon={AlertCircle}
          variant="primary"
        />
      </div>

      {/* Expense Category Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {expenseCategoryBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.percentage}%</Badge>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      GH₵ {item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ProgressBar value={item.percentage} variant="warning" showPercentage={false} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
              Recent Expenses
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
                    Description
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Category
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Vendor
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Date
                  </th>
                  <th className="pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenseRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {record.description}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {record.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {record.vendor}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold text-right">
                      GH₵ {record.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Control & Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Expense Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Organization is tracking {Math.abs(stats.yearOverYearGrowth)}% below last year, indicating improved cost control.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Key Observations:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Staffing remains largest expense category</li>
                <li>Operations costs are well controlled</li>
                <li>Maintenance expenses within expected range</li>
                <li>Overall spending below budget target</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Cost Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Continue monitoring expenses and look for opportunities to optimize spending without impacting ministry.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Recommendations:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Review vendor contracts for savings opportunities</li>
                <li>Implement energy efficiency programs</li>
                <li>Track discretionary spending more closely</li>
                <li>Consider bulk purchasing for supplies</li>
                <li>Schedule regular expense review meetings</li>
              </ul>
            </div>
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
          Export Expense Report
        </Button>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Expense Report"
        period={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        dataSource="Financial records database"
      />
    </div>
  )
}
