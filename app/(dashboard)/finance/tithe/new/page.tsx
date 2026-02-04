'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, HandCoins, Search } from 'lucide-react'
import { recordTithe, getMembersForFinance } from '@/app/actions/finance'

const schema = z.object({
    memberId: z.string().min(1, 'Select a member'),
    amount: z.string().min(1, 'Amount is required'),
    paymentDate: z.string().min(1, 'Date is required'),
    paymentMethod: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RecordTithePage() {
    const router = useRouter()
    const [members, setMembers] = useState<{ id: string; name: string; memberId: string }[]>([])
    const [search, setSearch] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { paymentDate: new Date().toISOString().split('T')[0] },
    })

    const selectedMemberId = watch('memberId')

    useEffect(() => {
        getMembersForFinance().then(setMembers)
    }, [])

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.memberId.toLowerCase().includes(search.toLowerCase())
    )

    async function onSubmit(data: FormData) {
        setIsSubmitting(true)
        setError(null)
        try {
            await recordTithe({
                memberId: data.memberId,
                amount: parseFloat(data.amount),
                paymentDate: data.paymentDate,
                paymentMethod: data.paymentMethod,
            })
            router.push('/finance')
        } catch {
            setError('Failed to record tithe')
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedMember = members.find((m) => m.id === selectedMemberId)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance">
                    <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Record Tithe</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Enter member tithe contribution</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Member Selection */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                                <HandCoins className="h-5 w-5" />
                            </div>
                            Select Member
                        </CardTitle>
                        <CardDescription>Choose the member paying tithe</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-50 dark:bg-slate-900"
                            />
                        </div>

                        {selectedMember && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="font-medium text-blue-900 dark:text-blue-100">{selectedMember.name}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">{selectedMember.memberId}</p>
                            </div>
                        )}

                        <div className="max-h-48 overflow-y-auto border rounded-lg divide-y dark:divide-slate-700">
                            {filteredMembers.slice(0, 20).map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setValue('memberId', m.id)}
                                    className={`w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedMemberId === m.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                >
                                    <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                                    <p className="text-sm text-slate-500">{m.memberId}</p>
                                </button>
                            ))}
                        </div>
                        {errors.memberId && <p className="text-sm text-red-500">{errors.memberId.message}</p>}
                    </CardContent>
                </Card>

                {/* Amount & Payment */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (GH₵) *</Label>
                            <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="0.00" className="bg-slate-50 dark:bg-slate-900 text-lg font-semibold" />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentDate">Date *</Label>
                            <Input id="paymentDate" type="date" {...register('paymentDate')} className="bg-slate-50 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label>Payment Method</Label>
                            <Select onValueChange={(v) => setValue('paymentMethod', v)}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">💵 Cash</SelectItem>
                                    <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                                    <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/finance">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Record Tithe</>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
