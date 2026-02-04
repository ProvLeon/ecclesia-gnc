import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Users, TrendingUp, Plus, Calendar, Eye, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getServices, getAttendanceStats } from '@/app/actions/attendance'
import { format } from 'date-fns'

export default async function AttendancePage() {
    const [{ data: services }, stats] = await Promise.all([
        getServices({ pageSize: 10 }),
        getAttendanceStats(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track service attendance and participation</p>
                </div>
                <Link href="/attendance/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />New Service
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Last Sunday"
                    value={stats.lastSunday.toString()}
                    subtitle="Members attended"
                    icon={CalendarCheck}
                />
                <StatCard
                    title="Monthly Average"
                    value={stats.monthlyAverage.toString()}
                    subtitle="Per service"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Services This Month"
                    value={stats.servicesThisMonth.toString()}
                    subtitle="Recorded"
                    icon={Calendar}
                />
            </div>

            {/* Services List */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <CalendarCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">Recent Services</CardTitle>
                            <CardDescription>Attendance records from recent services</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {services.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No services recorded yet</p>
                            <p className="text-sm mt-1">Start by creating your first service</p>
                            <Link href="/attendance/new">
                                <Button className="mt-4" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />Create First Service
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    href={`/attendance/${service.id}`}
                                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                            <CalendarCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{service.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-slate-500">
                                                    {format(new Date(service.serviceDate), 'MMM d, yyyy')}
                                                    {service.serviceTime && ` at ${service.serviceTime}`}
                                                </span>
                                                <Badge variant="outline" className="text-xs py-0 h-5">{service.serviceType}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye className="h-4 w-4 mr-1" />View
                                        </Button>
                                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
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

function StatCard({ title, value, subtitle, icon: Icon }: {
    title: string
    value: string
    subtitle: string
    icon: React.ElementType
}) {
    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
