'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { PlusCircle, Loader2, Landmark, Check, Search, User } from 'lucide-react'
import { recordOffering, getMembersForFinance } from '@/app/actions/finance'

const OFFERING_TYPES = [
    'Sunday Service', 'Thanksgiving', 'Special Offering', 'Harvest', 'Mission', 'Building Fund'
]

interface RecordOfferingModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function RecordOfferingModal({ trigger, onSuccess }: RecordOfferingModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<{ id: string; name: string; memberId: string }[]>([])
    const [amount, setAmount] = useState('')
    const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
    const [offeringType, setOfferingType] = useState('Sunday Service')
    const [paymentMethod, setPaymentMethod] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        if (open) {
            getMembersForFinance(debouncedSearch).then(setMembers)
        }
    }, [open, debouncedSearch])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!amount) return

        setLoading(true)
        await recordOffering({
            memberId: isAnonymous ? undefined : selectedMember?.id,
            amount: parseFloat(amount),
            serviceDate,
            offeringType,
            paymentMethod: paymentMethod || undefined,
            isAnonymous,
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
        setAmount('')
        setOfferingType('Sunday Service')
        setPaymentMethod('')
        setIsAnonymous(false)
        setSelectedMember(null)
        setSearch('')
        setSuccess(false)
    }

    function handleClose() {
        setOpen(false)
        resetForm()
    }

    if (success) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogTrigger asChild>{trigger || <Button><PlusCircle className="h-4 w-4 mr-2" />Record Offering</Button>}</DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Offering Recorded!</h3>
                        <p className="text-sm text-slate-500 mt-1">GH₵ {parseFloat(amount).toLocaleString()} - {offeringType}</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Record Offering</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-green-500" />
                        Record Offering
                    </DialogTitle>
                    <DialogDescription>Enter offering collection</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Amount & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Amount (GH₵)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg font-semibold"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Service Date</Label>
                            <Input
                                type="date"
                                value={serviceDate}
                                onChange={(e) => setServiceDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type & Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Offering Type</Label>
                            <Select value={offeringType} onValueChange={setOfferingType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OFFERING_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">💵 Cash</SelectItem>
                                    <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                                    <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Checkbox
                            id="anonymous"
                            checked={isAnonymous}
                            onCheckedChange={(c) => setIsAnonymous(c === true)}
                        />
                        <Label htmlFor="anonymous" className="cursor-pointer text-sm">
                            Anonymous offering
                        </Label>
                    </div>

                    {/* Member Selection (if not anonymous) */}
                    {!isAnonymous && (
                        <div className="space-y-1.5">
                            <Label>Member (Optional)</Label>

                            {!selectedMember ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search members..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="max-h-36 overflow-y-auto rounded-lg border divide-y dark:divide-slate-700">
                                        {members.map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setSelectedMember(m)}
                                                className="w-full p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                    <User className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{m.name}</p>
                                                    <p className="text-xs text-slate-500">{m.memberId}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-900 dark:text-blue-100">{selectedMember.name}</p>
                                            <p className="text-xs text-blue-600">{selectedMember.memberId}</p>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                                        Change
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading || !amount}
                            className="bg-linear-to-r from-green-600 to-green-700"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Record Offering
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
