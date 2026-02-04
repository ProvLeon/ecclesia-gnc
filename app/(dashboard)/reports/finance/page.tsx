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
          title="Tithes"
          value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
          description="This month"
          icon={HandCoins}
          variant="primary"
        />
        <StatCard
          title="Offerings"
          value={`GH₵ ${stats.monthOfferings.toLocaleString()}`}
          description="This month"
          icon={Landmark}
          variant="success"
        />
        <StatCard
          title="Expenses"
          value={`GH₵ ${stats.monthExpenses.toLocaleString()}`}
          description="Operating costs"
          icon={BarChart3}
          variant="accent"
        />
        <StatCard
          title="Net Income"
          value={`GH₵ ${Math.abs(netIncome).toLocaleString()}`}
          description={`${profitMargin}% margin`}
          icon={Wallet}
          variant={netIncome >= 0 ? 'success' : 'warning'}
        />
      </div>

      {/* Insights and Financial Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Tithes</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {tithePercentage}%
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${tithePercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Offerings</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {(100 - parseFloat(tithePercentage)).toFixed(1)}%
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${100 - parseFloat(tithePercentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <strong>Total Income:</strong> GH₵ {(stats.monthTithes + stats.monthOfferings).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                  Income Ratio
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {profitMargin}%
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Profit margin on income
                </p>
              </div>

              <div className={`p-3 rounded-lg border ${netIncome >= 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                <p className={`text-xs font-semibold uppercase mb-1 ${netIncome >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
                  }`}>
                  Status
                </p>
                <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {netIncome >= 0 ? 'Healthy' : 'Deficit'}
                </p>
                <p className={`text-xs mt-1 ${netIncome >= 0
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
                  }`}>
                  {netIncome >= 0
                    ? 'Organization is financially stable'
                    : 'Review expenses and increase giving'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Action Items
                </p>
                <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• Prepare budget for next quarter</li>
                  <li>• Review major expense categories</li>
                  <li>• Plan outreach to increase giving</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tithes */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <HandCoins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Recent Tithes</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest contributions</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tithes.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No tithes this month</p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {tithes.slice(0, 5).map((t) => (
                  <div key={t.id} className="py-4 -mx-6 px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {t.memberName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {format(new Date(t.paymentDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white flex-shrink-0">
                        GH₵ {Number(t.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Offerings */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Landmark className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Recent Offerings</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest donations</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {offerings.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No offerings this month</p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {offerings.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-4 -mx-6 px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white truncate capitalize">
                          {o.offeringType}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {format(new Date(o.serviceDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white flex-shrink-0">
                        GH₵ {Number(o.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
