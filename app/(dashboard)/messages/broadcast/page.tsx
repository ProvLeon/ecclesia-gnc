'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, Send, Users, Loader2, MessageSquare } from 'lucide-react'
import { sendBroadcast } from '@/app/actions/messages'

export default function BroadcastPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [recipientType, setRecipientType] = useState('all')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const charCount = message.length
    const maxChars = 160

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!message.trim()) return

        setLoading(true)
        setError('')

        try {
            const result = await sendBroadcast({ message, recipientType })
            if (result.success) {
                setSuccess(true)
                setTimeout(() => router.push('/messages'), 2000)
            } else {
                setError(result.error || 'Failed to send broadcast')
            }
        } catch (err) {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="py-12 text-center">
                        <div className="p-4 rounded-full bg-green-50 dark:bg-green-900/30 w-fit mx-auto mb-4">
                            <Send className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Broadcast Sent!</h2>
                        <p className="text-slate-500 mt-2">Your message is being delivered to all recipients.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <Link href="/messages">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Broadcast Message</h1>
                    <p className="text-slate-500 dark:text-slate-400">Send SMS to groups or all members</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipients */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium">Recipients</CardTitle>
                                <CardDescription>Who should receive this message?</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={recipientType} onValueChange={setRecipientType} className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <RadioGroupItem value="all" id="all" />
                                <Label htmlFor="all" className="flex-1 cursor-pointer">
                                    <span className="font-medium">All Members</span>
                                    <p className="text-sm text-slate-500">Send to everyone with a phone number</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <RadioGroupItem value="active" id="active" />
                                <Label htmlFor="active" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Active Members Only</span>
                                    <p className="text-sm text-slate-500">Members with active status</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <RadioGroupItem value="leaders" id="leaders" />
                                <Label htmlFor="leaders" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Department Leaders</span>
                                    <p className="text-sm text-slate-500">All department leaders</p>
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Message */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium">Message</CardTitle>
                                <CardDescription>Keep it under 160 characters for a single SMS</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>{charCount > maxChars ? `${Math.ceil(charCount / maxChars)} SMS parts` : 'Single SMS'}</span>
                            <span className={charCount > maxChars ? 'text-amber-600' : ''}>{charCount} characters</span>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Link href="/messages" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading || !message.trim()} className="flex-1">
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Send className="h-4 w-4 mr-2" />
                        Send Broadcast
                    </Button>
                </div>
            </form>
        </div>
    )
}
