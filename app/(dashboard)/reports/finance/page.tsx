import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowLeft, Download, TrendingUp, TrendingDown, HandCoins, Landmark, Receipt } from 'lucide-react'
import { getFinanceStats, getTithes, getOfferings, getExpenses } from '@/app/actions/finance'
import { format } from 'date-fns'

export default async function FinanceReportPage() {
    const [stats, { data: tithes }, { data: offerings }, { data: expenses }] = await Promise.all([
        getFinanceStats(),
        getTithes(1, 10),
        getOfferings(1, 10),
        getExpenses(1, 10),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/reports">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Financial Report</h1>
                        <p className="text-slate-500 dark:text-slate-400">Monthly summary</p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />Export PDF
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Tithes" value={`GH₵ ${stats.monthTithes.toLocaleString()}`} icon={HandCoins} />
                <StatCard title="Offerings" value={`GH₵ ${stats.monthOfferings.toLocaleString()}`} icon={Landmark} />
                <StatCard title="Expenses" value={`GH₵ ${stats.monthExpenses.toLocaleString()}`} icon={Receipt} />
                <StatCard
                    title="Net Income"
                    value={`GH₵ ${stats.monthNet.toLocaleString()}`}
                    icon={Wallet}
                    highlight={stats.monthNet >= 0}
                />
            </div>

            {/* Recent Transactions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Tithes */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <HandCoins className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <CardTitle className="text-base font-medium">Recent Tithes</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {tithes.length === 0 ? (
                            <p className="text-center text-slate-400 py-6">No tithes this month</p>
                        ) : (
                            <div className="space-y-2">
                                {tithes.slice(0, 5).map((t) => (
                                    <div key={t.id} className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{t.memberName}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(t.paymentDate), 'MMM d')}</p>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">GH₵ {Number(t.amount).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Offerings */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Landmark className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <CardTitle className="text-base font-medium">Recent Offerings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {offerings.length === 0 ? (
                            <p className="text-center text-slate-400 py-6">No offerings this month</p>
                        ) : (
                            <div className="space-y-2">
                                {offerings.slice(0, 5).map((o) => (
                                    <div key={o.id} className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{o.offeringType}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(o.serviceDate), 'MMM d')}</p>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">GH₵ {Number(o.amount).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, highlight = false }: {
    title: string
    value: string
    icon: React.ElementType
    highlight?: boolean
}) {
    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{title}</p>
                        <p className={`text-xl font-semibold mt-1 ${highlight ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                            {value}
                        </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
