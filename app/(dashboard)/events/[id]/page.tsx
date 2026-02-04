import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Edit,
    Trash2
} from 'lucide-react'
import { getEvent } from '@/app/actions/events'
import { format } from 'date-fns'

const EVENT_TYPE_COLORS: Record<string, string> = {
    Conference: 'bg-purple-100 text-purple-700',
    Retreat: 'bg-blue-100 text-blue-700',
    Outreach: 'bg-green-100 text-green-700',
    Youth: 'bg-amber-100 text-amber-700',
    Training: 'bg-indigo-100 text-indigo-700',
    Other: 'bg-slate-100 text-slate-700',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
    const { id } = await params
    const event = await getEvent(id)

    if (!event) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/events">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {event.title}
                            </h1>
                            {event.eventType && (
                                <Badge
                                    variant="secondary"
                                    className={EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.Other}
                                >
                                    {event.eventType}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Event Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/events/${id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {event.description && (
                        <Card>
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Date & Time */}
                    <Card>
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date & Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Start Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    {event.startTime && (
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {event.startTime}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">End Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {format(new Date(event.endDate), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    {event.endTime && (
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {event.endTime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                    {/* Location */}
                    {event.location && (
                        <Card>
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                    <MapPin className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Location</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {event.location}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Department */}
                    {event.departmentName && (
                        <Card>
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                    <Users className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Department</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {event.departmentName}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Registration */}
                    {event.registrationRequired && (
                        <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium">Registration Required</span>
                                </div>
                                {event.maxAttendees && (
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                                        Max attendees: {event.maxAttendees}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
