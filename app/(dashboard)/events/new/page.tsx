'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, Calendar } from 'lucide-react'
import { createEvent } from '@/app/actions/events'

const EVENT_TYPES = [
    'Conference',
    'Retreat',
    'Outreach',
    'Youth',
    'Training',
    'Worship Night',
    'Fellowship',
    'Other',
]

export default function NewEventPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        registrationRequired: false,
        maxAttendees: '',
    })
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.title || !formData.startDate || !formData.endDate) return

        setLoading(true)
        const result = await createEvent({
            ...formData,
            maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        })

        if (result.success) {
            router.push('/events')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <Link href="/events">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Create Event
                    </h1>
                    <p className="text-sm text-slate-500">
                        Add a new church event
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Event Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Title & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Annual Youth Conference"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventType">Event Type</Label>
                                <Select
                                    value={formData.eventType}
                                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVENT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Event description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date *</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., Main Auditorium"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        {/* Registration */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    Require Registration
                                </p>
                                <p className="text-sm text-slate-500">
                                    Members must register to attend this event
                                </p>
                            </div>
                            <Switch
                                checked={formData.registrationRequired}
                                onCheckedChange={(checked) => setFormData({ ...formData, registrationRequired: checked })}
                            />
                        </div>

                        {formData.registrationRequired && (
                            <div className="space-y-2">
                                <Label htmlFor="maxAttendees">Max Attendees</Label>
                                <Input
                                    id="maxAttendees"
                                    type="number"
                                    placeholder="Leave empty for unlimited"
                                    value={formData.maxAttendees}
                                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Link href="/events">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Create Event
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
