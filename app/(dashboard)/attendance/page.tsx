import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarCheck, Users, TrendingUp, Plus, Calendar, Eye } from 'lucide-react'
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track service attendance and member participation
                    </p>
                </div>
                <Link href="/attendance/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Service
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Last Sunday
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <CalendarCheck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lastSunday}</div>
                        <p className="text-xs text-slate-500 mt-1">Members attended</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Monthly Average
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.monthlyAverage}</div>
                        <p className="text-xs text-slate-500 mt-1">Per service</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Services This Month
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.servicesThisMonth}</div>
                        <p className="text-xs text-slate-500 mt-1">Recorded</p>
                    </CardContent>
                </Card>
            </div>

            {/* Services List */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Recent Services</CardTitle>
                    <CardDescription>Attendance records from recent services</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {services.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No services recorded yet</p>
                            <p className="text-sm mt-1">Start by creating your first service</p>
                            <Link href="/attendance/new">
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Service
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700">
                                    <TableHead>Service</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                    <TableRow key={service.id} className="border-slate-200 dark:border-slate-700">
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-white">{service.name}</div>
                                            {service.location && (
                                                <div className="text-sm text-slate-500">{service.location}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">
                                            {format(new Date(service.serviceDate), 'MMM d, yyyy')}
                                            {service.serviceTime && ` at ${service.serviceTime}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {service.serviceType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/attendance/${service.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
