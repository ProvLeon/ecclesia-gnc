import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Users, TrendingUp, Plus, Calendar, Eye, ArrowRight, Activity, BarChart3, Search, Filter, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { getServices, getAttendanceStats } from '@/app/actions/attendance'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'

export default async function AttendancePage() {
  const [{ data: services }, stats] = await Promise.all([
    getServices({ pageSize: 10 }),
    getAttendanceStats(),
  ])

  return (
    <main className="min-h-screen space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Attendance</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2">Track service attendance and participation</p>
        </div>
        <Link href="/attendance/new" className="w-full sm:w-auto">
          <Button className="bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 dark:text-primary text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </Link>
      </div>

      {/* Stats Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Last Sunday"
          value={stats.lastSunday.toString()}
          subtitle="Members attended"
          icon={CalendarCheck}
          color="primary"
        />
        <StatCard
          title="Monthly Average"
          value={stats.monthlyAverage.toString()}
          subtitle="Per service"
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Services This Month"
          value={stats.servicesThisMonth.toString()}
          subtitle="Recorded"
          icon={BarChart3}
          color="slate"
        />
      </div>

      {/* Services List Card */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Activity className="h-5 w-5 text-primary dark:text-accent" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Services</CardTitle>
                <CardDescription className="text-xs">Attendance records from recent services</CardDescription>
              </div>
            </div>
            <Link href="/reports/attendance" className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full sm:w-auto">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          {services.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 w-fit mx-auto mb-4">
                <CalendarCheck className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-lg">No services recorded yet</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Start by creating your first service to track attendance</p>
              <Link href="/attendance/new" className="inline-block mt-6">
                <Button className="bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 dark:text-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Service
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/attendance/${service.id}`}
                  className="block group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 gap-3">
                    {/* Date Badge & Service Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Date Indicator */}
                      <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary dark:text-accent" />
                      </div>

                      {/* Service Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors text-sm sm:text-base">
                          {service.name}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            {format(new Date(service.serviceDate), 'MMM d, yyyy')}
                            {service.serviceTime && ` at ${service.serviceTime}`}
                          </span>
                          {service.serviceType && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                              <Badge className="bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent border-0 text-xs w-fit">
                                {service.serviceType}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Attendance & Action */}
                    <div className="flex items-center gap-2 justify-between sm:justify-end flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="h-4 w-4" />
                        <span className="text-xs sm:text-sm font-medium">
                          {/* Placeholder - replace with actual attendance count */}
                          0
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-primary dark:text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Attendance Insights</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Your average attendance rate is <span className="font-semibold text-primary dark:text-accent">{stats.monthlyAverage}</span> members per service this month. Keep tracking attendance to identify trends and celebrate growth.
              </p>
              <Link href="/reports/attendance" className="inline-block mt-4">
                <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700">
                  View Detailed Report <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color?: 'primary' | 'accent' | 'slate'
}

function StatCard({ title, value, subtitle, icon: Icon, color = 'slate' }: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary/10 dark:bg-primary/20',
      icon: 'text-primary dark:text-accent',
      border: 'border-primary/20 dark:border-accent/20'
    },
    accent: {
      bg: 'bg-accent/10 dark:bg-accent/20',
      icon: 'text-accent dark:text-accent',
      border: 'border-accent/20 dark:border-accent/20'
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      icon: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700'
    }
  }

  const colors = colorClasses[color]

  return (
    <Card className={`border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group overflow-hidden`}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
