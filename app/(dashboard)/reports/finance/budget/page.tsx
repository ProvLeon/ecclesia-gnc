'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Calendar,
  Download,
} from 'lucide-react'
import { StatCard, ReportHeader } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'

// Mock data - replace with actual data fetching
const budgetCategories = [
  {
    name: 'Operations',
    budget: 40000,
    actual: 35000,
    status: 'under' as const,
    variance: 5000,
  },
  {
    name: 'Staffing',
    budget: 30000,
    actual: 28500,
    status: 'under' as const,
    variance: 1500,
  },
  {
    name: 'Missions & Outreach',
    budget: 15000,
    actual: 18000,
    status: 'over' as const,
    variance: -3000,
  },
  {
    name: 'Facilities & Maintenance',
    budget: 12000,
    actual: 11200,
    status: 'under' as const,
    variance: 800,
  },
  {
    name: 'Programs & Events',
    budget: 10000,
    actual: 10500,
    status: 'over' as const,
    variance: -500,
  },
  {
    name: 'Administration',
    budget: 8000,
    actual: 7800,
    status: 'under' as const,
    variance: 200,
  },
]

const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.budget, 0)
const totalActual = budgetCategories.reduce((sum, cat) => sum + cat.actual, 0)
const totalVariance = totalBudget - totalActual
const variancePercentage = ((totalVariance / totalBudget) * 100).toFixed(1)

const categoriesUnderBudget = budgetCategories.filter(cat => cat.status === 'under').length
const categoriesOverBudget = budgetCategories.filter(cat => cat.status === 'over').length

export default function FinanceBudgetPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Budget vs Actual"
        description="Compare budgeted amounts against actual spending across all categories"
        exportLabel="Export Budget Report"
      />

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget"
          value={`GH₵ ${totalBudget.toLocaleString()}`}
          description="All categories"
          icon={BarChart3}
          variant="primary"
        />
        <StatCard
          title="Total Actual"
          value={`GH₵ ${totalActual.toLocaleString()}`}
          description="Current spending"
          icon={TrendingDown}
          variant="accent"
        />
        <StatCard
          title="Variance"
          value={`GH₵ ${totalVariance.toLocaleString()}`}
          description={totalVariance > 0 ? 'Under budget' : 'Over budget'}
          icon={TrendingUp}
          variant={totalVariance > 0 ? 'success' : 'warning'}
          trend={{
            value: parseInt(variancePercentage),
            direction: totalVariance > 0 ? 'up' : 'down',
          }}
        />
        <StatCard
          title="Budget Utilization"
          value={`${((totalActual / totalBudget) * 100).toFixed(0)}%`}
          description="Of total budget used"
          icon={BarChart3}
          variant="info"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              Under Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {categoriesUnderBudget}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Categories within budget limits
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {categoriesUnderBudget === budgetCategories.length ? '✓ All categories' : `${categoriesUnderBudget}/${budgetCategories.length}`}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Over Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {categoriesOverBudget}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Categories exceeding limits
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {categoriesOverBudget === 0 ? '✓ None' : `${categoriesOverBudget} category/ies`}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Budget Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {variancePercentage}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Remaining budget margin
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <ProgressBar
                value={totalActual}
                max={totalBudget}
                variant="info"
                showPercentage={false}
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary dark:text-accent" />
            Budget Category Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {budgetCategories.map((category, idx) => {
              const percentUsed = (category.actual / category.budget) * 100
              const isOver = category.status === 'over'

              return (
                <div key={idx}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {category.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Budget: GH₵ {category.budget.toLocaleString()} | Actual: GH₵{' '}
                        {category.actual.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isOver ? 'destructive' : 'default'}
                        className={
                          isOver
                            ? ''
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                        }
                      >
                        {isOver ? 'Over' : 'Under'}
                      </Badge>
                      <span
                        className={`text-sm font-semibold ${isOver
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                          }`}
                      >
                        {isOver ? '+' : '-'}GH₵ {Math.abs(category.variance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={category.actual}
                    max={category.budget}
                    variant={isOver ? 'danger' : 'success'}
                    showPercentage={false}
                    size="md"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>{percentUsed.toFixed(0)}% utilized</span>
                    <span>Remaining: GH₵ {(category.budget - category.actual).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Budget Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Focus on overages
            </p>
            <p>
              Missions & Outreach has exceeded budget by GH₵3,000. Review spending
              priorities and consider adjustments for next period.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white">
              Positive variance
            </p>
            <p>
              Overall, you are tracking {variancePercentage}% under budget, indicating
              good cost management. Consider reallocating savings to priority areas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          View Quarterly Trends
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Export Budget Report
        </Button>
      </div>
    </div>
  )
}
