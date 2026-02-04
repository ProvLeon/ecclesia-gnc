'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, Receipt } from 'lucide-react'
import { recordExpense } from '@/app/actions/finance'

const schema = z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.string().min(1, 'Amount is required'),
    description: z.string().min(1, 'Description is required'),
    expenseDate: z.string().min(1, 'Date is required'),
})

type FormData = z.infer<typeof schema>

const expenseCategories = [
    'Utilities', 'Maintenance', 'Supplies', 'Transport', 'Food & Refreshments',
    'Events', 'Equipment', 'Salaries', 'Rent', 'Outreach', 'Benevolence', 'Other'
]

export default function RecordExpensePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { expenseDate: new Date().toISOString().split('T')[0] },
    })

    async function onSubmit(data: FormData) {
        setIsSubmitting(true)
        setError(null)
        try {
            await recordExpense({
                category: data.category,
                amount: parseFloat(data.amount),
                description: data.description,
                expenseDate: data.expenseDate,
            })
            router.push('/finance')
        } catch {
            setError('Failed to record expense')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance">
                    <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Record Expense</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Log church expenditure</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30">
                                <Receipt className="h-5 w-5" />
                            </div>
                            Expense Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select onValueChange={(v) => setValue('category', v)}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (GH₵) *</Label>
                            <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="0.00" className="bg-slate-50 dark:bg-slate-900 text-lg font-semibold" />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expenseDate">Date *</Label>
                            <Input id="expenseDate" type="date" {...register('expenseDate')} className="bg-slate-50 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" {...register('description')} placeholder="What was this expense for?" className="bg-slate-50 dark:bg-slate-900" rows={3} />
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/finance">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Record Expense</>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
