'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Send,
    Loader2,
    Search,
    Users,
    Check,
    MessageSquare,
    X,
} from 'lucide-react'
import { sendSMS, getMembersForSMS } from '@/app/actions/messages'

interface ComposeMessageModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
    defaultRecipients?: { id: string; name: string; phone: string }[]
}

export function ComposeMessageModal({ trigger, onSuccess, defaultRecipients }: ComposeMessageModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [members, setMembers] = useState<{ id: string; name: string; phone: string; memberId: string }[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<Map<string, { name: string; phone: string }>>(new Map())
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState<{ sent: number; failed: number } | null>(null)

    useEffect(() => {
        if (open) {
            getMembersForSMS({ status: 'active' }).then(setMembers)
            if (defaultRecipients) {
                const map = new Map<string, { name: string; phone: string }>()
                defaultRecipients.forEach((r) => map.set(r.id, { name: r.name, phone: r.phone }))
                setSelected(map)
            }
        }
    }, [open, defaultRecipients])

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    )

    function toggleMember(member: typeof members[0]) {
        const newSelected = new Map(selected)
        if (newSelected.has(member.id)) {
            newSelected.delete(member.id)
        } else {
            newSelected.set(member.id, { name: member.name, phone: member.phone })
        }
        setSelected(newSelected)
    }

    function removeRecipient(id: string) {
        const newSelected = new Map(selected)
        newSelected.delete(id)
        setSelected(newSelected)
    }

    async function handleSend() {
        if (selected.size === 0 || !message.trim()) return

        setSending(true)
        const recipients = Array.from(selected.entries()).map(([id, data]) => ({
            memberId: id,
            phone: data.phone,
        }))

        try {
            const res = await sendSMS({ recipients, message })
            if (res.success) {
                setSuccess({ sent: res.sent || 0, failed: res.failed || 0 })
                setTimeout(() => {
                    setOpen(false)
                    resetForm()
                    router.refresh()
                    onSuccess?.()
                }, 2000)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSending(false)
        }
    }

    function resetForm() {
        setSearch('')
        setSelected(new Map())
        setMessage('')
        setSuccess(null)
    }

    function handleClose() {
        setOpen(false)
        resetForm()
    }

    const charsRemaining = 160 - message.length
    const isOverLimit = charsRemaining < 0

    if (success) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Compose
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Messages Sent!</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            ✅ {success.sent} sent
                            {success.failed > 0 && ` · ❌ ${success.failed} failed`}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Compose
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            Compose Message
                        </DialogTitle>
                        <DialogDescription>Send SMS to church members</DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 p-6">
                    {/* Selected Recipients */}
                    {selected.size > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {Array.from(selected.entries()).map(([id, data]) => (
                                <Badge
                                    key={id}
                                    variant="secondary"
                                    className="pl-2 pr-1 py-1 flex items-center gap-1"
                                >
                                    {data.name}
                                    <button
                                        onClick={() => removeRecipient(id)}
                                        className="ml-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Member Search */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Recipients ({selected.size})
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <ScrollArea className="h-32 border rounded-lg">
                            <div className="divide-y">
                                {filteredMembers.slice(0, 20).map((member) => (
                                    <div
                                        key={member.id}
                                        onClick={() => toggleMember(member)}
                                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                    >
                                        <Checkbox checked={selected.has(member.id)} />
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {member.name.split(' ').map((n) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.phone}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Message</Label>
                            <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
                                {charsRemaining} characters
                            </span>
                        </div>
                        <Textarea
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className={`resize-none ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || selected.size === 0 || !message.trim() || isOverLimit}
                        className="bg-linear-to-r from-blue-600 to-indigo-600"
                    >
                        {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Send className="h-4 w-4 mr-2" />
                        Send to {selected.size}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
