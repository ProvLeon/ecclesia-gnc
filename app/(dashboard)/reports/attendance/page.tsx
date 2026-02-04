import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarCheck, ArrowLeft, Download, Users, TrendingUp } from 'lucide-react'
import { db } from '@/lib/db'
import { services, attendance } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'

async function getAttendanceReport() {
    const recentServices = await db
        .select({
            id: services.id,
            type: services.serviceType,
            date: services.serviceDate,
            attendeeCount: sql<number>`(SELECT COUNT(*) FROM attendance WHERE attendance.service_id = services.id)`,
        })
        .from(services)
        .orderBy(desc(services.serviceDate))
        .limit(10)

    const totalAttendance = recentServices.reduce((sum, s) => sum + Number(s.attendeeCount), 0)
    const avgAttendance = recentServices.length > 0 ? Math.round(totalAttendance / recentServices.length) : 0

    return { recentServices, totalAttendance, avgAttendance, serviceCount: recentServices.length }
}

export default async function AttendanceReportPage() {
    const { recentServices, totalAttendance, avgAttendance, serviceCount } = await getAttendanceReport()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/reports">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Attendance Report</h1>
                        <p className="text-slate-500 dark:text-slate-400">Service attendance summary</p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Attendance</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{totalAttendance}</p>
                                <p className="text-xs text-slate-400 mt-1">Last {serviceCount} services</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Users className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Average per Service</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{avgAttendance}</p>
                                <p className="text-xs text-slate-400 mt-1">Members</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <TrendingUp className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Services Tracked</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{serviceCount}</p>
                                <p className="text-xs text-slate-400 mt-1">Recent</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <CalendarCheck className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                            <CardDescription>Attendance by service</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {recentServices.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No services recorded yet</p>
                    ) : (
                        <div className="space-y-2">
                            {recentServices.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <div>
                                        <p className="font-medium text-sm text-slate-900 dark:text-white capitalize">{s.type} Service</p>
                                        <p className="text-xs text-slate-500">
                                            {s.date ? new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-900 dark:text-white">{s.attendeeCount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
