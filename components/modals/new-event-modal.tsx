'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { PlusCircle, Loader2, Calendar, Check } from 'lucide-react'
import { createEvent } from '@/app/actions/events'
import { getDepartments } from '@/app/actions/departments'

const EVENT_TYPES = [
    { value: 'Conference', label: '🎤 Conference' },
    { value: 'Retreat', label: '🏕️ Retreat' },
    { value: 'Outreach', label: '🤝 Outreach' },
    { value: 'Youth', label: '👥 Youth' },
    { value: 'Training', label: '📚 Training' },
    { value: 'Other', label: '📅 Other' },
]

interface NewEventModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function NewEventModal({ trigger, onSuccess }: NewEventModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [eventType, setEventType] = useState('')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            getDepartments().then(setDepartments)
        }
    }, [open])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !startDate || !endDate) return

        setLoading(true)
        await createEvent({
            title,
            description: description || undefined,
            eventType: eventType || undefined,
            startDate,
            endDate,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            location: location || undefined,
            departmentId: departmentId || undefined,
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
        setTitle('')
        setDescription('')
        setEventType('')
        setStartTime('')
        setEndTime('')
        setLocation('')
        setDepartmentId('')
        setSuccess(false)
    }

    function handleClose() {
        setOpen(false)
        resetForm()
    }

    if (success) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogTrigger asChild>{trigger || <Button><PlusCircle className="h-4 w-4 mr-2" />New Event</Button>}</DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Check className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Event Created!</h3>
                        <p className="text-sm text-slate-500 mt-1">{title}</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                {trigger || <Button><PlusCircle className="h-4 w-4 mr-2" />New Event</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        Create Event
                    </DialogTitle>
                    <DialogDescription>Schedule a new church event</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Title & Type */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1.5">
                            <Label>Event Title</Label>
                            <Input
                                placeholder="e.g., Youth Conference 2026"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Type</Label>
                            <Select value={eventType} onValueChange={setEventType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value)
                                    if (endDate < e.target.value) setEndDate(e.target.value)
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                required
                            />
                        </div>
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Location & Department */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Location</Label>
                            <Input
                                placeholder="e.g., Main Auditorium"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Department</Label>
                            <Select value={departmentId} onValueChange={setDepartmentId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            placeholder="Event details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading || !title}
                            className="bg-linear-to-r from-purple-600 to-indigo-600"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Event
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
