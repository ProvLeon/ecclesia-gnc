import { db } from '@/lib/db'
import { members, tithes, attendance, services } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Wallet, User, Phone, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function MemberPortalPage({ params }: PageProps) {
    const { token } = await params

    // Validate Token
    const member = await db.query.members.findFirst({
        where: eq(members.portalToken, token),
        with: {
            departments: {
                with: {
                    department: true
                }
            }
        }
    })

    if (!member) {
        notFound()
    }

    // Fetch Contribution History
    const contributions = await db.select()
        .from(tithes)
        .where(eq(tithes.memberId, member.id))
        .orderBy(desc(tithes.paymentDate))
        .limit(5)

    // Fetch Attendance History
    const attendanceRecords = await db.select({
        checkedInAt: attendance.checkedInAt,
        serviceName: services.name,
        serviceDate: services.serviceDate
    })
        .from(attendance)
        .leftJoin(services, eq(attendance.serviceId, services.id))
        .where(eq(attendance.memberId, member.id))
        .orderBy(desc(attendance.checkedInAt))
        .limit(5)


    return (
        <div className="space-y-6">
            {/* Profile Overview */}
            <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10" />
                <CardContent className="pt-0 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-4">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                            <AvatarImage src={member.photoUrl || ''} />
                            <AvatarFallback className="text-2xl bg-slate-100 dark:bg-slate-800">
                                {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left flex-1 min-w-0 pb-1">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {member.firstName} {member.lastName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-slate-500">
                                <Badge variant="secondary" className="capitalize">
                                    {member.memberStatus.replace('_', ' ')}
                                </Badge>
                                {member.departments.map(md => (
                                    <Badge key={md.departmentId} variant="outline">
                                        {md.department.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 opacity-70" />
                            <span>{member.phonePrimary}</span>
                        </div>
                        {member.email && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 opacity-70" />
                                <span>{member.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 opacity-70" />
                            <span>{member.region}, {member.city || 'Ejisu'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Contributions */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Wallet className="h-5 w-5 text-emerald-600" />
                            Recent Giving
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contributions.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No recent contributions recorded.</p>
                        ) : (
                            <div className="space-y-4">
                                {contributions.map((t) => (
                                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">GH₵ {t.amount}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(t.paymentDate), 'MMM d, yyyy')}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{t.category?.replace('_', ' ') || 'Tithe'}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Attendance */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Attendance History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {attendanceRecords.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No attendance records found.</p>
                        ) : (
                            <div className="space-y-4">
                                {attendanceRecords.map((a, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{a.serviceName}</p>
                                            <p className="text-xs text-slate-500">{a.serviceDate ? format(new Date(a.serviceDate), 'MMM d, yyyy') : 'Unknown Date'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                            <Clock className="h-3 w-3" />
                                            Present
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
