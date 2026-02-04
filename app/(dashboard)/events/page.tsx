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
  CalendarCheck,
  ChevronRight,
  Users,
  ArrowRight
} from 'lucide-react'
import { getEvents, getEventStats } from '@/app/actions/events'
import { format } from 'date-fns'
import { NewEventModal } from '@/components/modals'

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Conference: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  },
  Retreat: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  },
  Outreach: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  },
  Youth: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
  },
  Training: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
  },
  Other: {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  },
}

export default async function EventsPage() {
  const [eventsData, stats] = await Promise.all([
    getEvents({ upcoming: true }),
    getEventStats(),
  ])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Events</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Church events and activities</p>
        </div>
        <NewEventModal />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Events"
          value={stats.total.toString()}
          subtitle="All time"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming.toString()}
          subtitle="Next events"
          icon={CalendarDays}
          color="green"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth.toString()}
          subtitle="Current period"
          icon={CalendarCheck}
          color="purple"
        />
      </div>

      {/* Events List */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Scheduled activities and gatherings</p>
              </div>
            </div>
            <Link href="/reports/events">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1.5" />
                Calendar
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {eventsData.data.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 w-fit mx-auto mb-4">
                <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No upcoming events
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Create your first event to get started
              </p>
              <NewEventModal
                trigger={
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {eventsData.data.map((event) => {
                const colors = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.Other
                const eventDate = new Date(event.startDate)
                const today = new Date()
                const isUpcoming = eventDate > today

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <div className="p-5 flex items-start gap-4">
                      {/* Date Badge */}
                      <div className={`flex-shrink-0 p-3 rounded-lg text-center min-w-fit border ${colors.border} ${colors.icon}`}>
                        <div className="text-xs font-semibold uppercase">
                          {format(eventDate, 'MMM')}
                        </div>
                        <div className="text-2xl font-bold">
                          {format(eventDate, 'd')}
                        </div>
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-base
 font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {event.title}
                          </h3>
                          {event.eventType && (
                            <Badge
                              variant="outline"
                              className={`${colors.bg} ${colors.text} border ${colors.border} text-xs`}
                            >
                              {event.eventType}
                            </Badge>
                          )}
                          {isUpcoming && (
                            <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 text-xs">
                              Upcoming
                            </Badge>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                            {event.description}
                          </p>
                        )}

                        {/* Event Details */}
                        <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500 dark:text-slate-400">
                          {event.startTime && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              {event.startTime}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              {event.location}
                            </span>
                          )}
                          {event.departmentName && (
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              {event.departmentName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          asChild
                        >
                          <span>View</span>
                        </Button>
                        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Types Legend */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/20 dark:to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0">
              <PlusCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white mb-3">Event Types</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(EVENT_TYPE_COLORS).map(([type, colors]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.icon.split(' ')[0]}`} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue'
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color?: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      accent: 'from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      accent: 'from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-900/20'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      accent: 'from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/20'
    }
  }

  const colors = colorClasses[color]

  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className
            ="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
