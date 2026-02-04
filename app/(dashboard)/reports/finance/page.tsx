import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  ArrowLeft,
  Download,
  HandCoins,
  Landmark,
  TrendingUp,
  BarChart3,
  AlertCircle,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { getFinanceStats, getTithes, getOfferings } from '@/app/actions/finance'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

export default async function FinanceReportPage() {
  const [stats, { data: tithes }, { data: offerings }] = await Promise.all([
    getFinanceStats(),
    getTithes(1, 10),
    getOfferings(1, 10),
  ])

  const netIncome = stats.monthIncome - stats.monthExpenses
  const profitMargin = stats.monthIncome > 0 ? ((netIncome / stats.monthIncome) * 100).toFixed(1) : '0'
  const tithePercentage = stats.monthIncome > 0 ? ((stats.monthTithes / stats.monthIncome) * 100).toFixed(1) : '0'
  const offeringPercentage = stats.monthIncome > 0 ? ((stats.monthOfferings / stats.monthIncome) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <ReportHeader
        title="Financial Report"
        description="Monthly income, expenses, and financial health overview"
        exportLabel="Export PDF"
      />

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={`GH₵ ${stats.monthIncome.toLocaleString()}`}
          description="Tithes + Offerings"
          icon={BarChart3}
          variant="primary"
        />
        <StatCard
          title="Tithes"
          value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
          description={`${tithePercentage}% of income`}
          icon={HandCoins}
          variant="success"
        />
        <StatCard
          title="Offerings"
          value={`GH₵ ${stats.monthOfferings.toLocaleString()}`}
          description={`${offeringPercentage}% of income`}
          icon={Landmark}
          variant="accent"
        />
        <StatCard
          title="Expenses"
          value={`GH₵ ${stats.monthExpenses.toLocaleString()}`}
          description="Operating costs"
          icon={Wallet}
          variant={netIncome >= 0 ? 'success' : 'warning'}
        />
      </div>

      {/* Net Income & Health Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                <BarChart3 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Monthly result</p>
              <div className="flex items-end gap-3">
                <p className={`text-4xl font-bold ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  GH₵ {Math.abs(netIncome).toLocaleString()}
                </p>
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1.5 mb-1 ${netIncome >= 0
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                  {netIncome >= 0 ? (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {profitMargin}%
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      {profitMargin}%
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className={`text-sm font-medium ${netIncome >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
                }`}>
                {netIncome >= 0 ? '✓ Financially healthy' : '⚠ Budget deficit'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                {netIncome >= 0
                  ? 'Organization is generating surplus funds'
                  : 'Review expenses and plan fundraising efforts'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                <TrendingUp className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tithes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Tithes</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">GH₵ {stats.monthTithes.toLocaleString()}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {tithePercentage}%
                </p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${tithePercentage}%` }}
                />
              </div>
            </div>

            {/* Offerings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Offerings</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">GH₵ {stats.monthOfferings.toLocaleString()}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {offeringPercentage}%
                </p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${offeringPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Tithes */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <HandCoins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Tithes</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest contributions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tithes.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No tithes this month</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {tithes.slice(0, 5).map((t) => (
                  <div key={t.id} className="py-3 px-0 first:pt-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-6 px-6 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                          {t.memberName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {format(new Date(t.paymentDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white flex-shrink-0 text-sm">
                        GH₵ {Number(t.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tithes.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 -mx-6 px-6 pb-0 mt-2">
                <Link href="/reports/finance/tithes">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all tithes
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Offerings */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Landmark className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Offerings</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest donations</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {offerings.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No offerings this month</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {offerings.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 px-0 first:pt-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-6 px-6 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate capitalize">
                          {o.offeringType}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {format(new Date(o.serviceDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white flex-shrink-0 text-sm">
                        GH₵ {Number(o.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {offerings.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 -mx-6 px-6 pb-0 mt-2">
                <Link href="/reports/finance/offerings">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all offerings
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Navigation */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Detailed Analysis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explore deeper insights into specific financial areas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Breakdown */}
          <Link href="/reports/finance/breakdown">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                        <PieChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        Income & Expense Breakdown
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                      Detailed analysis of all income sources and expense categories with visual breakdown.
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0 rotate-180 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Budget vs Actual */}
          <Link href="/reports/finance/budget">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                        <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Budget vs Actual
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                      Compare budgeted amounts against actual spending across all expense categories.
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-shrink-0 rotate-180 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Tithes */}
          <Link href="/reports/finance/tithes">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                        <HandCoins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Tithe Report
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                      Individual tithe records, trends, and contributor analysis.
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 rotate-180 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Expenses */}
          <Link href="/reports/finance/expenses">
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                        <Wallet className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        Expense Report
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                      Detailed expense breakdown, budget tracking, and cost analysis.
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-shrink-0 rotate-180 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Monthly Financial Summary"
        period={format(new Date(), 'MMMM yyyy')}
        dataSource="Financial Records"
      />
    </div>
  )
}
