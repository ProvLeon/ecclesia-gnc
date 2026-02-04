import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Download, Users, Wallet, CalendarCheck, Heart, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

const reportCategories = [
    {
        title: 'Membership',
        icon: Users,
        reports: [
            { label: 'Member Directory', href: '/reports/members', desc: 'Full list of all members' },
            { label: 'New Members', href: '/reports/members/new', desc: 'Monthly new member report' },
            { label: 'Birthdays This Month', href: '/reports/members/birthdays', desc: 'Upcoming celebrations' },
            { label: 'Inactive Members', href: '/reports/members/inactive', desc: 'Members needing outreach' },
        ],
    },
    {
        title: 'Financial',
        icon: Wallet,
        reports: [
            { label: 'Monthly Summary', href: '/reports/finance', desc: 'Income and expenses overview' },
            { label: 'Tithe Report', href: '/reports/finance/tithes', desc: 'Individual tithe records' },
            { label: 'Offering Analysis', href: '/reports/finance/offerings', desc: 'Offering trends by type' },
            { label: 'Expense Report', href: '/reports/finance/expenses', desc: 'Detailed expense breakdown' },
        ],
    },
    {
        title: 'Attendance',
        icon: CalendarCheck,
        reports: [
            { label: 'Weekly Report', href: '/reports/attendance', desc: 'Service attendance summary' },
            { label: 'Attendance Trends', href: '/reports/attendance/trends', desc: 'Monthly patterns' },
            { label: 'Absentees', href: '/reports/attendance/absentees', desc: 'Members missing services' },
            { label: 'Service Comparison', href: '/reports/attendance/comparison', desc: 'Compare service types' },
        ],
    },
    {
        title: 'Pastoral Care',
        icon: Heart,
        reports: [
            { label: 'Follow-up Summary', href: '/reports/shepherding', desc: 'Pastoral visit activity' },
            { label: 'Overdue Visits', href: '/reports/shepherding/overdue', desc: 'Needs urgent attention' },
            { label: 'Shepherd Activity', href: '/reports/shepherding/shepherds', desc: 'Team performance' },
        ],
    },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and analyze church data</p>
                </div>
                <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />Scheduled Reports
                </Button>
            </div>

            {/* Quick Export */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="py-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Download className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">Quick Export</h3>
                                <p className="text-sm text-slate-500">Download data in CSV format</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                                <FileText className="h-4 w-4 mr-2" />All Members
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                                <FileText className="h-4 w-4 mr-2" />Tithes ({new Date().getFullYear()})
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900">
                                <FileText className="h-4 w-4 mr-2" />Attendance
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Categories */}
            <div className="grid gap-6 md:grid-cols-2">
                {reportCategories.map((cat) => (
                    <Card key={cat.title} className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                    <cat.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <CardTitle className="text-base font-medium">{cat.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-1">
                            {cat.reports.map((r) => (
                                <Link
                                    key={r.href}
                                    href={r.href}
                                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors"
                                >
                                    <div>
                                        <span className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                            {r.label}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Coming Soon */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="py-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Advanced Analytics Coming Soon</h3>
                            <p className="text-sm text-slate-500">Interactive charts, trend analysis, and custom report builder</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
