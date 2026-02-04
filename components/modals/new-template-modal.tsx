'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { PlusCircle, Loader2, Sparkles } from 'lucide-react'
import { createSmsTemplate } from '@/app/actions/messages'

const TEMPLATE_CATEGORIES = [
    { value: 'birthday', label: '🎂 Birthday' },
    { value: 'welcome', label: '👋 Welcome' },
    { value: 'reminder', label: '⏰ Reminder' },
    { value: 'event', label: '📅 Event' },
    { value: 'thanksgiving', label: '🙏 Thanksgiving' },
    { value: 'other', label: '📝 Other' },
]

const TEMPLATE_VARIABLES = [
    { key: '{name}', label: 'Member Name', description: 'Full name of the member' },
    { key: '{first_name}', label: 'First Name', description: 'Member\'s first name' },
    { key: '{church_name}', label: 'Church Name', description: 'Your church name' },
    { key: '{date}', label: 'Date', description: 'Current date' },
    { key: '{event_name}', label: 'Event Name', description: 'Name of the event' },
    { key: '{event_date}', label: 'Event Date', description: 'Date of the event' },
    { key: '{time}', label: 'Time', description: 'Event or service time' },
]

interface NewTemplateModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function NewTemplateModal({ trigger, onSuccess }: NewTemplateModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [content, setContent] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    function insertVariable(variable: string) {
        const textarea = textareaRef.current
        if (!textarea) {
            setContent(prev => prev + variable)
            return
        }

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.substring(0, start) + variable + content.substring(end)
        setContent(newContent)

        // Focus and set cursor position after the inserted variable
        setTimeout(() => {
            textarea.focus()
            const newPosition = start + variable.length
            textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || !category || !content.trim()) return

        setLoading(true)
        const result = await createSmsTemplate({ name, category, content })

        if (result.success) {
            setOpen(false)
            setName('')
            setCategory('')
            setContent('')
            router.refresh()
            onSuccess?.()
        }
        setLoading(false)
    }

    const charCount = content.length

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Template
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        Create Template
                    </DialogTitle>
                    <DialogDescription>
                        Create reusable SMS templates with dynamic variables
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Name & Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Birthday Wish"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEMPLATE_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Variables - Clickable chips */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">
                            Click to insert variable
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                            {TEMPLATE_VARIABLES.map((v) => (
                                <button
                                    key={v.key}
                                    type="button"
                                    onClick={() => insertVariable(v.key)}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                                    title={v.description}
                                >
                                    {v.key}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                        <Label htmlFor="content">Message Content</Label>
                        <Textarea
                            ref={textareaRef}
                            id="content"
                            placeholder="Type your message... Click variables above to insert them."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                            required
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{charCount > 160 ? `${Math.ceil(charCount / 160)} SMS parts` : 'Single SMS'}</span>
                            <span className={charCount > 160 ? 'text-amber-600' : ''}>
                                {charCount} / 160 characters
                            </span>
                        </div>
                    </div>

                    {/* Preview */}
                    {content && (
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-medium text-slate-500 mb-1">Preview</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                {content
                                    .replace('{name}', 'John Doe')
                                    .replace('{first_name}', 'John')
                                    .replace('{church_name}', 'GNC AG Ejisu')
                                    .replace('{date}', new Date().toLocaleDateString())
                                    .replace('{event_name}', 'Sunday Service')
                                    .replace('{event_date}', 'Feb 10, 2026')
                                    .replace('{time}', '9:00 AM')
                                }
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !name || !category || !content}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Template
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
