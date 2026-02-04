'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { createSmsTemplate } from '@/app/actions/messages'

const CATEGORIES = [
    { value: 'reminder', label: 'Service Reminder' },
    { value: 'birthday', label: 'Birthday Wishes' },
    { value: 'event', label: 'Event Announcement' },
    { value: 'general', label: 'General' },
]

export default function NewTemplatePage() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [content, setContent] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name || !category || !content) return

        setLoading(true)
        const result = await createSmsTemplate({ name, category, content })

        if (result.success) {
            router.push('/messages/templates')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <Link href="/messages/templates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Create Template
                    </h1>
                    <p className="text-sm text-slate-500">
                        Create a new reusable SMS template
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <CardTitle>Template Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Sunday Reminder"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Message Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Type your message here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={5}
                                required
                            />
                            <p className="text-xs text-slate-500">
                                You can use placeholders like {'{name}'}, {'{date}'}, {'{time}'} which will be replaced when sending
                            </p>
                            <p className="text-xs text-slate-400">
                                {content.length} characters
                            </p>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/messages/templates">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Template
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
