'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Send, Loader2, MessageSquare, Search, Users } from 'lucide-react'
import { sendSMS, getMembersForSMS } from '@/app/actions/messages'

export default function ComposeMessagePage() {
    const router = useRouter()
    const [members, setMembers] = useState<{ id: string; name: string; phone: string | null; memberId: string }[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [result, setResult] = useState<{ success: boolean; sent?: number; failed?: number } | null>(null)

    useEffect(() => {
        getMembersForSMS({ status: 'active' }).then(setMembers)
    }, [])

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.phone && m.phone.includes(search)) ||
        m.memberId.toLowerCase().includes(search.toLowerCase())
    )

    function toggleMember(id: string) {
        const newSelected = new Set(selected)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelected(newSelected)
    }

    function selectAll() {
        setSelected(new Set(filteredMembers.map((m) => m.id)))
    }

    function clearSelection() {
        setSelected(new Set())
    }

    async function handleSend() {
        if (selected.size === 0 || !message.trim()) return

        setIsSending(true)
        setResult(null)

        const selectedMembers = members.filter((m) => selected.has(m.id) && m.phone)
        const recipients = selectedMembers.map((m) => ({ memberId: m.id, phone: m.phone! }))

        try {
            const res = await sendSMS({ recipients, message })
            setResult(res)
            if (res.success) {
                setTimeout(() => router.push('/messages'), 2000)
            }
        } catch {
            setResult({ success: false })
        } finally {
            setIsSending(false)
        }
    }

    const charsRemaining = 160 - message.length
    const isOverLimit = charsRemaining < 0

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/messages">
                    <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compose Message</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Send SMS to selected members</p>
                </div>
            </div>

            {result && (
                <div className={`p-4 rounded-xl ${result.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
                    {result.success
                        ? `✅ Sent ${result.sent} messages successfully${result.failed ? `, ${result.failed} failed` : ''}`
                        : '❌ Failed to send messages'}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recipients */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-slate-400" />
                                    Recipients
                                </CardTitle>
                                <CardDescription>{selected.size} selected</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                                <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-50 dark:bg-slate-900" />
                        </div>

                        <div className="h-80 overflow-y-auto border rounded-lg divide-y dark:divide-slate-700">
                            {filteredMembers.map((m) => (
                                <label key={m.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleMember(m.id)} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{m.name}</p>
                                        <p className="text-sm text-slate-500 truncate">{m.phone}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Message */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-slate-400" />
                            Message
                        </CardTitle>
                        <CardDescription>Compose your SMS (160 chars)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[200px] bg-slate-50 dark:bg-slate-900 text-base"
                            />
                            <div className={`text-sm text-right ${isOverLimit ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                                {isOverLimit ? `${Math.abs(charsRemaining)} over limit` : `${charsRemaining} characters remaining`}
                            </div>
                        </div>

                        {/* Preview */}
                        {message && (
                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                <p className="text-xs text-slate-500 mb-2">Preview</p>
                                <div className="bg-violet-600 text-white p-3 rounded-xl rounded-tl-none max-w-[80%]">
                                    <p className="text-sm">{message}</p>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleSend}
                            disabled={isSending || selected.size === 0 || !message.trim() || isOverLimit}
                            className="w-full bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
                        >
                            {isSending
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                                : <><Send className="mr-2 h-4 w-4" />Send to {selected.size} recipient{selected.size !== 1 ? 's' : ''}</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
