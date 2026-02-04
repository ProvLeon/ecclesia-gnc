import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Wallet, CalendarCheck, TrendingUp, Heart, Building2, MessageSquare, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { members, tithes, services, attendance, followUps } from '@/lib/db/schema'
import { eq, sql, gte, desc } from 'drizzle-orm'

async function getDashboardStats() {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const lastSunday = new Date(today)
    lastSunday.setDate(today.getDate() - today.getDay())
    const lastSundayStr = lastSunday.toISOString().split('T')[0]

    const [totalMembers] = await db.select({ count: sql<number>`count(*)` }).from(members).where(eq(members.memberStatus, 'active'))
    const [monthTithes] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(tithes).where(gte(tithes.paymentDate, startOfMonth))

    const [lastService] = await db.select({ id: services.id }).from(services).where(eq(services.serviceDate, lastSundayStr)).limit(1)
    let sundayAttendance = 0
    if (lastService) {
        const [att] = await db.select({ count: sql<number>`count(*)` }).from(attendance).where(eq(attendance.serviceId, lastService.id))
        sundayAttendance = Number(att?.count || 0)
    }

    const [newMembers] = await db.select({ count: sql<number>`count(*)` }).from(members).where(gte(members.joinDate, startOfMonth))
    const [pendingFollowups] = await db.select({ count: sql<number>`count(*)` }).from(followUps).where(eq(followUps.status, 'scheduled'))

    return {
        totalMembers: Number(totalMembers?.count || 0),
        monthTithes: Number(monthTithes?.total || 0),
        sundayAttendance,
        newMembers: Number(newMembers?.count || 0),
        pendingFollowups: Number(pendingFollowups?.count || 0),
    }
}

async function getRecentMembers() {
    return db
        .select({
            id: members.id,
            name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
            joinDate: members.joinDate,
        })
        .from(members)
        .orderBy(desc(members.createdAt))
        .limit(5)
}

export default async function DashboardPage() {
    const [stats, recentMembers] = await Promise.all([
        getDashboardStats(),
        getRecentMembers(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back to Ecclesia — GNC AG Ejisu</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Members"
                    value={stats.totalMembers.toLocaleString()}
                    subtitle="Active members"
                    icon={Users}
                />
                <StatCard
                    title="This Month's Tithes"
                    value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
                    subtitle="Collected"
                    icon={Wallet}
                />
                <StatCard
                    title="Last Sunday"
                    value={stats.sundayAttendance.toString()}
                    subtitle="Attendance"
                    icon={CalendarCheck}
                />
                <StatCard
                    title="New Members"
                    value={stats.newMembers.toString()}
                    subtitle="This month"
                    icon={TrendingUp}
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        <QuickAction icon={Users} label="Add Member" href="/members/new" />
                        <QuickAction icon={Wallet} label="Record Tithe" href="/finance/tithe/new" />
                        <QuickAction icon={CalendarCheck} label="New Service" href="/attendance/new" />
                        <QuickAction icon={MessageSquare} label="Send SMS" href="/messages/compose" />
                        <QuickAction icon={Heart} label="Schedule Visit" href="/shepherding/new" />
                        <QuickAction icon={Building2} label="Departments" href="/departments" />
                    </CardContent>
                </Card>

                {/* Recent Members */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base font-medium">Recent Members</CardTitle>
                            <CardDescription>Newest additions</CardDescription>
                        </div>
                        <Link href="/members">
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentMembers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No members yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {recentMembers.map((m) => (
                                    <Link
                                        key={m.id}
                                        href={`/members/${m.id}`}
                                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-medium">
                                            {m.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{m.name}</p>
                                            <p className="text-xs text-slate-500">Joined {m.joinDate}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Pending Follow-ups Alert */}
            {stats.pendingFollowups > 0 && (
                <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {stats.pendingFollowups} Scheduled Follow-up{stats.pendingFollowups !== 1 ? 's' : ''}
                                </p>
                                <p className="text-sm text-slate-500">Members awaiting pastoral care</p>
                            </div>
                        </div>
                        <Link href="/shepherding">
                            <Button variant="outline" size="sm">View All</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
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

function QuickAction({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
            <Icon className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
        </Link>
    )
}
