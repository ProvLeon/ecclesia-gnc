import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, FileText } from 'lucide-react'
import Link from 'next/link'

export default function FinancePage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage tithes, offerings, and expenses
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/finance/tithes/new">
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Record Tithe
                        </Button>
                    </Link>
                    <Link href="/finance/offerings/new">
                        <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Record Offering
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Tithes (Month)
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">GH₵ 0.00</div>
                        <p className="text-xs text-slate-500 mt-1">From 0 contributors</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Offerings (Month)
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">GH₵ 0.00</div>
                        <p className="text-xs text-slate-500 mt-1">Across all services</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Expenses (Month)
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            <TrendingDown className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">GH₵ 0.00</div>
                        <p className="text-xs text-slate-500 mt-1">0 transactions</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Net Balance
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">GH₵ 0.00</div>
                        <p className="text-xs text-slate-500 mt-1">Income - Expenses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <Link href="/finance/tithes">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Tithes</CardTitle>
                                    <CardDescription>View and manage member tithes</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <Link href="/finance/offerings">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Offerings</CardTitle>
                                    <CardDescription>Service and special offerings</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <Link href="/finance/expenses">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Expenses</CardTitle>
                                    <CardDescription>Track church expenditures</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>
            </div>
        </div>
    )
}
