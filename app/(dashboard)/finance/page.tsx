import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Wallet, TrendingUp, TrendingDown, Receipt, HandCoins, Landmark, ArrowRight } from 'lucide-react'
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Finance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track tithes, offerings, and expenses</p>
                </div>
                <div className="flex gap-2">
                    <RecordTitheModal />
                    <RecordOfferingModal />
                    <RecordExpenseModal />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tithes (This Month)"
                    value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
                    trend="up"
                    icon={HandCoins}
                />
                <StatCard
                    title="Offerings (This Month)"
                    value={`GH₵ ${stats.monthOfferings.toLocaleString()}`}
                    trend="up"
                    icon={Landmark}
                />
                <StatCard
                    title="Expenses (This Month)"
                    value={`GH₵ ${stats.monthExpenses.toLocaleString()}`}
                    trend="down"
                    icon={Receipt}
                />
                <StatCard
                    title="Net Income"
                    value={`GH₵ ${stats.monthNet.toLocaleString()}`}
                    trend={stats.monthNet >= 0 ? 'up' : 'down'}
                    icon={Wallet}
                    highlight={stats.monthNet >= 0}
                />
            </div>

            {/* Recent Transactions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Tithes */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <HandCoins className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium">Recent Tithes</CardTitle>
                                <CardDescription>Latest contributions</CardDescription>
                            </div>
                        </div>
                        <Link href="/finance/tithes">
                            <Button variant="ghost" size="sm" className="text-slate-500">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {recentTithes.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <HandCoins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No tithes recorded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentTithes.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{t.memberName || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(t.paymentDate), 'MMM d, yyyy')}</p>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">GH₵ {Number(t.amount).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Offerings */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Landmark className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium">Recent Offerings</CardTitle>
                                <CardDescription>Latest collections</CardDescription>
                            </div>
                        </div>
                        <Link href="/finance/offerings">
                            <Button variant="ghost" size="sm" className="text-slate-500">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {recentOfferings.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Landmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No offerings recorded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentOfferings.map((o) => (
                                    <div key={o.id} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                                                {o.isAnonymous ? 'Anonymous' : o.memberName || 'General'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-xs py-0 h-5">{o.offeringType}</Badge>
                                                <span className="text-xs text-slate-500">{format(new Date(o.serviceDate), 'MMM d')}</span>
                                            </div>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">GH₵ {Number(o.amount).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="flex flex-wrap gap-2 py-4">
                    <Link href="/finance/tithe/new">
                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                            <HandCoins className="h-4 w-4 mr-2" />Record Tithe
                        </Button>
                    </Link>
                    <Link href="/finance/offering/new">
                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                            <Landmark className="h-4 w-4 mr-2" />Record Offering
                        </Button>
                    </Link>
                    <Link href="/finance/expense/new">
                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                            <Receipt className="h-4 w-4 mr-2" />Record Expense
                        </Button>
                    </Link>
                    <Link href="/reports">
                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                            <Wallet className="h-4 w-4 mr-2" />Reports
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value, trend, icon: Icon, highlight = false }: {
    title: string
    value: string
    trend: 'up' | 'down'
    icon: React.ElementType
    highlight?: boolean
}) {
    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                        <p className={`text-2xl font-semibold mt-1 ${highlight ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                            {value}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            {trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-amber-500" />
                            )}
                            <span className="text-xs text-slate-400">This month</span>
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
