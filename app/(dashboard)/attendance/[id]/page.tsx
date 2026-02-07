import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getService, getServiceAttendance, getMembersForAttendance } from '@/app/actions/attendance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Users, Plus, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { AttendanceRecorder } from './attendance-recorder'
import { getCurrentUserWithRole, getScopedMemberIds } from '@/lib/auth/proxy'
import { redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ServiceAttendancePage({ params }: PageProps) {
    const user = await getCurrentUserWithRole()
    if (!user) redirect('/login')

    const scopedMemberIds = await getScopedMemberIds(user.id, user.role)

    const { id } = await params
    const [service, attendees, allMembers] = await Promise.all([
        getService(id),
        getServiceAttendance(id),
        getMembersForAttendance(scopedMemberIds),
    ])

    if (!service) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/attendance">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{service.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {format(new Date(service.serviceDate), 'EEEE, MMMM d, yyyy')}
                            {service.serviceTime && ` at ${service.serviceTime}`}
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {service.serviceType}
                </Badge>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{attendees.length}</p>
                                <p className="text-sm text-slate-500">Total Attendance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Record Attendance */}
            <AttendanceRecorder serviceId={id} members={allMembers} existingAttendees={attendees.map(a => a.memberId)} />

            {/* Attendees List */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Attendees</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {attendees.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>No attendance recorded yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Check-in Time</TableHead>
                                    <TableHead>Method</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendees.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-mono text-sm">{a.memberMemberId}</TableCell>
                                        <TableCell className="font-medium">{a.memberName}</TableCell>
                                        <TableCell className="text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(a.checkedInAt), 'h:mm a')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{a.checkInMethod}</Badge>
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
