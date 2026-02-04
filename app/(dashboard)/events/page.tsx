import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PlusCircle,
    Calendar,
    MapPin,
    Clock,
    CalendarDays,
    CalendarCheck
} from 'lucide-react'
import { getEvents, getEventStats } from '@/app/actions/events'

const EVENT_TYPE_COLORS: Record<string, string> = {
    Conference: 'bg-purple-100 text-purple-700',
    Retreat: 'bg-blue-100 text-blue-700',
    Outreach: 'bg-green-100 text-green-700',
    Youth: 'bg-amber-100 text-amber-700',
    Training: 'bg-indigo-100 text-indigo-700',
    Other: 'bg-slate-100 text-slate-700',
}

export default async function EventsPage() {
    const [eventsData, stats] = await Promise.all([
        getEvents({ upcoming: true }),
        getEventStats(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Events
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Church events and activities
                    </p>
                </div>
                <Link href="/events/new">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-slate-500">Total Events</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <CalendarDays className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.upcoming}</p>
                            <p className="text-sm text-slate-500">Upcoming</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <CalendarCheck className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.thisMonth}</p>
                            <p className="text-sm text-slate-500">This Month</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Events List */}
            <Card>
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {eventsData.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                No upcoming events
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Create your first event to get started
                            </p>
                            <Link href="/events/new">
                                <Button variant="outline">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Create Event
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {eventsData.data.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            {/* Date Box */}
                                            <div className="w-14 text-center">
                                                <div className="text-xs font-medium text-indigo-600 uppercase">
                                                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                                                </div>
                                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {new Date(event.startDate).getDate()}
                                                </div>
                                            </div>

                                            {/* Event Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                                        {event.title}
                                                    </h3>
                                                    {event.eventType && (
                                                        <Badge
                                                            variant="secondary"
                                                            className={EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.Other}
                                                        >
                                                            {event.eventType}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {event.description && (
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                        {event.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                    {event.startTime && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {event.startTime}
                                                        </span>
                                                    )}
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                    {event.departmentName && (
                                                        <span>{event.departmentName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
