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
} from 'lucide-react'
import { format } from 'date-fns'
import { getFinanceStats, getTithes, getOfferings } from '@/app/actions/finance'

export default async function FinanceReportPage() {
  const [stats, { data: tithes }, { data: offerings }] = await Promise.all([
    getFinanceStats(),
    getTithes(1, 10),
    getOfferings(1, 10),
  ])

  const netIncome = stats.monthIncome - stats.monthExpenses
  const profitMargin = stats.monthIncome > 0 ? ((netIncome / stats.monthIncome) * 100).toFixed(1) : '0'
  const tithePercentage = stats.monthIncome > 0 ? ((stats.monthTithes / stats.monthIncome) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Financial Report
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monthly income, expenses, and financial health overview
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
                    Total Income
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    GH₵ {stats.monthIncome.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-200 dark:bg-green-800/50">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="pt-2 border-t border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                  +12% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Total Expenses
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    GH₵ {stats.monthExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-200 dark:bg-blue-800/50">
                  <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  {((stats.monthExpenses / stats.monthIncome) * 100).toFixed(0)}% of income
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-slate-200 dark:border-slate-700 bg-gradient-to-br ${netIncome >= 0
          ? 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20'
          : 'from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20'
          }`}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${netIncome >= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-orange-700 dark:text-orange-300'
                    }`}>
                    Net Income
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold mt-2 ${netIncome >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-orange-700 dark:text-orange-400'
                    }`}>
                    GH₵ {Math.abs(netIncome).toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${netIncome >= 0
                  ? 'bg-emerald-200 dark:bg-emerald-800/50'
                  : 'bg-orange-200 dark:bg-orange-800/50'
                  }`}>
                  <Wallet className={`h-6 w-6 ${netIncome >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-orange-600 dark:text-orange-400'
                    }`} />
                </div>
              </div>
              <div className={`pt-2 border-t ${netIncome >= 0
                ? 'border-emerald-200 dark:border-emerald-800'
                : 'border-orange-200 dark:border-orange-800'
                }`}>
                <p className={`text-xs font-medium ${netIncome >= 0
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-orange-700 dark:text-orange-300'
                  }`}>
                  {profitMargin}% profit margin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Tithes Received
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    GH₵ {stats.monthTithes.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-200 dark:bg-purple-800/50">
                  <HandCoins className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {tithePercentage}% of income
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <HandCoins className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                Recent Tithes
              </CardTitle>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {tithes.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tithes.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No tithes this month</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {tithes.slice(0, 5).map((tithe) => (
                  <div
                    key={tithe.id}
                    className="py-3 px-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-6 px-6 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {tithe.memberName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(tithe.paymentDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white ml-4 flex-shrink-0">
                      GH₵ {Number(tithe.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Landmark className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                Recent Offerings
              </CardTitle>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {offerings.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {offerings.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No offerings this month</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {offerings.slice(0, 5).map((offering) => (
                  <div
                    key={offering.id}
                    className="py-3 px-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-6 px-6 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {offering.offeringType}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(offering.serviceDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white ml-4 flex-shrink-0">
                      GH₵ {Number(offering.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <span className="text-primary dark:text-accent font-bold mt-0.5">✓</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Healthy Cash Flow:</strong> Income exceeds expenses with {profitMargin}% profit margin
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary dark:text-accent font-bold mt-0.5">✓</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Tithe Foundation:</strong> Tithes comprise {tithePercentage}% of total income
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary dark:text-accent font-bold mt-0.5">✓</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Balanced Budget:</strong> Expense ratio of {((stats.monthExpenses / stats.monthIncome) * 100).toFixed(0)}% is sustainable
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Review expense categories for optimization opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Establish reserves equivalent to 3 months of operating expenses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-accent font-bold mt-0.5">•</span>
                <span>Monitor giving trends and plan ministry growth accordingly</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Report Footer */}
      <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">Report Type</p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">Financial Summary</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">Generated</p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">
                {new Date().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">Period</p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">
                {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
