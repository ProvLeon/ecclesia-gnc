'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { PlusCircle, Loader2, Receipt, Check } from 'lucide-react'
import { recordExpense } from '@/app/actions/finance'

const EXPENSE_CATEGORIES = [
    'Utilities', 'Maintenance', 'Supplies', 'Transport', 'Food & Refreshments',
    'Events', 'Equipment', 'Salaries', 'Rent', 'Outreach', 'Benevolence', 'Other'
]

interface RecordExpenseModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function RecordExpenseModal({ trigger, onSuccess }: RecordExpenseModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!category || !amount || !description) return

        setLoading(true)
        await recordExpense({
            category,
            amount: parseFloat(amount),
            description,
            expenseDate,
        })

        setSuccess(true)
        setTimeout(() => {
            setOpen(false)
            resetForm()
            router.refresh()
            onSuccess?.()
        }, 1200)
        setLoading(false)
    }

    function resetForm() {
        setCategory('')
        setAmount('')
        setDescription('')
        setSuccess(false)
    }

    function handleClose() {
        setOpen(false)
        resetForm()
    }

    if (success) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogTrigger asChild>{trigger || <Button variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Record Expense</Button>}</DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Check className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Recorded!</h3>
                        <p className="text-sm text-slate-500 mt-1">GH₵ {parseFloat(amount).toLocaleString()} - {category}</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Record Expense</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-amber-500" />
                        Record Expense
                    </DialogTitle>
                    <DialogDescription>Log church expenditure</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Category & Amount */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPENSE_CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Amount (GH₵)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg font-semibold"
                                required
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="What was this expense for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="resize-none"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading || !category || !amount || !description}
                            className="bg-linear-to-r from-amber-500 to-orange-500"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Record Expense
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
