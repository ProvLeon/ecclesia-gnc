'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { completeFollowUp } from '@/app/actions/shepherding'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function CompleteFollowUpPage({ params }: PageProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [outcome, setOutcome] = useState('')
    const [notes, setNotes] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { id } = await params
            const result = await completeFollowUp(id, { outcome, notes })
            if (result.success) {
                router.push('/shepherding')
                router.refresh()
            } else {
                setError(result.error || 'Failed to complete follow-up')
            }
        } catch (err) {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <Link href="/shepherding">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Complete Follow-up</h1>
                    <p className="text-slate-500 dark:text-slate-400">Record the outcome of this pastoral visit</p>
                </div>
            </div>

            {/* Form */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">Visit Outcome</CardTitle>
                            <CardDescription>How did the follow-up go?</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="outcome">Outcome</Label>
                            <Select value={outcome} onValueChange={setOutcome} required>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="successful">Successful Visit</SelectItem>
                                    <SelectItem value="needs_followup">Needs Another Follow-up</SelectItem>
                                    <SelectItem value="not_home">Member Not Home</SelectItem>
                                    <SelectItem value="phone_call">Phone Call Made</SelectItem>
                                    <SelectItem value="referred">Referred to Pastor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about the visit..."
                                className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Link href="/shepherding" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={loading || !outcome} className="flex-1">
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Complete
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
