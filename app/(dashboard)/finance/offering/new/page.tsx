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
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, Loader2, Landmark } from 'lucide-react'
import { recordOffering, getMembersForFinance } from '@/app/actions/finance'

const schema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    serviceDate: z.string().min(1, 'Date is required'),
    offeringType: z.string().min(1, 'Type is required'),
    paymentMethod: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    memberId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RecordOfferingPage() {
    const router = useRouter()
    const [members, setMembers] = useState<{ id: string; name: string }[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            serviceDate: new Date().toISOString().split('T')[0],
            offeringType: 'Sunday Service',
            isAnonymous: false,
        },
    })

    const isAnonymous = watch('isAnonymous')

    useEffect(() => {
        getMembersForFinance().then(setMembers)
    }, [])

    async function onSubmit(data: FormData) {
        setIsSubmitting(true)
        setError(null)
        try {
            await recordOffering({
                memberId: data.isAnonymous ? undefined : data.memberId,
                amount: parseFloat(data.amount),
                serviceDate: data.serviceDate,
                offeringType: data.offeringType,
                paymentMethod: data.paymentMethod,
                isAnonymous: data.isAnonymous,
            })
            router.push('/finance')
        } catch {
            setError('Failed to record offering')
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Record Offering</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Enter offering collection</p>
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
                            <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
                                <Landmark className="h-5 w-5" />
                            </div>
                            Offering Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (GH₵) *</Label>
                            <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="0.00" className="bg-slate-50 dark:bg-slate-900 text-lg font-semibold" />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceDate">Service Date *</Label>
                            <Input id="serviceDate" type="date" {...register('serviceDate')} className="bg-slate-50 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2">
                            <Label>Offering Type *</Label>
                            <Select defaultValue="Sunday Service" onValueChange={(v) => setValue('offeringType', v)}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                                    <SelectItem value="Thanksgiving">Thanksgiving</SelectItem>
                                    <SelectItem value="Special Offering">Special Offering</SelectItem>
                                    <SelectItem value="Harvest">Harvest</SelectItem>
                                    <SelectItem value="Mission">Mission</SelectItem>
                                    <SelectItem value="Building Fund">Building Fund</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
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

                        <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <Checkbox id="isAnonymous" checked={isAnonymous} onCheckedChange={(c) => setValue('isAnonymous', c === true)} />
                            <Label htmlFor="isAnonymous" className="cursor-pointer">Anonymous offering (don't record member name)</Label>
                        </div>

                        {!isAnonymous && (
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Member (Optional)</Label>
                                <Select onValueChange={(v) => setValue('memberId', v)}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/finance">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Record Offering</>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
