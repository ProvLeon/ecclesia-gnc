import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wallet, CalendarCheck, TrendingUp } from 'lucide-react'

const stats = [
    {
        name: 'Total Members',
        value: '0',
        change: '+0%',
        changeType: 'neutral' as const,
        icon: Users,
        description: 'Active church members',
    },
    {
        name: 'This Month Tithes',
        value: 'GH₵ 0.00',
        change: '+0%',
        changeType: 'neutral' as const,
        icon: Wallet,
        description: 'Collected this month',
    },
    {
        name: 'Last Sunday Attendance',
        value: '0',
        change: '+0%',
        changeType: 'neutral' as const,
        icon: CalendarCheck,
        description: 'Members attended',
    },
    {
        name: 'New Members',
        value: '0',
        change: '+0',
        changeType: 'neutral' as const,
        icon: TrendingUp,
        description: 'This month',
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Welcome to Ecclesia — Church Management System
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {stat.name}
                            </CardTitle>
                            <stat.icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stat.value}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
                        <CardDescription>Common tasks you perform frequently</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <QuickActionButton icon={Users} label="Add Member" href="/members/new" />
                        <QuickActionButton icon={Wallet} label="Record Tithe" href="/finance/tithes/new" />
                        <QuickActionButton icon={CalendarCheck} label="Mark Attendance" href="/attendance/new" />
                        <QuickActionButton icon={TrendingUp} label="Send SMS" href="/messages/new" />
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
                        <CardDescription>Latest actions in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <p className="text-sm">No recent activity</p>
                            <p className="text-xs mt-1">Activities will appear here as you use the system</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function QuickActionButton({
    icon: Icon,
    label,
    href
}: {
    icon: React.ElementType
    label: string
    href: string
}) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </span>
        </a>
    )
}
