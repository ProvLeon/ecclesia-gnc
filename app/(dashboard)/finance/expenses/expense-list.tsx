'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { approveExpense, rejectExpense } from '@/app/actions/finance'
import { useRouter } from 'next/navigation'

interface Expense {
    id: string
    category: string
    amount: string
    description: string
    expenseDate: string
    status: 'pending' | 'approved' | 'rejected'
    receiptUrl?: string | null
    createdAt: Date
}

interface ExpenseListProps {
    expenses: Expense[]
    status: 'pending' | 'approved' | 'rejected'
    pagination: {
        page: number
        pageSize: number
        total: number
    }
}

export function ExpenseList({ expenses, status, pagination }: ExpenseListProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    async function handleApprove(id: string) {
        setLoading(id)
        await approveExpense(id)
        setLoading(null)
        router.refresh()
    }

    async function handleReject(id: string) {
        setLoading(id)
        await rejectExpense(id)
        setLoading(null)
        router.refresh()
    }

    if (expenses.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                No {status} expenses found
            </div>
        )
    }

    return (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {expenses.map((expense) => (
                <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                                {expense.category}
                            </h3>
                            <Badge
                                variant={
                                    expense.status === 'approved' ? 'default' :
                                        expense.status === 'rejected' ? 'destructive' :
                                            'secondary'
                                }
                                className={
                                    expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        expense.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                }
                            >
                                {expense.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {expense.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(expense.expenseDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                GH₵ {Number(expense.amount).toLocaleString()}
                            </p>
                        </div>

                        {status === 'pending' && (
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApprove(expense.id)}
                                    disabled={loading === expense.id}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                    {loading === expense.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(expense.id)}
                                    disabled={loading === expense.id}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
                <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">
                        Showing {expenses.length} of {pagination.total} expenses
                    </p>
                    <div className="flex gap-2">
                        {pagination.page > 1 && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/finance/expenses?status=${status}&page=${pagination.page - 1}`}>
                                    Previous
                                </a>
                            </Button>
                        )}
                        {pagination.page * pagination.pageSize < pagination.total && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/finance/expenses?status=${status}&page=${pagination.page + 1}`}>
                                    Next
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
