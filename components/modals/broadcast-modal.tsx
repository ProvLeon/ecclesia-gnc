'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Radio,
    Loader2,
    Users,
    Check,
    Building2,
    Megaphone,
} from 'lucide-react'
import { sendBroadcast, getMembersForSMS, getSmsTemplates } from '@/app/actions/messages'
import { getDepartments } from '@/app/actions/departments'

interface BroadcastModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

type BroadcastType = 'all' | 'department' | 'status'

export function BroadcastModal({ trigger, onSuccess }: BroadcastModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [broadcastType, setBroadcastType] = useState<BroadcastType>('all')
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
    const [templates, setTemplates] = useState<{ id: string; name: string; content: string }[]>([])
    const [selectedDept, setSelectedDept] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState<{ sent: number } | null>(null)

    useEffect(() => {
        if (open) {
            getDepartments().then(setDepartments)
            getSmsTemplates().then((t) => setTemplates(t || []))
        }
    }, [open])

    function handleTemplateSelect(templateId: string) {
        setSelectedTemplate(templateId)
        const template = templates.find((t) => t.id === templateId)
        if (template) {
            setMessage(template.content)
        }
    }

    async function handleSend() {
        if (!message.trim()) return

        setSending(true)
        try {
            const res = await sendBroadcast({
                type: broadcastType,
                departmentId: broadcastType === 'department' ? selectedDept : undefined,
                memberStatus: broadcastType === 'status' ? selectedStatus : undefined,
                message,
            })
            if (res.success) {
                setSuccess({ sent: res.sent || 0 })
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
        setBroadcastType('all')
        setSelectedDept('')
        setSelectedStatus('')
        setSelectedTemplate('')
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
                        <Button variant="outline">
                            <Megaphone className="h-4 w-4 mr-2" />
                            Broadcast
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Broadcast Sent!</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            ✅ {success.sent} messages sent
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
                    <Button variant="outline">
                        <Megaphone className="h-4 w-4 mr-2" />
                        Broadcast
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0">
                <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Megaphone className="h-5 w-5 text-purple-500" />
                            Broadcast Message
                        </DialogTitle>
                        <DialogDescription>Send SMS to groups of members</DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-4 p-6">
                    {/* Audience Selection */}
                    <div className="space-y-3">
                        <Label>Send To</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <AudienceOption
                                selected={broadcastType === 'all'}
                                onClick={() => setBroadcastType('all')}
                                icon={Users}
                                label="All Members"
                            />
                            <AudienceOption
                                selected={broadcastType === 'department'}
                                onClick={() => setBroadcastType('department')}
                                icon={Building2}
                                label="Department"
                            />
                            <AudienceOption
                                selected={broadcastType === 'status'}
                                onClick={() => setBroadcastType('status')}
                                icon={Radio}
                                label="By Status"
                            />
                        </div>
                    </div>

                    {/* Department/Status Selection */}
                    {broadcastType === 'department' && (
                        <div className="space-y-2">
                            <Label>Select Department</Label>
                            <Select value={selectedDept} onValueChange={setSelectedDept}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {broadcastType === 'status' && (
                        <div className="space-y-2">
                            <Label>Select Member Status</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active Members</SelectItem>
                                    <SelectItem value="new_convert">New Converts</SelectItem>
                                    <SelectItem value="visitor">Visitors</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Template Selection */}
                    {templates.length > 0 && (
                        <div className="space-y-2">
                            <Label>Use Template (Optional)</Label>
                            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Message */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Message</Label>
                            <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
                                {charsRemaining} characters
                            </span>
                        </div>
                        <Textarea
                            placeholder="Type your broadcast message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className={`resize-none ${isOverLimit ? 'border-red-500' : ''}`}
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
                        disabled={sending || !message.trim() || isOverLimit ||
                            (broadcastType === 'department' && !selectedDept) ||
                            (broadcastType === 'status' && !selectedStatus)}
                        className="bg-linear-to-r from-purple-600 to-indigo-600"
                    >
                        {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Megaphone className="h-4 w-4 mr-2" />
                        Send Broadcast
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function AudienceOption({
    selected,
    onClick,
    icon: Icon,
    label,
}: {
    selected: boolean
    onClick: () => void
    icon: typeof Users
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${selected
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
        >
            <Icon className={`h-5 w-5 ${selected ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className={`text-xs font-medium ${selected ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600'}`}>
                {label}
            </span>
        </button>
    )
}
