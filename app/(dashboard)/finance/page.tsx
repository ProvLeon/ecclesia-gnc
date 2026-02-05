import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, TrendingDown, Receipt, HandCoins, Landmark, ArrowRight, PieChart, DollarSign, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { getFinanceStats, getTithes, getOfferings, getExpenses } from '@/app/actions/finance'
import { format } from 'date-fns'
import { RecordTitheModal, RecordOfferingModal, RecordExpenseModal } from '@/components/modals'

export default async function FinancePage() {
  const [stats, { data: recentTithes }, { data: recentOfferings }] = await Promise.all([
    getFinanceStats(),
    getTithes(1, 5),
    getOfferings(1, 5),
  ])

  const netIncome = stats.monthTithes + stats.monthOfferings - stats.monthExpenses
  const totalIncome = stats.monthTithes + stats.monthOfferings

  return (
    <main className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Finance</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2">Track tithes, offerings, and expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <RecordTitheModal />
          <RecordOfferingModal />
          <RecordExpenseModal />
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={`GH₵ ${totalIncome.toLocaleString()}`}
          subtitle="This month"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Tithes"
          value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
          subtitle="Received"
          trend="up"
          icon={HandCoins}
          color="primary"
        />
        <StatCard
          title="Offerings"
          value={`GH₵ ${stats.monthOfferings.toLocaleString()}`}
          subtitle="Contributions"
          trend="up"
          icon={Landmark}
          color="accent"
        />
        <StatCard
          title="Net Income"
          value={`GH₵ ${netIncome.toLocaleString()}`}
          subtitle={netIncome >= 0 ? 'Surplus' : 'Deficit'}
          trend={netIncome >= 0 ? 'up' : 'down'}
          icon={Wallet}
          color={netIncome >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tithes - Larger Section */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <HandCoins className="h-5 w-5 text-primary dark:text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Recent Tithes</CardTitle>
                  <CardDescription className="text-xs">Latest contributions received</CardDescription>
                </div>
              </div>
              <Link href="/finance/tithe/new" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {recentTithes.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <HandCoins className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-slate-600 dark:text-slate-400">No tithes recorded yet</p>
                <p className="text-sm mt-1">Start recording tithes to track income</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentTithes.map((tithe) => (
                  <div key={tithe.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary dark:text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{tithe.memberName || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(tithe.paymentDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-slate-900 dark:text-white">GH₵ {Number(tithe.amount).toLocaleString()}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tithe</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Summary */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Expenses</CardTitle>
                <CardDescription className="text-xs">This month</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Expenses</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">GH₵ {stats.monthExpenses.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.monthExpenses / totalIncome) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link href="/finance/expenses">
                  <Button variant="outline" size="sm" className="w-full border-slate-200 dark:border-slate-700">
                    View Details <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offerings & Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Offerings */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 dark:bg-accent/20">
                <Landmark className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Offerings</CardTitle>
                <CardDescription className="text-xs">Special contributions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {recentOfferings.length === 0 ? (
              <div className="p-8 text-center">
                <Landmark className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 opacity-50" />
                <p className="font-medium text-slate-600 dark:text-slate-400 text-sm">No offerings recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentOfferings.map((offering) => (
                  <div key={offering.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{offering.memberName || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {format(new Date(offering.serviceDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white flex-shrink-0">GH₵ {Number(offering.amount).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Insights */}
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                  <PieChart className="h-5 w-5 text-primary dark:text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">Financial Summary</p>
                  <div className="space-y-2 mt-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Income</span>
                      <span className="font-medium text-green-600 dark:text-green-400">GH₵ {totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                      <span className="font-medium text-red-600 dark:text-red-400">GH₵ {stats.monthExpenses.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-white">Net</span>
                      <span className={`font-semibold ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        GH₵ {netIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/reports/finance">
                <Button variant="outline" size="sm" className="w-full border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700">
                  View Full Report <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: 'primary' | 'accent' | 'green' | 'red'
}

function StatCard({ title, value, subtitle, trend, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent',
    accent: 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }

  const trendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
