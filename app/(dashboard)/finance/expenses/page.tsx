import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PlusCircle,
    Receipt,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowLeft
} from 'lucide-react'
import { getExpenseStats, getExpensesByStatus } from '@/app/actions/finance'
import { ExpenseList } from './expense-list'

export default async function ExpensesPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>
}) {
    const params = await searchParams
    const status = (params.status as 'pending' | 'approved' | 'rejected') || 'pending'
    const page = parseInt(params.page || '1')

    const [stats, expenses] = await Promise.all([
        getExpenseStats(),
        getExpensesByStatus(status, page),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/finance">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Expense Management
                        </h1>
                        <p className="text-sm text-slate-500">
                            Review and approve expense requests
                        </p>
                    </div>
                </div>
                <Link href="/finance/expense/new">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Expense
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/finance/expenses?status=pending">
                    <Card className={`cursor-pointer transition-colors hover:border-amber-300 ${status === 'pending' ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.pending}
                                </p>
                                <p className="text-sm text-slate-500">Pending Approval</p>
                                <p className="text-xs text-amber-600 font-medium">
                                    GH₵ {stats.pendingAmount.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/expenses?status=approved">
                    <Card className={`cursor-pointer transition-colors hover:border-green-300 ${status === 'approved' ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.approved}
                                </p>
                                <p className="text-sm text-slate-500">Approved</p>
                                <p className="text-xs text-green-600 font-medium">
                                    GH₵ {stats.approvedAmount.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/expenses?status=rejected">
                    <Card className={`cursor-pointer transition-colors hover:border-red-300 ${status === 'rejected' ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.rejected}
                                </p>
                                <p className="text-sm text-slate-500">Rejected</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Expense List */}
            <Card>
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        {status.charAt(0).toUpperCase() + status.slice(1)} Expenses
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ExpenseList
                        expenses={expenses.data}
                        status={status}
                        pagination={expenses.pagination}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
